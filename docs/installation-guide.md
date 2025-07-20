# PropConnect Installation Guide

## 🎯 Prerequisites Check

### ✅ Already Installed
- Node.js v22.15.0
- npm v10.9.2

### ❌ Need to Install
- PostgreSQL
- Meta Developer Account Setup

## 📦 PostgreSQL Installation (Windows)

### Why PostgreSQL?
PostgreSQL is a powerful, reliable database that will store:
- **Customer contacts** and their preferences
- **Property listings** with details and images
- **Conversation history** for context
- **Analytics data** for performance tracking

### Installation Steps:

1. **Download PostgreSQL**
   - Go to: https://www.postgresql.org/download/windows/
   - Click "Download the installer"
   - Choose the latest version (15.x or 16.x)
   - Download the Windows x86-64 installer

2. **Run the Installer**
   - Run the downloaded .exe file as Administrator
   - Click "Next" through the welcome screens
   - **Installation Directory**: Keep default (C:\Program Files\PostgreSQL\16)
   - **Components**: Keep all selected (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools)
   - **Data Directory**: Keep default
   - **Password**: Set a strong password for the 'postgres' user (REMEMBER THIS!)
   - **Port**: Keep default (5432)
   - **Locale**: Keep default
   - Click "Next" and "Install"

3. **Verify Installation**
   ```bash
   # Open Command Prompt and run:
   psql --version
   
   # Should show something like:
   # psql (PostgreSQL) 16.1
   ```

4. **Test Database Connection**
   ```bash
   # Connect to PostgreSQL (will ask for password)
   psql -U postgres -h localhost
   
   # If successful, you'll see:
   # postgres=#
   
   # Type \q to quit
   ```

### Create PropConnect Database
```sql
-- Connect to PostgreSQL as postgres user
psql -U postgres -h localhost

-- Create our database
CREATE DATABASE propconnect;

-- Create a user for our application
CREATE USER propconnect_user WITH PASSWORD 'your_secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE propconnect TO propconnect_user;

-- Exit
\q
```

## 🔧 Meta Developer Account Setup

### Why Meta Developer Account?
To use WhatsApp Business API, you need:
- **App ID** and **App Secret** from Meta
- **WhatsApp Business Account** verification
- **Phone number** for WhatsApp Business

### Setup Steps:

1. **Create Meta Developer Account**
   - Go to: https://developers.facebook.com/
   - Click "Get Started"
   - Log in with Facebook account (or create one)
   - Complete developer verification

2. **Create a New App**
   - Click "Create App"
   - Choose "Business" as app type
   - App Name: "PropConnect WhatsApp Bot"
   - Contact Email: Your email
   - Click "Create App"

3. **Add WhatsApp Product**
   - In your app dashboard, click "Add Product"
   - Find "WhatsApp" and click "Set Up"
   - This will give you access to WhatsApp Business API

4. **Get Your Credentials**
   You'll need these for your .env file:
   ```
   META_APP_ID=your_app_id_here
   META_APP_SECRET=your_app_secret_here
   WHATSAPP_ACCESS_TOKEN=temporary_token_from_meta
   WHATSAPP_PHONE_NUMBER_ID=test_phone_number_id
   ```

### Important Notes:
- **Test Mode**: Initially, you'll use Meta's test phone number
- **Production**: Later, you'll need to verify your own business phone number
- **Webhook**: We'll set this up when we deploy our backend

## 🛠️ Development Tools (Optional but Recommended)

### 1. pgAdmin (Database Management)
- Comes with PostgreSQL installation
- Visual interface for managing databases
- Access via: http://localhost/pgAdmin4

### 2. Postman (API Testing)
- Download from: https://www.postman.com/downloads/
- Test WhatsApp API calls
- Debug webhook responses

### 3. VS Code Extensions
If using VS Code, install these extensions:
- **PostgreSQL** by Chris Kolkman
- **REST Client** by Huachao Mao
- **Thunder Client** (Postman alternative)

## 🚀 Project Setup

### 1. Clone/Create Project Structure
```bash
# Navigate to your practice folder
cd c:\practice

# Create PropConnect project
mkdir propconnect
cd propconnect

# Create backend and frontend folders
mkdir backend frontend docs
```

### 2. Initialize Backend
```bash
cd backend
npm init -y
npm install express cors helmet morgan dotenv pg bcryptjs jsonwebtoken axios multer cloudinary socket.io node-cron joi uuid
npm install -D nodemon jest supertest
```

### 3. Initialize Frontend
```bash
cd ../frontend
npm create vite@latest . -- --template react
npm install axios @tanstack/react-query socket.io-client chart.js react-chartjs-2 date-fns react-hook-form react-hot-toast lucide-react framer-motion @headlessui/react clsx
npm install -D tailwindcss autoprefixer postcss
```

### 4. Environment Configuration
```bash
# In backend folder
cp .env.example .env

# Edit .env with your actual values:
# - Database connection details
# - Meta app credentials
# - JWT secret (generate a random string)
```

## 🔍 Verification Checklist

Before proceeding to development:

- [ ] PostgreSQL installed and running
- [ ] Can connect to database with psql
- [ ] PropConnect database created
- [ ] Meta Developer account created
- [ ] WhatsApp product added to Meta app
- [ ] Got App ID, App Secret, and temporary access token
- [ ] Project folders created
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Environment variables configured

## 🆘 Troubleshooting

### PostgreSQL Issues
```bash
# If psql command not found, add to PATH:
# Add C:\Program Files\PostgreSQL\16\bin to Windows PATH

# If connection refused:
# Check if PostgreSQL service is running in Windows Services
```

### Meta/WhatsApp Issues
- **App Review**: For production, Meta reviews your app (takes 1-2 weeks)
- **Phone Number**: Test with Meta's test number first
- **Webhooks**: Need HTTPS URL (we'll use ngrok for development)

### Node.js Issues
```bash
# Clear npm cache if installation fails
npm cache clean --force

# Use specific Node version if needed
nvm use 18.17.0
```

## 📞 Next Steps

Once everything is installed:
1. **Database Schema**: Create tables for contacts, properties, conversations
2. **Basic Server**: Set up Express server with WhatsApp webhook
3. **Authentication**: User login system for real estate agents
4. **WhatsApp Integration**: Send/receive messages
5. **Frontend Dashboard**: React app for managing contacts and properties

Ready to start building! 🚀
