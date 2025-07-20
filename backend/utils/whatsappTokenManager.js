/**
 * WhatsApp Token Management Utility
 * 
 * Learning Objectives:
 * - Understand token lifecycle management
 * - Handle token expiry gracefully
 * - Implement automatic token refresh
 * - Monitor token health
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class WhatsAppTokenManager {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.apiUrl = process.env.WHATSAPP_API_URL;
    this.tokenExpiresAt = process.env.WHATSAPP_TOKEN_EXPIRES_AT;
  }

  /**
   * Check if current token is valid
   * Learning: How to validate API tokens
   */
  async isTokenValid() {
    try {
      console.log('🔍 Checking WhatsApp token validity...');
      
      const response = await axios.get(
        `${this.apiUrl}/${this.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          },
          timeout: 10000
        }
      );

      console.log('✅ Token is valid!');
      console.log('📱 Phone Number Info:', {
        id: response.data.id,
        display_phone_number: response.data.display_phone_number,
        verified_name: response.data.verified_name
      });

      await this.updateTokenStatus('VALID');
      return true;

    } catch (error) {
      console.log('❌ Token validation failed:', error.response?.data || error.message);
      await this.updateTokenStatus('EXPIRED');
      return false;
    }
  }

  /**
   * Update token status in environment
   * Learning: How to manage configuration dynamically
   */
  async updateTokenStatus(status) {
    try {
      const envPath = path.join(__dirname, '../.env');
      let envContent = await fs.readFile(envPath, 'utf8');
      
      // Update token status
      envContent = envContent.replace(
        /WHATSAPP_TOKEN_STATUS=.*/,
        `WHATSAPP_TOKEN_STATUS=${status}`
      );
      
      // Update timestamp
      envContent = envContent.replace(
        /WHATSAPP_TOKEN_EXPIRES_AT=.*/,
        `WHATSAPP_TOKEN_EXPIRES_AT=${new Date().toISOString()}`
      );
      
      await fs.writeFile(envPath, envContent);
      console.log(`📝 Updated token status to: ${status}`);
      
    } catch (error) {
      console.error('❌ Failed to update token status:', error.message);
    }
  }

  /**
   * Get fresh token instructions
   * Learning: How to guide users through token refresh
   */
  getTokenRefreshInstructions() {
    return {
      message: '🔄 Your WhatsApp token has expired. Here\'s how to get a new one:',
      steps: [
        '1. Go to Meta Developer Console: https://developers.facebook.com/',
        '2. Select your PropConnect app',
        '3. Go to WhatsApp > Getting Started',
        '4. Copy the new Access Token',
        '5. Update WHATSAPP_ACCESS_TOKEN in your .env file',
        '6. Restart your server'
      ],
      quickLink: 'https://developers.facebook.com/apps/1401322174311422/whatsapp-business/wa-dev-console/',
      tokenLocation: 'WhatsApp > Getting Started > Access Token'
    };
  }

  /**
   * Test message sending capability
   * Learning: How to test API functionality
   */
  async testMessageSending(testPhoneNumber = null) {
    const isValid = await this.isTokenValid();
    
    if (!isValid) {
      const instructions = this.getTokenRefreshInstructions();
      console.log('\n' + instructions.message);
      instructions.steps.forEach(step => console.log(step));
      console.log(`\n🔗 Quick Link: ${instructions.quickLink}`);
      return false;
    }

    if (!testPhoneNumber) {
      console.log('✅ Token is valid and ready for message sending!');
      console.log('💡 To test actual sending, provide a phone number');
      return true;
    }

    try {
      console.log(`📤 Testing message send to ${testPhoneNumber}...`);
      
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: testPhoneNumber,
          type: 'text',
          text: {
            body: '🎉 Test message from PropConnect CRM! Your WhatsApp integration is working perfectly.'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Test message sent successfully!');
      console.log('📋 Message ID:', response.data.messages[0].id);
      return true;

    } catch (error) {
      console.log('❌ Test message failed:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Monitor token health
   * Learning: How to implement health checks
   */
  async monitorTokenHealth() {
    console.log('\n🔍 WhatsApp Token Health Check');
    console.log('================================');
    
    const isValid = await this.isTokenValid();
    
    if (isValid) {
      console.log('🟢 Status: HEALTHY');
      console.log('✅ Ready to send/receive messages');
    } else {
      console.log('🔴 Status: EXPIRED');
      console.log('❌ Token needs refresh');
      
      const instructions = this.getTokenRefreshInstructions();
      console.log('\n📋 Next Steps:');
      instructions.steps.forEach((step, index) => {
        console.log(`   ${step}`);
      });
    }
    
    return isValid;
  }

  /**
   * Generate webhook verification response
   * Learning: How webhook verification works
   */
  verifyWebhook(mode, token, challenge) {
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
    
    console.log('🔍 Webhook verification attempt:');
    console.log('   Mode:', mode);
    console.log('   Token provided:', token);
    console.log('   Expected token:', verifyToken);
    
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✅ Webhook verification successful!');
      return challenge;
    } else {
      console.log('❌ Webhook verification failed!');
      return null;
    }
  }
}

module.exports = WhatsAppTokenManager;
