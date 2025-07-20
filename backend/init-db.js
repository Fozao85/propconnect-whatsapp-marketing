/**
 * Database Initialization Script for Render Deployment
 * This script creates all necessary tables and initial data
 */

const { Pool } = require('pg');

async function initializeDatabase() {
  console.log('🔄 Initializing database...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // Create tables
    console.log('📋 Creating tables...');
    
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'agent',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Contacts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(255),
        stage VARCHAR(50) DEFAULT 'new',
        location VARCHAR(255),
        budget_min INTEGER,
        budget_max INTEGER,
        property_type VARCHAR(100),
        notes TEXT,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Properties table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        location VARCHAR(255) NOT NULL,
        property_type VARCHAR(100) NOT NULL,
        bedrooms INTEGER,
        bathrooms INTEGER,
        area_sqm INTEGER,
        images TEXT[],
        status VARCHAR(50) DEFAULT 'available',
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Conversations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        contact_id INTEGER REFERENCES contacts(id),
        whatsapp_id VARCHAR(255),
        last_message TEXT,
        last_message_time TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id),
        message_id VARCHAR(255),
        sender VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'sent'
      );
    `);

    // Campaign templates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS campaign_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        message_template TEXT NOT NULL,
        variables TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Campaigns table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        template_id INTEGER REFERENCES campaign_templates(id),
        target_audience JSONB,
        status VARCHAR(50) DEFAULT 'draft',
        scheduled_for TIMESTAMP,
        sent_count INTEGER DEFAULT 0,
        delivered_count INTEGER DEFAULT 0,
        read_count INTEGER DEFAULT 0,
        reply_count INTEGER DEFAULT 0,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Database tables created successfully!');

    // Insert sample data
    console.log('📝 Inserting sample data...');
    
    // Insert default user
    await pool.query(`
      INSERT INTO users (email, password_hash, name, role) 
      VALUES ('admin@propconnect.com', '$2b$10$rQZ9QmjqjKJH.uJvK8K8KuGKz9QmjqjKJH.uJvK8K8Ku', 'Admin User', 'admin')
      ON CONFLICT (email) DO NOTHING;
    `);

    // Insert campaign templates
    const templates = [
      {
        name: 'Property Introduction',
        category: 'property_showcase',
        message: 'Hello {{name}}! 🏠 I have an amazing {{property_type}} in {{location}} that matches your budget of {{budget}}. Would you like to see photos?',
        variables: ['name', 'property_type', 'location', 'budget']
      },
      {
        name: 'Follow Up',
        category: 'follow_up',
        message: 'Hi {{name}}! Just following up on the {{property_type}} property I showed you. Any questions? I\'m here to help! 😊',
        variables: ['name', 'property_type']
      }
    ];

    for (const template of templates) {
      await pool.query(`
        INSERT INTO campaign_templates (name, category, message_template, variables)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING;
      `, [template.name, template.category, template.message, template.variables]);
    }

    console.log('✅ Sample data inserted successfully!');
    console.log('🎉 Database initialization complete!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run initialization if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database ready for production!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
