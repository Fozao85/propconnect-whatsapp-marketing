/**
 * Add Sample Conversations Script
 * 
 * Adds sample WhatsApp conversations to the database for testing
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

async function addSampleConversations() {
  console.log('💬 Adding sample conversations...');
  
  try {
    // Get existing contacts
    const contactsResult = await pool.query('SELECT id, name FROM contacts ORDER BY id LIMIT 3');
    const contacts = contactsResult.rows;
    
    if (contacts.length === 0) {
      console.log('❌ No contacts found. Please run add-sample-data.js first.');
      return;
    }
    
    // Sample conversations for each contact
    const conversations = [
      // Contact 1 - Jean Mballa
      {
        contact_id: contacts[0].id,
        messages: [
          {
            direction: 'inbound',
            content: 'Bonjour, je suis intéressé par l\'appartement à Akwa',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
          },
          {
            direction: 'outbound',
            content: 'Bonjour Jean! Merci pour votre intérêt. C\'est un magnifique appartement de 3 chambres avec vue sur l\'océan. Souhaitez-vous programmer une visite?',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000) // 1h55 ago
          },
          {
            direction: 'inbound',
            content: 'Oui, je suis très intéressé. Quel est le prix?',
            created_at: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
          },
          {
            direction: 'outbound',
            content: 'Le prix est de 75 millions XAF. L\'appartement est meublé et dispose d\'un parking sécurisé. Quand seriez-vous disponible pour la visite?',
            created_at: new Date(Date.now() - 50 * 60 * 1000) // 50 minutes ago
          },
          {
            direction: 'inbound',
            content: 'Je peux venir demain après-midi. Vers 14h ça vous va?',
            created_at: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
          }
        ]
      },
      
      // Contact 2 - Marie Nguema
      {
        contact_id: contacts[1].id,
        messages: [
          {
            direction: 'inbound',
            content: 'Salut, j\'ai vu votre annonce pour la villa à Bastos',
            created_at: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
          },
          {
            direction: 'outbound',
            content: 'Bonjour Marie! Oui, c\'est une superbe villa de 5 chambres avec piscine et jardin. Elle est disponible en location. Voulez-vous plus de détails?',
            created_at: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
          },
          {
            direction: 'inbound',
            content: 'Quel est le loyer mensuel?',
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
          },
          {
            direction: 'outbound',
            content: 'Le loyer est de 800,000 XAF par mois. La villa dispose de 4 salles de bain, parking pour 3 voitures et système de sécurité 24h/24.',
            created_at: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
          }
        ]
      },
      
      // Contact 3 - Paul Etame
      {
        contact_id: contacts[2].id,
        messages: [
          {
            direction: 'outbound',
            content: 'Bonjour Paul, j\'ai trouvé un immeuble commercial qui pourrait vous intéresser à Bonanjo. Voulez-vous que je vous envoie les détails?',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
          },
          {
            direction: 'inbound',
            content: 'Oui, envoyez-moi les informations s\'il vous plaît',
            created_at: new Date(Date.now() - 23 * 60 * 60 * 1000) // 23 hours ago
          },
          {
            direction: 'outbound',
            content: 'Voici les détails: Immeuble commercial de 500m², 6 salles de bain, parking, sécurité. Prix: 150 millions XAF. Parfait pour bureaux ou commerce.',
            created_at: new Date(Date.now() - 22 * 60 * 60 * 1000) // 22 hours ago
          },
          {
            direction: 'inbound',
            content: 'Merci pour les informations. Je vais étudier ça et vous recontacter.',
            created_at: new Date(Date.now() - 20 * 60 * 60 * 1000) // 20 hours ago
          }
        ]
      }
    ];

    // Insert conversations
    for (const conversation of conversations) {
      console.log(`💬 Adding conversation for contact: ${contacts.find(c => c.id === conversation.contact_id).name}`);
      
      for (const message of conversation.messages) {
        // Generate a fake WhatsApp message ID
        const messageId = `wamid.${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await pool.query(`
          INSERT INTO conversations (
            contact_id, message_id, direction, message_type, content,
            whatsapp_status, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7
          )
        `, [
          conversation.contact_id,
          messageId,
          message.direction,
          'text',
          message.content,
          message.direction === 'outbound' ? 'delivered' : null,
          message.created_at
        ]);
      }
    }

    console.log('');
    console.log('🎉 Sample conversations added successfully!');
    console.log('📊 Summary:');
    console.log(`   💬 ${conversations.length} conversations`);
    console.log(`   📱 ${conversations.reduce((total, conv) => total + conv.messages.length, 0)} messages`);
    console.log('');
    console.log('🚀 Your conversations page should now show real WhatsApp chats!');
    
  } catch (error) {
    console.error('❌ Error adding sample conversations:', error.message);
  } finally {
    await pool.end();
  }
}

addSampleConversations();
