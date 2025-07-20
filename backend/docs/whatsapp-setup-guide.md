# 📱 WhatsApp Business API Setup Guide

## 🎯 Learning Objectives
By following this guide, you'll learn:
- How to set up Meta Developer Console
- WhatsApp Business API configuration
- Webhook setup and verification
- Token management and security
- Real message testing

## 📋 Prerequisites
- Meta (Facebook) account
- Phone number for business verification
- PropConnect backend running locally
- ngrok installed (for webhook testing)

## 🚀 Step-by-Step Setup

### Step 1: Meta Developer Console Setup

1. **Go to Meta Developer Console**
   - Visit: https://developers.facebook.com/
   - Click "Get Started" or "My Apps"
   - Log in with your Facebook account

2. **Create New App**
   - Click "Create App"
   - Select "Business" as app type
   - Fill in app details:
     - App Name: "PropConnect CRM"
     - App Contact Email: your email
     - Business Account: Create new or select existing

3. **Add WhatsApp Product**
   - In your app dashboard, click "Add Product"
   - Find "WhatsApp" and click "Set Up"
   - This adds WhatsApp Business API to your app

### Step 2: WhatsApp Configuration

1. **Get Started with WhatsApp**
   - In WhatsApp section, click "Get Started"
   - You'll see the API setup page

2. **Add Phone Number**
   - Click "Add phone number"
   - Enter your business phone number
   - Verify with SMS/call
   - **Important**: This number will be your WhatsApp Business number

3. **Get Your Credentials**
   - **Phone Number ID**: Found in WhatsApp > Getting Started
   - **Access Token**: Temporary token (24 hours) or permanent token
   - **App ID**: Found in App Settings > Basic
   - **App Secret**: Found in App Settings > Basic

### Step 3: Webhook Configuration

1. **Configure Webhook URL**
   - In WhatsApp > Configuration
   - Set Webhook URL: `https://your-ngrok-url.ngrok.io/api/webhook`
   - Set Verify Token: `my_webhook_verify_token_123`
   - Subscribe to: `messages` field

2. **Webhook Fields**
   Subscribe to these webhook fields:
   - ✅ messages (incoming messages)
   - ✅ message_deliveries (delivery status)
   - ✅ message_reads (read receipts)
   - ✅ message_reactions (reactions)

### Step 4: Generate Permanent Access Token

**Temporary Token (24 hours)**
- Available immediately in Getting Started
- Good for testing and development

**Permanent Token (No expiry)**
- Requires System User creation
- Go to Business Settings > System Users
- Create system user with WhatsApp permissions
- Generate permanent token

### Step 5: Test Configuration

1. **Test API Connection**
```bash
curl -X GET "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

2. **Send Test Message**
```bash
curl -X POST "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "YOUR_TEST_NUMBER",
    "type": "text",
    "text": {"body": "Hello from PropConnect!"}
  }'
```

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit tokens to git
   - Use .env file for credentials
   - Rotate tokens regularly

2. **Webhook Security**
   - Use HTTPS for webhook URL
   - Verify webhook signatures
   - Validate incoming requests

3. **Token Management**
   - Use permanent tokens for production
   - Monitor token expiry
   - Have backup authentication methods

## 🚨 Common Issues & Solutions

### Issue 1: Token Expired
**Error**: "Session has expired"
**Solution**: Generate new access token from Meta Console

### Issue 2: Webhook Verification Failed
**Error**: "Webhook verification failed"
**Solution**: 
- Check webhook URL is accessible
- Verify token matches exactly
- Ensure HTTPS is used

### Issue 3: Phone Number Not Verified
**Error**: "Phone number not verified"
**Solution**: Complete phone verification in Meta Console

### Issue 4: Message Sending Failed
**Error**: "Recipient phone number not valid"
**Solution**: 
- Use international format (+1234567890)
- Ensure recipient has WhatsApp
- Check phone number permissions

## 📚 Next Steps

After completing this setup:
1. Update your .env file with new credentials
2. Test webhook with ngrok
3. Send real messages through PropConnect
4. Monitor message delivery status
5. Handle incoming messages

## 🔗 Useful Links

- [Meta Developer Console](https://developers.facebook.com/)
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Webhook Setup Guide](https://developers.facebook.com/docs/whatsapp/webhooks)
- [ngrok Download](https://ngrok.com/download)

---
**💡 Pro Tip**: Start with the temporary token for learning, then upgrade to permanent token for production use.
