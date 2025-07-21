/**
 * WhatsApp Webhook Routes
 * 
 * This file handles all WhatsApp Business API interactions:
 * 1. Webhook verification (required by Meta)
 * 2. Receiving incoming messages from customers
 * 3. Sending outgoing messages to customers
 * 4. Processing different message types (text, images, buttons)
 */

const express = require('express');
const axios = require('axios');
const { getDB } = require('../config/database');
const router = express.Router();

// WhatsApp API configuration
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

/**
 * WEBHOOK VERIFICATION (GET request)
 * 
 * When you set up the webhook in Meta Developer Console, 
 * Meta sends a GET request to verify your webhook URL.
 * 
 * This is a one-time verification process.
 */
router.get('/', (req, res) => {
  console.log('📞 Webhook verification request received');

  // Parse query parameters
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('🔍 Verification details:', { mode, token, challenge });
  console.log('🔑 Expected verify token:', VERIFY_TOKEN);
  console.log('🔑 Received verify token:', token);
  console.log('🔍 Token match:', token === VERIFY_TOKEN);

  // Check if mode and token are correct
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    console.log('❌ Mode check:', mode === 'subscribe');
    console.log('❌ Token check:', token === VERIFY_TOKEN);
    res.status(403).send('Forbidden');
  }
});

/**
 * WEBHOOK MESSAGE HANDLER (POST request)
 * 
 * This receives all incoming messages from WhatsApp users.
 * Every time someone sends a message to your WhatsApp Business number,
 * Meta sends a POST request to this endpoint.
 */
