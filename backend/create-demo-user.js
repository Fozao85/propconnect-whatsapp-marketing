/**
 * Create Demo User Script
 * 
 * Creates a demo user for testing the application
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function createDemoUser() {
  console.log('🔧 Creating demo user...');
  
  try {
    // Hash the demo password
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    // Check if demo user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['demo@propconnect.com']
    );
    
    if (existingUser.rows.length > 0) {
      console.log('✅ Demo user already exists!');
      console.log('📧 Email: demo@propconnect.com');
      console.log('🔑 Password: demo123');
      return;
    }
    
    // Create demo user
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, phone, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, first_name, last_name, email, role`,
      ['Demo', 'User', 'demo@propconnect.com', hashedPassword, 'agent', '+237670337798']
    );
    
    const user = result.rows[0];
    
    console.log('✅ Demo user created successfully!');
    console.log('👤 User Details:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.first_name} ${user.last_name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   📧 Email: demo@propconnect.com');
    console.log('   🔑 Password: demo123');
    console.log('');
    console.log('🎉 You can now login to the dashboard!');
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error.message);
  } finally {
    await pool.end();
  }
}

createDemoUser();
