/**
 * Campaign Management Routes
 * Handle WhatsApp marketing campaigns for real estate
 */

const express = require('express');
const { getDB } = require('../config/database');
const axios = require('axios');
const router = express.Router();

// WhatsApp API configuration
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

/**
 * GET /api/campaigns
 * Get all marketing campaigns
 */
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const campaigns = await db.query(`
      SELECT 
        c.*,
        COUNT(cm.id) as total_recipients,
        COUNT(CASE WHEN cm.status = 'sent' THEN 1 END) as sent_count,
        COUNT(CASE WHEN cm.status = 'delivered' THEN 1 END) as delivered_count,
        COUNT(CASE WHEN cm.status = 'read' THEN 1 END) as read_count,
        COUNT(CASE WHEN cm.status = 'failed' THEN 1 END) as failed_count
      FROM campaigns c
      LEFT JOIN campaign_messages cm ON c.id = cm.campaign_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    res.json(campaigns.rows);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

/**
 * POST /api/campaigns
 * Create new marketing campaign
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, message_template, target_audience, schedule_type, scheduled_at } = req.body;
    const db = getDB();

    // Create campaign
    const campaign = await db.query(`
      INSERT INTO campaigns (
        name, description, message_template, target_audience, 
        schedule_type, scheduled_at, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'draft', CURRENT_TIMESTAMP)
      RETURNING *
    `, [name, description, message_template, target_audience, schedule_type, scheduled_at]);

    res.json(campaign.rows[0]);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

/**
 * POST /api/campaigns/:id/launch
 * Launch a marketing campaign
 */
router.post('/:id/launch', async (req, res) => {
  try {
    const campaignId = req.params.id;
    const db = getDB();

    // Get campaign details
    const campaign = await db.query('SELECT * FROM campaigns WHERE id = $1', [campaignId]);
    if (campaign.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaignData = campaign.rows[0];

    // Get target contacts based on audience criteria
    const contacts = await getTargetContacts(campaignData.target_audience);

    // Update campaign status
    await db.query(
      'UPDATE campaigns SET status = $1, launched_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['active', campaignId]
    );

    // Send messages to all contacts
    const results = await sendCampaignMessages(campaignId, campaignData.message_template, contacts);

    res.json({
      message: 'Campaign launched successfully',
      campaign_id: campaignId,
      total_recipients: contacts.length,
      results
    });

  } catch (error) {
    console.error('Error launching campaign:', error);
    res.status(500).json({ error: 'Failed to launch campaign' });
  }
});

/**
 * POST /api/campaigns/preview-audience
 * Preview target audience for campaign
 */
router.post('/preview-audience', async (req, res) => {
  try {
    const { target_audience } = req.body;
    const contacts = await getTargetContacts(target_audience);
    res.json(contacts);
  } catch (error) {
    console.error('Error previewing audience:', error);
    res.status(500).json({ error: 'Failed to preview audience' });
  }
});

/**
 * GET /api/campaigns/:id/analytics
 * Get campaign performance analytics
 */
router.get('/:id/analytics', async (req, res) => {
  try {
    const campaignId = req.params.id;
    const db = getDB();

    // Get campaign analytics
    const analytics = await db.query(`
      SELECT 
        c.name,
        c.launched_at,
        COUNT(cm.id) as total_sent,
        COUNT(CASE WHEN cm.status = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN cm.status = 'read' THEN 1 END) as read,
        COUNT(CASE WHEN cm.status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN cm.clicked = true THEN 1 END) as clicked,
        COUNT(CASE WHEN cm.replied = true THEN 1 END) as replied
      FROM campaigns c
      LEFT JOIN campaign_messages cm ON c.id = cm.campaign_id
      WHERE c.id = $1
      GROUP BY c.id, c.name, c.launched_at
    `, [campaignId]);

    if (analytics.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const data = analytics.rows[0];
    const deliveryRate = data.total_sent > 0 ? (data.delivered / data.total_sent * 100).toFixed(2) : 0;
    const readRate = data.delivered > 0 ? (data.read / data.delivered * 100).toFixed(2) : 0;
    const clickRate = data.total_sent > 0 ? (data.clicked / data.total_sent * 100).toFixed(2) : 0;
    const replyRate = data.total_sent > 0 ? (data.replied / data.total_sent * 100).toFixed(2) : 0;

    res.json({
      ...data,
      delivery_rate: parseFloat(deliveryRate),
      read_rate: parseFloat(readRate),
      click_rate: parseFloat(clickRate),
      reply_rate: parseFloat(replyRate)
    });

  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * Helper: Get target contacts based on audience criteria
 */
async function getTargetContacts(audienceCriteria) {
  const db = getDB();
  
  let query = 'SELECT * FROM contacts WHERE 1=1';
  const params = [];
  
  if (audienceCriteria.stage) {
    query += ' AND stage = $' + (params.length + 1);
    params.push(audienceCriteria.stage);
  }
  
  if (audienceCriteria.location) {
    query += ' AND location ILIKE $' + (params.length + 1);
    params.push(`%${audienceCriteria.location}%`);
  }
  
  if (audienceCriteria.budget_min) {
    query += ' AND budget >= $' + (params.length + 1);
    params.push(audienceCriteria.budget_min);
  }
  
  if (audienceCriteria.budget_max) {
    query += ' AND budget <= $' + (params.length + 1);
    params.push(audienceCriteria.budget_max);
  }
  
  query += ' AND phone IS NOT NULL ORDER BY last_contact_at DESC';
  
  const result = await db.query(query, params);
  return result.rows;
}

/**
 * Helper: Send campaign messages to contacts
 */
async function sendCampaignMessages(campaignId, messageTemplate, contacts) {
  const results = {
    sent: 0,
    failed: 0,
    errors: []
  };

  for (const contact of contacts) {
    try {
      // Personalize message template
      const personalizedMessage = personalizeMessage(messageTemplate, contact);
      
      // Send WhatsApp message
      const response = await axios.post(
        `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: contact.phone,
          type: 'text',
          text: { body: personalizedMessage }
        },
        {
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const messageId = response.data.messages[0].id;

      // Save campaign message record
      const db = getDB();
      await db.query(`
        INSERT INTO campaign_messages (
          campaign_id, contact_id, message_id, status, sent_at
        ) VALUES ($1, $2, $3, 'sent', CURRENT_TIMESTAMP)
      `, [campaignId, contact.id, messageId]);

      results.sent++;
      
      // Wait between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`Failed to send to ${contact.phone}:`, error.response?.data || error.message);
      results.failed++;
      results.errors.push({
        contact: contact.phone,
        error: error.response?.data || error.message
      });
    }
  }

  return results;
}

/**
 * Helper: Personalize message template with contact data
 */
function personalizeMessage(template, contact) {
  return template
    .replace(/\{name\}/g, contact.name || 'there')
    .replace(/\{first_name\}/g, contact.name?.split(' ')[0] || 'there')
    .replace(/\{phone\}/g, contact.phone)
    .replace(/\{location\}/g, contact.location || 'your area')
    .replace(/\{budget\}/g, contact.budget ? `XAF ${contact.budget.toLocaleString()}` : 'your budget');
}

module.exports = router;