router.post('/', async (req, res) => {
  console.log('📨 Incoming webhook data:', JSON.stringify(req.body, null, 2));
  
  try {
    const body = req.body;
    
    // Verify this is a WhatsApp Business Account webhook
    if (body.object !== 'whatsapp_business_account') {
      console.log('⚠️ Not a WhatsApp webhook, ignoring');
      return res.status(200).send('OK');
    }
    
    // Process each entry in the webhook
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        
        // Handle incoming messages
        if (change.value.messages) {
          for (const message of change.value.messages) {
            await handleIncomingMessage(message, change.value);
          }
        }
        
        // Handle message status updates (delivered, read, etc.)
        if (change.value.statuses) {
          for (const status of change.value.statuses) {
            await handleMessageStatus(status);
          }
        }
      }
    }
    
    // Always respond with 200 OK to acknowledge receipt
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * HANDLE INCOMING MESSAGE
 * 
 * This is where the magic happens! When a customer sends a message,
 * we process it and decide how to respond.
 */
async function handleIncomingMessage(message, webhookValue) {
  console.log('📥 Processing incoming message:', message);

  const customerPhone = message.from;
  const messageId = message.id;
  const timestamp = message.timestamp;

  try {
    // Get or create customer record
    const customer = await getOrCreateCustomer(customerPhone, webhookValue);

    // Save the incoming message to database
    const savedMessage = await saveMessage({
      contact_id: customer.id,
      message_id: messageId,
      direction: 'inbound',
      message_type: message.type,
      content: getMessageContent(message),
      whatsapp_status: 'received',
      timestamp: new Date(parseInt(timestamp) * 1000)
    });

    // Emit real-time update to frontend
    const io = global.io;
    if (io) {
      io.emit('new-message', {
        conversationId: customer.id,
        message: savedMessage,
        customer: customer
      });

      // Send notification to all connected users
      io.emit('new-notification', {
        type: 'new_message',
        title: 'New WhatsApp Message',
        message: `New message from ${customer.name || customer.phone}`,
        timestamp: new Date().toISOString()
      });
    }

    // Process the message based on type and customer stage
    await processMessage(customer, message);

    // Auto-respond based on business logic
    await handleAutoResponse(customer, message);

  } catch (error) {
    console.error('❌ Error handling incoming message:', error);
  }
}

/**
 * GET OR CREATE CUSTOMER
 * 
 * When someone messages us for the first time, we create a new contact record.
 * If they've messaged before, we retrieve their existing record.
 */
async function getOrCreateCustomer(phone, webhookValue) {
  const db = getDB();
  
  try {
    // Try to find existing customer
    const existingCustomer = await db.query(
      'SELECT * FROM contacts WHERE phone = $1',
      [phone]
    );
    
    if (existingCustomer.rows.length > 0) {
      console.log('👤 Found existing customer:', phone);
      
      // Update last contact time
      await db.query(
        'UPDATE contacts SET last_contact_at = CURRENT_TIMESTAMP WHERE phone = $1',
        [phone]
      );
      
      return existingCustomer.rows[0];
    }
    
    // Create new customer
    console.log('🆕 Creating new customer:', phone);
    
    // Try to get customer name from WhatsApp profile
    const customerName = webhookValue.contacts?.[0]?.profile?.name || null;
    
    const newCustomer = await db.query(`
      INSERT INTO contacts (phone, name, stage, source, created_at, last_contact_at)
      VALUES ($1, $2, 'new', 'whatsapp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [phone, customerName]);
    
    console.log('✅ New customer created:', newCustomer.rows[0]);
    return newCustomer.rows[0];
    
  } catch (error) {
    console.error('❌ Error getting/creating customer:', error);
    throw error;
  }
}

/**
 * PROCESS MESSAGE
 * 
 * This determines how to respond based on:
 * 1. Customer's current stage (new, qualifying, viewing, etc.)
 * 2. Message content
 * 3. Message type (text, button click, etc.)
 */
async function processMessage(customer, message) {
  console.log(`🤖 Processing message for customer ${customer.phone} (stage: ${customer.stage})`);
  
  const messageText = getMessageContent(message);
  
  try {
    switch (customer.stage) {
      case 'new':
        await handleNewCustomer(customer, messageText);
        break;
        
      case 'qualifying':
        await handleQualificationResponse(customer, message);
        break;
        
      case 'viewing_properties':
        await handlePropertyInquiry(customer, messageText);
        break;
        
      case 'scheduling':
        await handleSchedulingResponse(customer, messageText);
        break;
        
      default:
        await sendTextMessage(customer.phone, 
          "Hi! Thanks for your message. Let me connect you with one of our agents who will help you shortly. 😊"
        );
    }
    
  } catch (error) {
    console.error('❌ Error processing message:', error);
    
    // Send error message to customer
    await sendTextMessage(customer.phone, 
      "Sorry, I'm having some technical difficulties. Please try again in a moment or contact our support team."
    );
  }
}

/**
 * HANDLE NEW CUSTOMER
 * 
 * When someone messages us for the first time, we send a welcome message
 * and start the qualification process.
 */
async function handleNewCustomer(customer, messageText) {
  console.log('👋 Handling new customer:', customer.phone);
  
  // Send welcome message with interactive buttons
  await sendInteractiveMessage(customer.phone, {
    type: 'button',
    body: {
      text: `Hello! 👋 Welcome to PropConnect Real Estate.\n\nI'm here to help you find your perfect property in Cameroon. To get started, what are you looking for?`
    },
    action: {
      buttons: [
        {
          type: 'reply',
          reply: { id: 'buy', title: '🏠 Buy Property' }
        },
        {
          type: 'reply', 
          reply: { id: 'rent', title: '🏡 Rent Property' }
        },
        {
          type: 'reply',
          reply: { id: 'invest', title: '💰 Investment' }
        }
      ]
    }
  });
  
  // Update customer stage
  await updateCustomerStage(customer.id, 'qualifying');
}

/**
 * SEND TEXT MESSAGE
 * 
 * Send a simple text message to a WhatsApp number
 */
async function sendTextMessage(to, text) {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: text }
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Text message sent successfully:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error sending text message:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * SEND INTERACTIVE MESSAGE
 * 
 * Send messages with buttons, lists, or other interactive elements
 */
