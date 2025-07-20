# WhatsApp Marketing Basics for Real Estate

## 📱 Understanding WhatsApp Business API

### What is WhatsApp Business API?
The WhatsApp Business API is a powerful tool that allows businesses to:
- Send and receive messages programmatically
- Handle conversations at scale
- Integrate with existing business systems
- Provide automated customer support

### Key Concepts

#### 1. Phone Number Requirements
- You need a **dedicated phone number** for WhatsApp Business API
- Cannot use the same number for regular WhatsApp
- Must be verified and approved by Meta (Facebook)

#### 2. Message Types
```javascript
// Text Message
{
  "messaging_product": "whatsapp",
  "to": "1234567890",
  "type": "text",
  "text": { "body": "Hello! Welcome to our real estate service." }
}

// Interactive Message (Buttons)
{
  "messaging_product": "whatsapp", 
  "to": "1234567890",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "body": { "text": "Are you looking to buy or rent?" },
    "action": {
      "buttons": [
        { "type": "reply", "reply": { "id": "buy", "title": "Buy" }},
        { "type": "reply", "reply": { "id": "rent", "title": "Rent" }}
      ]
    }
  }
}

// Media Message (Images, Videos, Documents)
{
  "messaging_product": "whatsapp",
  "to": "1234567890", 
  "type": "image",
  "image": {
    "link": "https://example.com/property-photo.jpg",
    "caption": "Beautiful 3-bedroom apartment in Douala"
  }
}
```

#### 3. Webhooks - How You Receive Messages
When someone sends you a message, WhatsApp sends a POST request to your webhook URL:

```javascript
// Incoming message webhook payload
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "1234567890",
          "id": "message_id",
          "timestamp": "1234567890",
          "text": { "body": "I'm interested in buying a house" },
          "type": "text"
        }]
      }
    }]
  }]
}
```

## 🏡 Real Estate Marketing Strategies

### 1. Lead Generation Channels

#### Facebook/Instagram Ads → WhatsApp
```html
<!-- Click-to-WhatsApp Ad -->
<a href="https://wa.me/237123456789?text=Hi%20I%27m%20interested%20in%20your%20properties">
  Chat with Agent on WhatsApp
</a>
```

#### QR Codes on Property Signs
```
Generate QR code that opens WhatsApp with:
"Hi, I saw your property sign at [Location]. Can you tell me more?"
```

#### Website Integration
```javascript
// WhatsApp chat widget
<script>
  function openWhatsApp() {
    window.open('https://wa.me/237123456789?text=Hi%20I%20need%20help%20finding%20a%20property');
  }
</script>
```

### 2. Lead Qualification Process

#### Stage 1: Initial Contact
```
Customer: "Hi, I'm looking for a house"
Bot: "Hello! 👋 Welcome to DreamHomes. I'm here to help you find your perfect property. 

To get started, are you looking to:
1️⃣ Buy
2️⃣ Rent  
3️⃣ Invest"
```

#### Stage 2: Gather Requirements
```
Bot: "Great choice! To find the best options for you, I need a few details:

📍 Which area are you interested in?
💰 What's your budget range?
🏠 How many bedrooms do you need?
📅 When do you need to move in?"
```

#### Stage 3: Property Matching
```
Bot: "Perfect! Based on your preferences, I found 3 properties that match:

🏠 Property 1: 3BR Apartment in Bonanjo
💰 Price: 180,000 XAF/month
📍 Location: 5 mins from city center
📷 [Property Images]
🗓️ Available: Next week

Would you like to schedule a viewing? 📅"
```

### 3. Conversation Flow Design

#### Linear Flow (Simple)
```
Welcome → Qualification → Property Match → Booking → Follow-up
```

#### Branching Flow (Advanced)
```
Welcome
├── Buy
│   ├── Budget < 50M → Show affordable options
│   └── Budget > 50M → Show premium options
└── Rent
    ├── Short-term → Show furnished options
    └── Long-term → Show unfurnished options
```

### 4. Message Templates

WhatsApp requires pre-approved templates for business-initiated conversations:

#### Welcome Template
```
Hello {{1}}! 👋

Welcome to {{2}} Real Estate. We help you find your dream property in Cameroon.

Reply with:
• BUY - if you want to purchase
• RENT - if you want to rent
• INFO - for more information

We're here to help! 🏠
```

#### Appointment Reminder Template
```
Hi {{1}}! 

Reminder: Your property viewing is scheduled for {{2}} at {{3}}.

📍 Location: {{4}}
👤 Agent: {{5}}
📞 Contact: {{6}}

Reply CONFIRM to confirm or RESCHEDULE to change timing.
```

## 📊 Analytics & KPIs

### Key Metrics to Track

1. **Lead Generation**
   - Click-to-WhatsApp rate from ads
   - QR code scans
   - Website chat initiations

2. **Engagement**
   - Message open rates (usually 98%+ on WhatsApp)
   - Response rates
   - Conversation completion rates

3. **Conversion**
   - Qualified leads percentage
   - Viewing booking rate
   - Sale/rental conversion rate

4. **Performance**
   - Average response time
   - Agent productivity
   - Customer satisfaction scores

### Sample Analytics Dashboard
```javascript
const analytics = {
  totalLeads: 150,
  qualifiedLeads: 89,
  viewingsBooked: 34,
  salesClosed: 8,
  conversionRate: '23.5%',
  avgResponseTime: '2.3 minutes',
  customerSatisfaction: 4.7
};
```

## 🔧 Technical Implementation

### Basic Webhook Handler
```javascript
app.post('/webhook', (req, res) => {
  const body = req.body;
  
  if (body.object === 'whatsapp_business_account') {
    body.entry.forEach(entry => {
      entry.changes.forEach(change => {
        if (change.value.messages) {
          change.value.messages.forEach(message => {
            handleIncomingMessage(message);
          });
        }
      });
    });
  }
  
  res.status(200).send('OK');
});
```

### Message Processing
```javascript
async function handleIncomingMessage(message) {
  const customerPhone = message.from;
  const messageText = message.text?.body;
  
  // Get or create customer record
  const customer = await getOrCreateCustomer(customerPhone);
  
  // Process based on conversation stage
  switch (customer.stage) {
    case 'new':
      await sendWelcomeMessage(customerPhone);
      break;
    case 'qualifying':
      await processQualificationResponse(customerPhone, messageText);
      break;
    case 'viewing_properties':
      await handlePropertyInquiry(customerPhone, messageText);
      break;
  }
}
```

This foundation will help you understand how WhatsApp marketing works before we dive into building our PropConnect platform! 

Ready to move to the next phase? 🚀
