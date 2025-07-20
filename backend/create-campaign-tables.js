/**
 * Create Campaign Management Tables
 * Run this to add campaign functionality to your database
 */

require('dotenv').config();
const { getDB, connectDatabase } = require('./config/database');

async function createCampaignTables() {
  console.log('🗄️ Creating campaign management tables...');
  
  try {
    await connectDatabase();
    const db = getDB();

    // Create campaigns table
    await db.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        message_template TEXT NOT NULL,
        target_audience JSONB,
        schedule_type VARCHAR(50) DEFAULT 'immediate',
        scheduled_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        launched_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_by INTEGER REFERENCES users(id)
      )
    `);

    // Create campaign_messages table
    await db.query(`
      CREATE TABLE IF NOT EXISTS campaign_messages (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
        contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
        message_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        sent_at TIMESTAMP,
        delivered_at TIMESTAMP,
        read_at TIMESTAMP,
        clicked BOOLEAN DEFAULT FALSE,
        replied BOOLEAN DEFAULT FALSE,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(campaign_id, contact_id)
      )
    `);

    // Create campaign_templates table
    await db.query(`
      CREATE TABLE IF NOT EXISTS campaign_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        template_type VARCHAR(50) DEFAULT 'text',
        content TEXT NOT NULL,
        variables JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create campaign_analytics table
    await db.query(`
      CREATE TABLE IF NOT EXISTS campaign_analytics (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(10,2),
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index for campaign_analytics
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_metric
      ON campaign_analytics(campaign_id, metric_name)
    `);

    // Add stage column to contacts if not exists
    await db.query(`
      ALTER TABLE contacts 
      ADD COLUMN IF NOT EXISTS stage VARCHAR(50) DEFAULT 'new'
    `);

    // Add budget column to contacts if not exists
    await db.query(`
      ALTER TABLE contacts 
      ADD COLUMN IF NOT EXISTS budget INTEGER
    `);

    // Add location column to contacts if not exists
    await db.query(`
      ALTER TABLE contacts 
      ADD COLUMN IF NOT EXISTS location VARCHAR(255)
    `);

    console.log('✅ Campaign tables created successfully!');

    // Insert sample campaign templates
    await insertSampleTemplates(db);

    console.log('✅ Sample campaign templates added!');

  } catch (error) {
    console.error('❌ Error creating campaign tables:', error);
    throw error;
  }
}

async function insertSampleTemplates(db) {
  const templates = [
    {
      name: 'Welcome New Lead',
      category: 'welcome',
      content: '🏠 Welcome to PropConnect, {name}! We have amazing properties in {location} within your budget of {budget}. Would you like to see our latest listings?',
      variables: ['name', 'location', 'budget']
    },
    {
      name: 'Property Showcase',
      category: 'property',
      content: '🏡 New Property Alert! Beautiful {property_type} in {location} for {price}. Features: {features}. Interested in a viewing?',
      variables: ['property_type', 'location', 'price', 'features']
    },
    {
      name: 'Follow Up',
      category: 'follow_up',
      content: 'Hi {name}! Just checking in about the {property_type} you viewed last week. Any questions? Ready to make an offer?',
      variables: ['name', 'property_type']
    },
    {
      name: 'Price Drop Alert',
      category: 'promotion',
      content: '🔥 PRICE DROP ALERT! The {property_type} in {location} you liked is now {new_price} (was {old_price}). Limited time offer!',
      variables: ['property_type', 'location', 'new_price', 'old_price']
    },
    {
      name: 'Appointment Reminder',
      category: 'reminder',
      content: '📅 Reminder: Your property viewing is scheduled for {date} at {time}. Address: {address}. See you there!',
      variables: ['date', 'time', 'address']
    }
  ];

  for (const template of templates) {
    await db.query(`
      INSERT INTO campaign_templates (name, category, content, variables)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
    `, [template.name, template.category, template.content, JSON.stringify(template.variables)]);
  }
}

// Run the script
if (require.main === module) {
  createCampaignTables()
    .then(() => {
      console.log('🎉 Campaign system setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createCampaignTables };