async function sendInteractiveMessage(to, interactive) {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'interactive',
        interactive: interactive
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Interactive message sent successfully:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error sending interactive message:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * UTILITY FUNCTIONS
 */

// Extract text content from different message types
function getMessageContent(message) {
  switch (message.type) {
    case 'text':
      return message.text.body;
    case 'interactive':
      return message.interactive.button_reply?.title || message.interactive.list_reply?.title;
    case 'button':
      return message.button.text;
    default:
      return `[${message.type} message]`;
  }
}

// Save message to database
async function saveMessage(messageData) {
  const db = getDB();
  await db.query(`
    INSERT INTO conversations (contact_id, message_id, direction, message_type, content, whatsapp_status, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
  `, [
    messageData.contact_id,
    messageData.message_id,
    messageData.direction,
    messageData.message_type,
    messageData.content,
    messageData.whatsapp_status
  ]);
}

// Update customer stage
async function updateCustomerStage(customerId, newStage) {
  const db = getDB();
  await db.query(
    'UPDATE contacts SET stage = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [newStage, customerId]
  );
}

// Handle message status updates (delivered, read, etc.)
async function handleMessageStatus(status) {
  console.log('📊 Message status update:', status);

  const db = getDB();
  const messageId = status.id;
  const statusType = status.status; // 'sent', 'delivered', 'read', 'failed'
  const timestamp = new Date(parseInt(status.timestamp) * 1000);

  try {
    // Update message status in conversations table
    await db.query(
      'UPDATE conversations SET whatsapp_status = $1, status_updated_at = $2 WHERE message_id = $3',
      [statusType, timestamp, messageId]
    );

    // Update campaign message status if this is a campaign message
    await db.query(`
      UPDATE campaign_messages
      SET status = $1,
          ${statusType}_at = $2
      WHERE message_id = $3
    `, [statusType, timestamp, messageId]);

    // Emit real-time status update to frontend
    const io = global.io;
    if (io) {
      io.emit('message-status-update', {
        messageId,
        status: statusType,
        timestamp: timestamp.toISOString()
      });
    }

    // Log analytics for campaign tracking
    if (statusType === 'read') {
      await recordCampaignAnalytic(messageId, 'read_rate', 1);
    } else if (statusType === 'delivered') {
      await recordCampaignAnalytic(messageId, 'delivery_rate', 1);
    }

    console.log(`✅ Updated message ${messageId} status to ${statusType}`);

  } catch (error) {
    console.error('❌ Error updating message status:', error);
  }
}

// Record campaign analytics
async function recordCampaignAnalytic(messageId, metricName, value) {
  try {
    const db = getDB();

    // Find campaign for this message
    const campaign = await db.query(`
      SELECT cm.campaign_id
      FROM campaign_messages cm
      WHERE cm.message_id = $1
    `, [messageId]);

    if (campaign.rows.length > 0) {
      await db.query(`
        INSERT INTO campaign_analytics (campaign_id, metric_name, metric_value)
        VALUES ($1, $2, $3)
      `, [campaign.rows[0].campaign_id, metricName, value]);
    }
  } catch (error) {
    console.error('❌ Error recording campaign analytics:', error);
  }
}

// Placeholder functions (we'll implement these in the next phase)
async function handleQualificationResponse(customer, message) {
  console.log('🔍 Handling qualification response (placeholder)');
  await sendTextMessage(customer.phone, "Thanks for that information! Let me find some properties for you...");
}

async function handlePropertyInquiry(customer, messageText) {
  console.log('🏠 Handling property inquiry (placeholder)');
  await sendTextMessage(customer.phone, "I'll show you some great properties shortly!");
}

async function handleSchedulingResponse(customer, messageText) {
  console.log('📅 Handling scheduling response (placeholder)');
  await sendTextMessage(customer.phone, "Great! I'll help you schedule a viewing.");
}

/**
 * SEND MESSAGE TO CONTACT
 * POST /api/whatsapp/send-message
 *
 * Sends a WhatsApp message to a specific contact
 */
router.post('/send-message', async (req, res) => {
  try {
    const { contactId, message, messageType = 'text' } = req.body;

    if (!contactId || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Contact ID and message are required'
      });
    }

    const db = getDB();

    // Get contact phone number
    const contactResult = await db.query(
      'SELECT phone, name FROM contacts WHERE id = $1',
      [contactId]
    );

    if (contactResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Contact not found',
        message: 'No contact found with the specified ID'
      });
    }

    const contact = contactResult.rows[0];
    const phoneNumber = contact.phone.replace(/^\+/, ''); // Remove + prefix

    // Prepare WhatsApp message
    const whatsappMessage = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: messageType,
      text: {
        body: message
      }
    };

    console.log(`📤 Sending WhatsApp message to ${contact.name} (${contact.phone})`);

    // Send message via WhatsApp API
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      whatsappMessage,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const messageId = response.data.messages[0].id;

    // Store message in database
    await db.query(`
      INSERT INTO conversations (
        contact_id, message_id, direction, message_type, content,
        whatsapp_status, created_at
      ) VALUES ($1, $2, 'outbound', $3, $4, 'sent', CURRENT_TIMESTAMP)
    `, [contactId, messageId, messageType, message]);

    // Update contact's last_contact_at
    await db.query(
      'UPDATE contacts SET last_contact_at = CURRENT_TIMESTAMP WHERE id = $1',
      [contactId]
    );

    console.log(`✅ Message sent successfully! Message ID: ${messageId}`);

    res.json({
      message: 'Message sent successfully',
      messageId,
      contact: {
        id: contactId,
        name: contact.name,
        phone: contact.phone
      }
    });

  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);

    if (error.response) {
      console.error('📋 WhatsApp API Error:', error.response.data);
      return res.status(error.response.status).json({
        error: 'WhatsApp API Error',
        message: error.response.data.error?.message || 'Failed to send message'
      });
    }

    res.status(500).json({
      error: 'Failed to send message',
      message: 'Unable to send WhatsApp message'
    });
  }
});

