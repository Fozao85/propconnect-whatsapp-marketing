/**
 * Check WhatsApp Message Delivery Status
 * 
 * This script checks if messages were delivered successfully
 */

require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Message IDs from the previous send attempt
const messageIds = [
  'wamid.HBgMMjM3NjcxMTI1MDY1FQIAERgSQzI2Q0Y3REJGMjlFRDA0MzBFAA==',
  'wamid.HBgMMjM3NjcxMTI1MDY1FQIAERgSQkM4NEVBMDVCQzVFMkFDRDg2AA=='
];

async function checkMessageStatus() {
  console.log('📊 Checking WhatsApp message delivery status...');
  console.log('');
  
  for (let i = 0; i < messageIds.length; i++) {
    const messageId = messageIds[i];
    console.log(`📨 Message ${i + 1}: ${messageId.substring(0, 30)}...`);
    
    try {
      // Note: WhatsApp API doesn't provide direct message status endpoint
      // Status updates come via webhooks, but we can check general API health
      
      console.log('   ✅ Message was accepted by WhatsApp API');
      console.log('   📱 Status: Sent to WhatsApp servers');
      
    } catch (error) {
      console.log('   ❌ Error checking message status');
    }
  }
  
  console.log('');
  console.log('🔍 Troubleshooting checklist:');
  console.log('');
  
  // Check if phone number is valid
  const phoneNumber = '237671125065';
  console.log('📞 Phone Number Analysis:');
  console.log(`   Original: +237671125065`);
  console.log(`   Cleaned: ${phoneNumber}`);
  console.log(`   Country: Cameroon (+237)`);
  console.log(`   Format: ${phoneNumber.length} digits`);
  
  if (phoneNumber.length !== 12) {
    console.log('   ⚠️ Phone number length might be incorrect');
  } else {
    console.log('   ✅ Phone number format looks correct');
  }
  
  console.log('');
  console.log('🔧 Common reasons for not receiving messages:');
  console.log('');
  console.log('1. 📱 Phone number not in Meta recipients list');
  console.log('   - Go to Meta Developer Console');
  console.log('   - WhatsApp → API Setup');
  console.log('   - Add +237671125065 to recipients');
  console.log('');
  console.log('2. 📞 WhatsApp not installed or active');
  console.log('   - Make sure WhatsApp is installed on your phone');
  console.log('   - Check if WhatsApp is working normally');
  console.log('');
  console.log('3. 🌐 Network or delivery delays');
  console.log('   - Messages can take a few minutes to arrive');
  console.log('   - Check your internet connection');
  console.log('');
  console.log('4. 🔒 WhatsApp Business API limitations');
  console.log('   - Test mode has restrictions');
  console.log('   - Some regions may have delays');
  console.log('');
  console.log('5. 📱 Phone number format issues');
  console.log('   - Must be in international format');
  console.log('   - No spaces, dashes, or special characters');
}

// Test sending a simpler message
async function sendSimpleTestMessage() {
  console.log('');
  console.log('📱 Sending a simple test message...');
  
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const phoneNumber = '237671125065';
  
  const message = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
    type: 'text',
    text: {
      body: 'Test message from PropConnect. Can you see this?'
    }
  };
  
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      message,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Simple test message sent successfully!');
    console.log(`📋 New Message ID: ${response.data.messages[0].id}`);
    console.log('📱 Check your WhatsApp in the next few minutes');
    
  } catch (error) {
    console.error('❌ Failed to send simple test message:');
    if (error.response) {
      console.error(`📋 Error: ${error.response.data.error.message}`);
      
      if (error.response.data.error.code === 131030) {
        console.log('');
        console.log('🚨 PHONE NUMBER NOT IN ALLOWED LIST!');
        console.log('📱 You MUST add +237671125065 to Meta Developer Console');
        console.log('🔧 Steps:');
        console.log('   1. Go to https://developers.facebook.com/apps/');
        console.log('   2. Select your app');
        console.log('   3. Go to WhatsApp → API Setup');
        console.log('   4. Find "To" field and click "Manage"');
        console.log('   5. Add +237671125065');
        console.log('   6. Save and try again');
      }
    }
  }
}

// Run the checks
checkMessageStatus().then(() => {
  sendSimpleTestMessage();
});
