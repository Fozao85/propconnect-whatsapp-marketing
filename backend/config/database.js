/**
 * Database Configuration for PropConnect
 *
 * This file handles:
 * 1. PostgreSQL connection setup
 * 2. Database table creation
 * 3. Connection pooling for performance
 * 4. Error handling for database operations
 */

const { Pool } = require('pg');

// Database connection pool
// A pool manages multiple database connections for better performance
let pool;

/**
 * Connect to PostgreSQL Database
 * Creates connection pool and tests the connection
 */
async function connectDatabase() {
  try {
    // Check if we have a DATABASE_URL (Render provides this)
    if (process.env.DATABASE_URL) {
      console.log('🔗 Using DATABASE_URL connection string...');

      // Create connection pool with connection string
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
    } else {
      // Fallback to individual parameters for local development
      console.log('🔗 Using individual database parameters...');

      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'propconnect',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres123',

        // Connection pool settings
        max: 20,          // Maximum number of connections
        idleTimeoutMillis: 30000,  // Close idle connections after 30 seconds
        connectionTimeoutMillis: 2000,  // Timeout after 2 seconds if can't connect
      };

      pool = new Pool(dbConfig);
    }

    // Test the connection
    const client = await pool.connect();
    console.log('🔗 Testing database connection...');

    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log(`📅 Database time: ${result.rows[0].current_time}`);

    client.release(); // Return connection to pool

    // Create tables if they don't exist
    await createTables();

    return pool;

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

/**
 * Create Database Tables
 * This creates all the tables we need for our WhatsApp real estate platform
 */
async function createTables() {
  console.log('📋 Creating database tables...');
  
  try {
    // Users table - for real estate agents/admins
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) DEFAULT 'agent',
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Contacts table - for potential customers
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(200),
        email VARCHAR(255),
        
        -- Lead qualification data
        intent VARCHAR(50), -- 'buy', 'rent', 'invest'
        budget_min INTEGER,
        budget_max INTEGER,
        preferred_location VARCHAR(200),
        property_type VARCHAR(100), -- 'apartment', 'house', 'land', etc.
        bedrooms INTEGER,
        move_in_date DATE,
        
        -- Lead status and tracking
        stage VARCHAR(50) DEFAULT 'new', -- 'new', 'qualified', 'viewing', 'negotiating', 'closed'
        source VARCHAR(100), -- 'facebook_ad', 'qr_code', 'website', 'referral'
        assigned_agent_id INTEGER REFERENCES users(id),
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_contact_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Properties table - real estate listings
    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        description TEXT,
        
        -- Property details
        property_type VARCHAR(100) NOT NULL, -- 'apartment', 'house', 'land', 'commercial'
        transaction_type VARCHAR(50) NOT NULL, -- 'sale', 'rent'
        price INTEGER NOT NULL,
        currency VARCHAR(10) DEFAULT 'XAF',
        
        -- Location
        address TEXT,
        city VARCHAR(100),
        region VARCHAR(100),
        country VARCHAR(100) DEFAULT 'Cameroon',
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        
        -- Property features
        bedrooms INTEGER,
        bathrooms INTEGER,
        area_sqm INTEGER,
        furnished BOOLEAN DEFAULT false,
        parking BOOLEAN DEFAULT false,
        security BOOLEAN DEFAULT false,
        
        -- Media and documents
        images TEXT[], -- Array of image URLs
        virtual_tour_url VARCHAR(500),
        documents TEXT[], -- Array of document URLs
        
        -- Status and ownership
        status VARCHAR(50) DEFAULT 'available', -- 'available', 'pending', 'sold', 'rented'
        owner_id INTEGER REFERENCES users(id),
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Conversations table - WhatsApp message history
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
        
        -- Message details
        message_id VARCHAR(100) UNIQUE, -- WhatsApp message ID
        direction VARCHAR(20) NOT NULL, -- 'inbound' or 'outbound'
        message_type VARCHAR(50) NOT NULL, -- 'text', 'image', 'document', 'interactive'
        content TEXT,
        media_url VARCHAR(500),
        
        -- WhatsApp specific
        whatsapp_status VARCHAR(50), -- 'sent', 'delivered', 'read', 'failed'
        
        -- Context and automation
        context JSONB, -- Store conversation context as JSON
        is_automated BOOLEAN DEFAULT false,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP
      );
    `);
    
    // Property matches table - track which properties were shown to which contacts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS property_matches (
        id SERIAL PRIMARY KEY,
        contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        
        -- Matching details
        match_score INTEGER, -- 0-100 score of how well property matches preferences
        shown_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Customer response
        customer_interest VARCHAR(50), -- 'interested', 'not_interested', 'maybe', 'viewed'
        feedback TEXT,
        
        -- Follow-up
        viewing_scheduled BOOLEAN DEFAULT false,
        viewing_date TIMESTAMP,
        
        UNIQUE(contact_id, property_id)
      );
    `);
    
    // Campaigns table - marketing campaigns and broadcasts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        
        -- Campaign details
        campaign_type VARCHAR(50) NOT NULL, -- 'broadcast', 'follow_up', 'nurture'
        target_audience JSONB, -- Criteria for targeting contacts
        message_template TEXT NOT NULL,
        
        -- Scheduling
        scheduled_at TIMESTAMP,
        sent_at TIMESTAMP,
        
        -- Performance tracking
        total_sent INTEGER DEFAULT 0,
        total_delivered INTEGER DEFAULT 0,
        total_read INTEGER DEFAULT 0,
        total_replied INTEGER DEFAULT 0,
        
        -- Status
        status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'completed'
        created_by INTEGER REFERENCES users(id),
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Customer notes table - for tracking customer interactions and notes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customer_notes (
        id SERIAL PRIMARY KEY,
        contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
        note TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'note',
        created_by INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Customer activities table - for comprehensive activity tracking
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customer_activities (
        id SERIAL PRIMARY KEY,
        contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
        activity_type VARCHAR(50) NOT NULL,
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ All database tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  }
}

/**
 * Get database connection from pool
 * Use this for running queries
 */
function getDB() {
  if (!pool) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return pool;
}

/**
 * Close database connection
 * Call this when shutting down the server
 */
async function closeDatabase() {
  if (pool) {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

module.exports = {
  connectDatabase,
  getDB,
  closeDatabase
};