/**
 * SEND PROPERTY TO CONTACT
 * POST /api/whatsapp/send-property
 *
 * Sends property details to a contact via WhatsApp
 */
router.post('/send-property', async (req, res) => {
  try {
    const { contactId, propertyId, message } = req.body;

    if (!contactId || !propertyId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Contact ID and Property ID are required'
      });
    }

    const db = getDB();

    // Get contact and property details
    const contactResult = await db.query(
      'SELECT phone, name FROM contacts WHERE id = $1',
      [contactId]
    );

    const propertyResult = await db.query(
      'SELECT title, price, address, city, bedrooms, bathrooms, area_sqm FROM properties WHERE id = $1',
      [propertyId]
    );

    if (contactResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Contact not found',
        message: 'No contact found with the specified ID'
      });
    }

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Property not found',
        message: 'No property found with the specified ID'
      });
    }

    const contact = contactResult.rows[0];
    const property = propertyResult.rows[0];
    const phoneNumber = contact.phone.replace(/^\+/, ''); // Remove + prefix

    // Format property details message
    const propertyMessage = message || `🏠 *${property.title}*

💰 Prix: ${new Intl.NumberFormat('fr-FR').format(property.price)} XAF
📍 Adresse: ${property.address}, ${property.city}
${property.bedrooms ? `🛏️ Chambres: ${property.bedrooms}` : ''}
${property.bathrooms ? `🚿 Salles de bain: ${property.bathrooms}` : ''}
${property.area_sqm ? `📐 Surface: ${property.area_sqm} m²` : ''}

Intéressé(e)? Contactez-nous pour plus d'informations ou pour programmer une visite!`;

    // Prepare WhatsApp message
    const whatsappMessage = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: {
        body: propertyMessage
      }
    };

    console.log(`🏠 Sending property ${property.title} to ${contact.name} (${contact.phone})`);

    // Send message via WhatsApp API
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      whatsappMessage,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const messageId = response.data.messages[0].id;

    // Store message in database
    await db.query(`
      INSERT INTO conversations (
        contact_id, message_id, direction, message_type, content,
        whatsapp_status, created_at
      ) VALUES ($1, $2, 'outbound', 'text', $3, 'sent', CURRENT_TIMESTAMP)
    `, [contactId, messageId, propertyMessage]);

    // Store property match
    await db.query(`
      INSERT INTO property_matches (
        contact_id, property_id, match_score, sent_at, status
      ) VALUES ($1, $2, 100, CURRENT_TIMESTAMP, 'sent')
      ON CONFLICT (contact_id, property_id)
      DO UPDATE SET sent_at = CURRENT_TIMESTAMP, status = 'sent'
    `, [contactId, propertyId]);

    // Update contact's last_contact_at
    await db.query(
      'UPDATE contacts SET last_contact_at = CURRENT_TIMESTAMP WHERE id = $1',
      [contactId]
    );

    console.log(`✅ Property sent successfully! Message ID: ${messageId}`);

    res.json({
      message: 'Property sent successfully',
      messageId,
      property: {
        id: propertyId,
        title: property.title
      },
      contact: {
        id: contactId,
        name: contact.name,
        phone: contact.phone
      }
    });

  } catch (error) {
    console.error('❌ Error sending property:', error);

    if (error.response) {
      console.error('📋 WhatsApp API Error:', error.response.data);
      return res.status(error.response.status).json({
        error: 'WhatsApp API Error',
        message: error.response.data.error?.message || 'Failed to send property'
      });
    }

    res.status(500).json({
      error: 'Failed to send property',
      message: 'Unable to send property via WhatsApp'
    });
  }
});

