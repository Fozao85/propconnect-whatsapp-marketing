# PropConnect - WhatsApp Real Estate Marketing Platform

A comprehensive WhatsApp marketing platform specifically designed for real estate professionals.

## 🎯 What This Project Does

PropConnect helps real estate agents and agencies:
- **Capture leads** through WhatsApp from ads, QR codes, and website
- **Qualify prospects** automatically with smart conversation flows
- **Match properties** to customer preferences using AI
- **Schedule viewings** and manage appointments
- **Track performance** with detailed analytics
- **Manage contacts** and conversations in one dashboard

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   WhatsApp      │    │   Node.js API    │    │   PostgreSQL    │
│   Business API  │◄──►│   + Express      │◄──►│   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   React          │
                    │   Dashboard      │
                    └──────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - API server
- **PostgreSQL** - Database for contacts, properties, conversations
- **WhatsApp Business API** - Message sending/receiving
- **JWT** - Authentication
- **Socket.io** - Real-time updates

### Frontend  
- **React** + **Vite** - Dashboard interface
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **Chart.js** - Analytics visualization

### Deployment
- **Railway** - Backend hosting
- **Vercel** - Frontend hosting
- **Cloudinary** - Media storage

## 📚 Learning Journey

This project is built with detailed explanations for learning WhatsApp marketing:

1. **WhatsApp Business API fundamentals**
2. **Webhook handling and message processing**
3. **Real estate lead qualification strategies**
4. **Property matching algorithms**
5. **Conversation flow design**
6. **Analytics and performance tracking**

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/propconnect.git

# Install backend dependencies
cd propconnect/backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your WhatsApp API credentials

# Start development servers
npm run dev
```

## 📖 Documentation

- [WhatsApp Marketing Basics](./docs/whatsapp-marketing-basics.md)
- [API Documentation](./docs/api-documentation.md)
- [Database Schema](./docs/database-schema.md)
- [Deployment Guide](./docs/deployment-guide.md)

## 🎯 Target Market

- **Real estate agents** in emerging markets
- **Property agencies** looking to scale
- **Real estate developers** marketing new projects
- **Property investment companies**

## 📊 Key Features

### For Real Estate Agents
- ✅ Automated lead qualification
- ✅ Property recommendation engine
- ✅ Appointment scheduling
- ✅ Contact management
- ✅ Performance analytics

### For Customers
- ✅ Instant property search via WhatsApp
- ✅ Personalized recommendations
- ✅ Virtual tour links
- ✅ Easy appointment booking
- ✅ Document sharing

## 🌍 Market Focus

Initially targeting **Cameroon** and **West African** real estate markets, with plans to expand globally.

## 📈 Business Model

- **SaaS subscriptions** for real estate agencies
- **Per-agent pricing** for individual professionals
- **Transaction fees** for successful deals
- **Premium features** for advanced analytics

## 🤝 Contributing

This is a learning project! Contributions and feedback are welcome.

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for real estate professionals who want to leverage WhatsApp marketing effectively.**
