# WhatsApp Business API Setup Guide

## 🎯 What You Need to Get

From Meta Developer Console, you need these 4 credentials:

1. **META_APP_ID** - Your app's unique identifier
2. **META_APP_SECRET** - Your app's secret key  
3. **WHATSAPP_PHONE_NUMBER_ID** - Test phone number for WhatsApp
4. **WHATSAPP_ACCESS_TOKEN** - Token to access WhatsApp API

## 📱 Step-by-Step Setup

### Step 1: Access Meta Developer Console
1. Go to: https://developers.facebook.com/apps/
2. Sign in with your Facebook account
3. You should see your app (the one you created)

### Step 2: Get App ID and App Secret
1. Click on your app
2. In the left sidebar, click **"Settings"** → **"Basic"**
3. Copy these values:
   - **App ID**: A number like `1234567890123456`
   - **App Secret**: Click "Show" and copy the secret

### Step 3: Add WhatsApp Product
1. In the left sidebar, click **"Add Product"**
2. Find **"WhatsApp"** and click **"Set Up"**
3. This adds WhatsApp functionality to your app

### Step 4: Get WhatsApp Credentials
1. In the left sidebar, click **"WhatsApp"** → **"API Setup"**
2. You'll see:
   - **Phone Number ID**: A number like `987654321098765`
   - **Temporary Access Token**: A long string starting with `EAA...`

### Step 5: Update Your .env File
Once you have all 4 values, update your `.env` file:

```bash
# Meta App Configuration
META_APP_ID=your_actual_app_id_here
META_APP_SECRET=your_actual_app_secret_here

# WhatsApp Business API Configuration
WHATSAPP_PHONE_NUMBER_ID=your_actual_phone_number_id_here
WHATSAPP_ACCESS_TOKEN=your_actual_access_token_here
```

## 🧪 Testing Your Setup

After updating the .env file, run:
```bash
node test-whatsapp.js
```

You should see:
- ✅ WhatsApp API connection successful!
- Phone number information
- Ready to send/receive messages

## 📋 Important Notes

### Test vs Production
- **Test Mode**: Uses Meta's test phone number (free, limited)
- **Production**: Requires business verification (takes 1-2 weeks)

### Access Token Expiry
- **Temporary tokens** expire in 24 hours
- **Permanent tokens** require app review
- For development, temporary tokens are fine

### Webhook Setup (Later)
- For receiving messages, you need a public URL
- We'll use ngrok for local development
- Production needs HTTPS webhook URL

## 🔧 Troubleshooting

### "Invalid OAuth access token"
- Token expired (get a new one)
- Wrong token format
- Token doesn't have WhatsApp permissions

### "Phone Number ID not found"
- Wrong Phone Number ID
- WhatsApp product not added to app
- Using production ID in test mode

### "App not found"
- Wrong App ID
- App doesn't exist
- Not logged in to correct Facebook account

## 🚀 Next Steps

Once WhatsApp API is working:
1. Test sending messages
2. Set up webhook for receiving messages
3. Build the frontend dashboard
4. Test complete conversation flows

## 📞 Need Help?

If you get stuck:
1. Check Meta's WhatsApp API documentation
2. Verify all credentials are copied correctly
3. Make sure WhatsApp product is added to your app
4. Try generating new access tokens