// =============================================================================
// AUTO-RESPONSE SYSTEM
// =============================================================================

/**
 * Send welcome message to new customers
 */
async function sendWelcomeMessage(phone) {
  const welcomeMessage = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'interactive',
    interactive: {
      type: 'button',
      header: {
        type: 'text',
        text: '🏠 Welcome to PropConnect!'
      },
      body: {
        text: 'Hello! I\'m your personal real estate assistant. I can help you:\n\n🔍 Find properties\n📅 Schedule viewings\n💰 Get price information\n📞 Connect with agents\n\nHow can I assist you today?'
      },
      footer: {
        text: 'PropConnect - Your Real Estate Partner'
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: { id: 'browse_properties', title: '🏠 Browse Properties' }
          },
          {
            type: 'reply',
            reply: { id: 'schedule_visit', title: '📅 Schedule Visit' }
          },
          {
            type: 'reply',
            reply: { id: 'speak_agent', title: '👨‍💼 Speak to Agent' }
          }
        ]
      }
    }
  };

  await sendWhatsAppMessage(welcomeMessage);
}

/**
 * Send property list message
 */
async function sendPropertyListMessage(phone) {
  const propertyMessage = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'interactive',
    interactive: {
      type: 'list',
      header: { type: 'text', text: '🏠 Available Properties' },
      body: { text: 'Here are our featured properties. Select one to learn more:' },
      footer: { text: 'PropConnect Real Estate' },
      action: {
        button: 'View Properties',
        sections: [
          {
            title: 'Apartments',
            rows: [
              { id: 'apt_001', title: '3BR Modern Apartment', description: 'XAF 45M - Douala, Bonanjo' },
              { id: 'apt_002', title: '2BR Luxury Apartment', description: 'XAF 35M - Yaoundé, Bastos' }
            ]
          },
          {
            title: 'Houses',
            rows: [
              { id: 'house_001', title: '4BR Family House', description: 'XAF 75M - Douala, Bonapriso' },
              { id: 'house_002', title: '5BR Executive Villa', description: 'XAF 120M - Yaoundé, Odza' }
            ]
          }
        ]
      }
    }
  };

  await sendWhatsAppMessage(propertyMessage);
}

/**
 * Send helpful default response
 */
async function sendHelpfulResponse(phone) {
  const helpMessage = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'text',
    text: {
      body: '🤔 I\'m here to help! You can ask me about:\n\n🏠 "Show me properties"\n💰 "What are the prices?"\n📅 "Schedule a visit"\n👨‍💼 "Contact an agent"\n\nWhat would you like to know?'
    }
  };

  await sendWhatsAppMessage(helpMessage);
}

/**
 * Generic WhatsApp message sender
 */
async function sendWhatsAppMessage(messageData) {
  try {
    await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      messageData,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error.response?.data || error.message);
  }
}

/**
 * Update customer stage in database
 */
async function updateCustomerStage(customerId, stage) {
  const db = getDB();
  await db.query(
    'UPDATE contacts SET stage = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [stage, customerId]
  );
}

module.exports = router;
