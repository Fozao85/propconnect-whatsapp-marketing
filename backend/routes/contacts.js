/**
 * Contacts Routes
 * 
 * Manages WhatsApp contacts (potential customers):
 * 1. Get all contacts with filtering and pagination
 * 2. Get individual contact details
 * 3. Update contact information
 * 4. Get contact conversation history
 * 5. Contact analytics and statistics
 */

const express = require('express');
const { getDB } = require('../config/database');
const router = express.Router();

/**
 * GET ALL CONTACTS
 * GET /api/contacts
 * 
 * Returns paginated list of contacts with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    
    // Parse query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Filter parameters
    const stage = req.query.stage;
    const intent = req.query.intent;
    const source = req.query.source;
    const search = req.query.search;
    
    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;
    
    if (stage) {
      whereConditions.push(`stage = $${paramIndex}`);
      queryParams.push(stage);
      paramIndex++;
    }
    
    if (intent) {
      whereConditions.push(`intent = $${paramIndex}`);
      queryParams.push(intent);
      paramIndex++;
    }
    
    if (source) {
      whereConditions.push(`source = $${paramIndex}`);
      queryParams.push(source);
      paramIndex++;
    }
    
    if (search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR phone ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get contacts with pagination
    const contactsQuery = `
      SELECT 
        id, phone, name, email, intent, budget_min, budget_max,
        preferred_location, property_type, bedrooms, stage, source,
        created_at, updated_at, last_contact_at
      FROM contacts 
      ${whereClause}
      ORDER BY last_contact_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    
    const contactsResult = await db.query(contactsQuery, queryParams);
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM contacts ${whereClause}`;
    const countResult = await db.query(countQuery, queryParams.slice(0, -2)); // Remove limit and offset
    
    const totalContacts = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalContacts / limit);
    
    res.json({
      contacts: contactsResult.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalContacts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching contacts:', error);
    res.status(500).json({
      error: 'Failed to fetch contacts',
      message: 'Unable to retrieve contact list'
    });
  }
});

/**
 * GET CONTACT BY ID
 * GET /api/contacts/:id
 * 
 * Returns detailed information about a specific contact
 */
