/**
 * Add Sample Data Script
 * 
 * Adds sample contacts and properties to the database for testing
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

async function addSampleData() {
  console.log('🔧 Adding sample data...');
  
  try {
    // Sample contacts
    const contacts = [
      {
        name: 'Jean Mballa',
        phone: '+237670337798',
        email: 'jean.mballa@gmail.com',
        intent: 'buy',
        budget_min: 50000000,
        budget_max: 80000000,
        preferred_location: 'Douala, Akwa',
        property_type: 'apartment',
        bedrooms: 3,
        stage: 'qualified',
        source: 'whatsapp'
      },
      {
        name: 'Marie Nguema',
        phone: '+237671234567',
        email: 'marie.nguema@yahoo.com',
        intent: 'rent',
        budget_min: 200000,
        budget_max: 400000,
        preferred_location: 'Yaoundé, Bastos',
        property_type: 'house',
        bedrooms: 4,
        stage: 'viewing',
        source: 'facebook_ad'
      },
      {
        name: 'Paul Etame',
        phone: '+237680123456',
        email: 'paul.etame@hotmail.com',
        intent: 'invest',
        budget_min: 100000000,
        budget_max: 200000000,
        preferred_location: 'Douala, Bonanjo',
        property_type: 'commercial',
        bedrooms: null,
        stage: 'new',
        source: 'website'
      },
      {
        name: 'Grace Fouda',
        phone: '+237690987654',
        email: 'grace.fouda@gmail.com',
        intent: 'buy',
        budget_min: 30000000,
        budget_max: 60000000,
        preferred_location: 'Douala, Bonapriso',
        property_type: 'villa',
        bedrooms: 5,
        stage: 'negotiating',
        source: 'referral'
      },
      {
        name: 'Samuel Biya',
        phone: '+237655443322',
        email: null,
        intent: 'rent',
        budget_min: 150000,
        budget_max: 300000,
        preferred_location: 'Yaoundé, Melen',
        property_type: 'apartment',
        bedrooms: 2,
        stage: 'qualified',
        source: 'qr_code'
      }
    ];

    // Sample properties
    const properties = [
      {
        title: 'Luxury Apartment in Akwa',
        description: 'Beautiful 3-bedroom apartment with ocean view in the heart of Douala business district',
        property_type: 'apartment',
        transaction_type: 'sale',
        price: 75000000,
        address: 'Boulevard de la Liberté, Akwa',
        city: 'Douala',
        region: 'Littoral',
        bedrooms: 3,
        bathrooms: 2,
        area_sqm: 120,
        furnished: true,
        parking: true,
        security: true,
        status: 'available'
      },
      {
        title: 'Modern Villa in Bastos',
        description: 'Spacious 5-bedroom villa with swimming pool and garden in prestigious Bastos neighborhood',
        property_type: 'villa',
        transaction_type: 'rent',
        price: 800000,
        address: 'Rue 1750, Bastos',
        city: 'Yaoundé',
        region: 'Centre',
        bedrooms: 5,
        bathrooms: 4,
        area_sqm: 300,
        furnished: false,
        parking: true,
        security: true,
        status: 'available'
      },
      {
        title: 'Commercial Building in Bonanjo',
        description: 'Prime commercial space perfect for offices or retail in Douala city center',
        property_type: 'commercial',
        transaction_type: 'sale',
        price: 150000000,
        address: 'Avenue Ahidjo, Bonanjo',
        city: 'Douala',
        region: 'Littoral',
        bedrooms: null,
        bathrooms: 6,
        area_sqm: 500,
        furnished: false,
        parking: true,
        security: true,
        status: 'available'
      },
      {
        title: 'Cozy House in Melen',
        description: 'Affordable 2-bedroom house perfect for small families in quiet neighborhood',
        property_type: 'house',
        transaction_type: 'rent',
        price: 250000,
        address: 'Quartier Melen',
        city: 'Yaoundé',
        region: 'Centre',
        bedrooms: 2,
        bathrooms: 1,
        area_sqm: 80,
        furnished: false,
        parking: false,
        security: false,
        status: 'available'
      }
    ];

    // Insert contacts
    console.log('👥 Adding sample contacts...');
    for (const contact of contacts) {
      // Check if contact already exists
      const existing = await pool.query(
        'SELECT id FROM contacts WHERE phone = $1',
        [contact.phone]
      );
      
      if (existing.rows.length === 0) {
        await pool.query(`
          INSERT INTO contacts (
            name, phone, email, intent, budget_min, budget_max,
            preferred_location, property_type, bedrooms, stage, source,
            created_at, updated_at, last_contact_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `, [
          contact.name, contact.phone, contact.email, contact.intent,
          contact.budget_min, contact.budget_max, contact.preferred_location,
          contact.property_type, contact.bedrooms, contact.stage, contact.source
        ]);
        
        console.log(`✅ Added contact: ${contact.name}`);
      } else {
        console.log(`⏭️ Contact already exists: ${contact.name}`);
      }
    }

    // Insert properties
    console.log('🏠 Adding sample properties...');
    for (const property of properties) {
      // Check if property already exists
      const existing = await pool.query(
        'SELECT id FROM properties WHERE title = $1',
        [property.title]
      );
      
      if (existing.rows.length === 0) {
        await pool.query(`
          INSERT INTO properties (
            title, description, property_type, transaction_type, price,
            address, city, region, bedrooms, bathrooms, area_sqm,
            furnished, parking, security, status, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `, [
          property.title, property.description, property.property_type,
          property.transaction_type, property.price, property.address,
          property.city, property.region, property.bedrooms, property.bathrooms,
          property.area_sqm, property.furnished, property.parking,
          property.security, property.status
        ]);
        
        console.log(`✅ Added property: ${property.title}`);
      } else {
        console.log(`⏭️ Property already exists: ${property.title}`);
      }
    }

    console.log('');
    console.log('🎉 Sample data added successfully!');
    console.log('📊 Summary:');
    console.log(`   👥 ${contacts.length} contacts`);
    console.log(`   🏠 ${properties.length} properties`);
    console.log('');
    console.log('🚀 Your dashboard should now show real data!');
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error.message);
  } finally {
    await pool.end();
  }
}

addSampleData();
