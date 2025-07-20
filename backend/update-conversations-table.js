/**
 * Update Conversations Table Script
 * 
 * Adds the read_at column to the conversations table
 */

require('dotenv').config();
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function updateConversationsTable() {
  console.log('🔧 Updating conversations table...');
  
  try {
    // Add read_at column if it doesn't exist
    await pool.query(`
      ALTER TABLE conversations 
      ADD COLUMN IF NOT EXISTS read_at TIMESTAMP
    `);
    
    console.log('✅ Conversations table updated successfully!');
    console.log('📊 Added read_at column for message read tracking');
    
  } catch (error) {
    console.error('❌ Error updating conversations table:', error.message);
  } finally {
    await pool.end();
  }
}

updateConversationsTable();