router.get('/:id', async (req, res) => {
  try {
    const contactId = parseInt(req.params.id);
    const db = getDB();
    
    // Get contact details
    const contactResult = await db.query(
      'SELECT * FROM contacts WHERE id = $1',
      [contactId]
    );
    
    if (contactResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Contact not found',
        message: 'No contact found with the specified ID'
      });
    }
    
    const contact = contactResult.rows[0];
    
    // Get recent conversations
    const conversationsResult = await db.query(`
      SELECT message_id, direction, message_type, content, whatsapp_status, created_at
      FROM conversations 
      WHERE contact_id = $1 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [contactId]);
    
    // Get property matches
    const matchesResult = await db.query(`
      SELECT pm.*, p.title, p.price, p.property_type, p.city
      FROM property_matches pm
      JOIN properties p ON pm.property_id = p.id
      WHERE pm.contact_id = $1
      ORDER BY pm.shown_at DESC
    `, [contactId]);
    
    res.json({
      contact,
      conversations: conversationsResult.rows,
      propertyMatches: matchesResult.rows
    });
    
  } catch (error) {
    console.error('❌ Error fetching contact:', error);
    res.status(500).json({
      error: 'Failed to fetch contact',
      message: 'Unable to retrieve contact details'
    });
  }
});

/**
 * UPDATE CONTACT
 * PUT /api/contacts/:id
 * 
 * Updates contact information and preferences
 */
router.put('/:id', async (req, res) => {
  try {
    const contactId = parseInt(req.params.id);
    const {
      name, email, intent, budget_min, budget_max,
      preferred_location, property_type, bedrooms,
      move_in_date, stage, assigned_agent_id
    } = req.body;
    
    const db = getDB();
    
    // Check if contact exists
    const existingContact = await db.query(
      'SELECT id FROM contacts WHERE id = $1',
      [contactId]
    );
    
    if (existingContact.rows.length === 0) {
      return res.status(404).json({
        error: 'Contact not found',
        message: 'No contact found with the specified ID'
      });
    }
    
    // Update contact
    const updateResult = await db.query(`
      UPDATE contacts SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        intent = COALESCE($3, intent),
        budget_min = COALESCE($4, budget_min),
        budget_max = COALESCE($5, budget_max),
        preferred_location = COALESCE($6, preferred_location),
        property_type = COALESCE($7, property_type),
        bedrooms = COALESCE($8, bedrooms),
        move_in_date = COALESCE($9, move_in_date),
        stage = COALESCE($10, stage),
        assigned_agent_id = COALESCE($11, assigned_agent_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *
    `, [
      name, email, intent, budget_min, budget_max,
      preferred_location, property_type, bedrooms,
      move_in_date, stage, assigned_agent_id, contactId
    ]);
    
    console.log('✅ Contact updated:', contactId);
    
    res.json({
      message: 'Contact updated successfully',
      contact: updateResult.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Error updating contact:', error);
    res.status(500).json({
      error: 'Failed to update contact',
      message: 'Unable to update contact information'
    });
  }
});

/**
 * CREATE NEW CONTACT
 * POST /api/contacts
 *
 * Creates a new contact in the database
 */
router.post('/', async (req, res) => {
  try {
    const {
      name, phone, email, intent, budget_min, budget_max,
      preferred_location, property_type, bedrooms, move_in_date,
      stage = 'new', source, notes
    } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name and phone number are required'
      });
    }

    const db = getDB();

    // Check if contact with this phone already exists
    const existingContact = await db.query(
      'SELECT id FROM contacts WHERE phone = $1',
      [phone]
    );

    if (existingContact.rows.length > 0) {
      return res.status(409).json({
        error: 'Contact already exists',
        message: 'A contact with this phone number already exists'
      });
    }

    // Create new contact
    const newContact = await db.query(`
      INSERT INTO contacts (
        name, phone, email, intent, budget_min, budget_max,
        preferred_location, property_type, bedrooms, move_in_date,
        stage, source, created_at, updated_at, last_contact_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *
    `, [
      name, phone, email, intent, budget_min, budget_max,
      preferred_location, property_type, bedrooms, move_in_date,
      stage, source
    ]);

    console.log('✅ New contact created:', newContact.rows[0].id);

    res.status(201).json({
      message: 'Contact created successfully',
      contact: newContact.rows[0]
    });

  } catch (error) {
    console.error('❌ Error creating contact:', error);
    res.status(500).json({
      error: 'Failed to create contact',
      message: 'Unable to create new contact'
    });
  }
});

/**
 * DELETE CONTACT
 * DELETE /api/contacts/:id
 *
 * Deletes a contact and all related data
 */
router.delete('/:id', async (req, res) => {
  try {
    const contactId = parseInt(req.params.id);
    const db = getDB();

    // Check if contact exists
    const existingContact = await db.query(
      'SELECT id, name FROM contacts WHERE id = $1',
      [contactId]
    );

    if (existingContact.rows.length === 0) {
      return res.status(404).json({
        error: 'Contact not found',
        message: 'No contact found with the specified ID'
      });
    }

    const contactName = existingContact.rows[0].name;

    // Delete contact (this will cascade delete conversations and property_matches)
    await db.query('DELETE FROM contacts WHERE id = $1', [contactId]);

    console.log('✅ Contact deleted:', contactId, contactName);

    res.json({
      message: 'Contact deleted successfully',
      deletedContact: { id: contactId, name: contactName }
    });

  } catch (error) {
    console.error('❌ Error deleting contact:', error);
    res.status(500).json({
      error: 'Failed to delete contact',
      message: 'Unable to delete contact'
    });
  }
});

/**
 * GET CONTACT STATISTICS
 * GET /api/contacts/stats
 *
 * Returns analytics about contacts
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const db = getDB();
    
    // Get various statistics
    const stats = await Promise.all([
      // Total contacts
      db.query('SELECT COUNT(*) as total FROM contacts'),
      
      // Contacts by stage
      db.query(`
        SELECT stage, COUNT(*) as count 
        FROM contacts 
        GROUP BY stage 
        ORDER BY count DESC
      `),
      
      // Contacts by intent
      db.query(`
        SELECT intent, COUNT(*) as count 
        FROM contacts 
        WHERE intent IS NOT NULL
        GROUP BY intent 
        ORDER BY count DESC
      `),
      
      // Contacts by source
      db.query(`
        SELECT source, COUNT(*) as count 
        FROM contacts 
        GROUP BY source 
        ORDER BY count DESC
      `),
      
      // New contacts this week
      db.query(`
        SELECT COUNT(*) as count 
        FROM contacts 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      `),
      
      // Active conversations (contacted in last 24 hours)
      db.query(`
        SELECT COUNT(*) as count 
        FROM contacts 
        WHERE last_contact_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
      `)
    ]);
    
    res.json({
      totalContacts: parseInt(stats[0].rows[0].total),
      contactsByStage: stats[1].rows,
      contactsByIntent: stats[2].rows,
      contactsBySource: stats[3].rows,
      newContactsThisWeek: parseInt(stats[4].rows[0].count),
      activeConversations: parseInt(stats[5].rows[0].count)
    });
    
  } catch (error) {
    console.error('❌ Error fetching contact stats:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: 'Unable to retrieve contact statistics'
    });
  }
});

/**
 * GET /api/contacts/:id/activity
 * Get customer activity timeline
 */
router.get('/:id/activity', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    // Get customer activities from multiple sources
    const activities = await db.query(`
      SELECT
        'message' as type,
        'Sent message: ' || SUBSTRING(content, 1, 50) || CASE WHEN LENGTH(content) > 50 THEN '...' ELSE '' END as description,
        created_at as timestamp,
        direction
      FROM messages
      WHERE contact_id = $1

      UNION ALL

      SELECT
        'stage_change' as type,
        'Stage changed to ' || stage as description,
        updated_at as timestamp,
        'system' as direction
      FROM contacts
      WHERE id = $1

      UNION ALL

      SELECT
        'contact_created' as type,
        'Contact created' as description,
        created_at as timestamp,
        'system' as direction
      FROM contacts
      WHERE id = $1

      ORDER BY timestamp DESC
      LIMIT 50
    `, [id]);

    res.json({
      success: true,
      activities: activities.rows
    });

  } catch (error) {
    console.error('❌ Error fetching customer activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer activity',
      error: error.message
    });
  }
});

/**
 * GET /api/contacts/:id/stats
 * Get customer statistics
 */
router.get('/:id/stats', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    // Get various customer statistics
    const stats = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM messages WHERE contact_id = $1) as total_messages,
        (SELECT COUNT(*) FROM messages WHERE contact_id = $1 AND direction = 'inbound') as inbound_messages,
        (SELECT COUNT(*) FROM messages WHERE contact_id = $1 AND direction = 'outbound') as outbound_messages,
        (SELECT COUNT(*) FROM property_matches WHERE contact_id = $1) as properties_viewed,
        (SELECT COUNT(*) FROM property_matches WHERE contact_id = $1 AND is_favorite = true) as favorite_properties,
        (SELECT EXTRACT(DAY FROM NOW() - created_at) FROM contacts WHERE id = $1) as days_since_created
    `, [id]);

    const statsData = stats.rows[0] || {};

    res.json({
      success: true,
      stats: {
        messages: parseInt(statsData.total_messages) || 0,
        inbound_messages: parseInt(statsData.inbound_messages) || 0,
        outbound_messages: parseInt(statsData.outbound_messages) || 0,
        properties_viewed: parseInt(statsData.properties_viewed) || 0,
        favorite_properties: parseInt(statsData.favorite_properties) || 0,
        days_active: parseInt(statsData.days_since_created) || 0
      }
    });

  } catch (error) {
    console.error('❌ Error fetching customer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer statistics',
      error: error.message
    });
  }
});

/**
 * POST /api/contacts/:id/notes
 * Add note to customer
 */
router.post('/:id/notes', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { note, type = 'note' } = req.body;

    if (!note) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const result = await db.query(`
      INSERT INTO customer_notes (contact_id, note, type, created_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING *
    `, [id, note, type]);

    res.status(201).json({
      success: true,
      note: result.rows[0],
      message: 'Note added successfully'
    });

  } catch (error) {
    console.error('❌ Error adding customer note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: error.message
    });
  }
});

module.exports = router;
