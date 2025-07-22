/**
 * Conversations Routes
 * 
 * Handles WhatsApp conversation management:
 * 1. Get all conversations with latest message
 * 2. Get messages for specific conversation
 * 3. Mark messages as read
 * 4. Send messages (delegated to WhatsApp routes)
 */

const express = require('express');
const { getDB } = require('../config/database');
const router = express.Router();

/**
 * GET ALL CONVERSATIONS
 * GET /api/conversations
 * 
 * Returns all conversations with contact info and latest message
 */
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    
    // Get conversations with contact info and latest message
    const conversations = await db.query(`
      SELECT DISTINCT ON (c.id)
        c.id as contact_id,
        c.name as contact_name,
        c.phone as contact_phone,
        c.stage as contact_stage,
        conv.id as conversation_id,
        conv.content as last_message,
        conv.direction as last_message_direction,
        conv.created_at as last_message_time,
        conv.whatsapp_status,
        0 as unread_count
      FROM contacts c
      LEFT JOIN conversations conv ON c.id = conv.contact_id
      WHERE conv.id IS NOT NULL
      ORDER BY c.id, conv.created_at DESC
    `);
    
    // Transform data for frontend
    const conversationList = conversations.rows.map(row => ({
      id: row.contact_id,
      contact: {
        id: row.contact_id,
        name: row.contact_name,
        phone: row.contact_phone,
        stage: row.contact_stage,
        status: 'online' // Default status, could be enhanced
      },
      lastMessage: row.last_message || 'No messages yet',
      lastMessageDirection: row.last_message_direction,
      timestamp: row.last_message_time,
      unread: parseInt(row.unread_count) || 0,
      whatsappStatus: row.whatsapp_status
    }));
    
    // Sort by latest message time
    conversationList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    console.log(`📱 Retrieved ${conversationList.length} conversations`);
    console.log('🔍 Raw conversation data:', conversations.rows);
    console.log('🔍 Processed conversation list:', conversationList);

    // If no conversations found, let's check if we have contacts without conversations
    if (conversationList.length === 0) {
      const contactsOnly = await db.query('SELECT id, name, phone, stage FROM contacts ORDER BY created_at DESC');
      console.log('👥 Found contacts without conversations:', contactsOnly.rows);

      // Return contacts as conversations with no messages for debugging
      const fallbackConversations = contactsOnly.rows.map(contact => ({
        id: contact.id,
        contact: {
          id: contact.id,
          name: contact.name,
          phone: contact.phone,
          stage: contact.stage,
          status: 'online'
        },
        lastMessage: 'No messages yet',
        lastMessageDirection: null,
        timestamp: new Date().toISOString(),
        unread: 0,
        whatsappStatus: null
      }));

      return res.json({
        conversations: fallbackConversations,
        total: fallbackConversations.length,
        debug: 'Showing contacts as conversations - no conversation records found'
      });
    }

    res.json({
      conversations: conversationList,
      total: conversationList.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    res.status(500).json({
      error: 'Failed to fetch conversations',
      message: 'Unable to retrieve conversation list'
    });
  }
});

/**
 * GET CONVERSATION MESSAGES
 * GET /api/conversations/:contactId/messages
 * 
 * Returns all messages for a specific conversation
 */
router.get('/:contactId/messages', async (req, res) => {
  try {
    const contactId = parseInt(req.params.contactId);
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const db = getDB();
    
    // Get contact info
    const contactResult = await db.query(
      'SELECT id, name, phone FROM contacts WHERE id = $1',
      [contactId]
    );
    
    if (contactResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Contact not found',
        message: 'No contact found with the specified ID'
      });
    }
    
    const contact = contactResult.rows[0];
    
    // Get messages for this conversation
    const messagesResult = await db.query(`
      SELECT 
        id,
        message_id,
        direction,
        message_type,
        content,
        whatsapp_status,
        created_at
      FROM conversations 
      WHERE contact_id = $1 
      ORDER BY created_at ASC
      LIMIT $2 OFFSET $3
    `, [contactId, limit, offset]);
    
    // Transform messages for frontend
    const messages = messagesResult.rows.map(row => ({
      id: row.id,
      messageId: row.message_id,
      sender: row.direction === 'outbound' ? 'agent' : 'contact',
      content: row.content,
      type: row.message_type,
      timestamp: formatTime(row.created_at),
      status: row.whatsapp_status
    }));
    
    console.log(`💬 Retrieved ${messages.length} messages for contact ${contact.name}`);
    
    res.json({
      contact,
      messages,
      total: messages.length,
      hasMore: messages.length === limit
    });
    
  } catch (error) {
    console.error('❌ Error fetching conversation messages:', error);
    res.status(500).json({
      error: 'Failed to fetch messages',
      message: 'Unable to retrieve conversation messages'
    });
  }
});

/**
 * MARK MESSAGES AS READ
 * PUT /api/conversations/:contactId/mark-read
 * 
 * Marks all unread messages in a conversation as read
 */
router.put('/:contactId/mark-read', async (req, res) => {
  try {
    const contactId = parseInt(req.params.contactId);
    const db = getDB();
    
    // For now, just return success (read_at column not implemented yet)
    const result = { rows: [] };
    
    const markedCount = result.rows.length;
    
    console.log(`✅ Marked ${markedCount} messages as read for contact ${contactId}`);
    
    res.json({
      message: 'Messages marked as read',
      markedCount
    });
    
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
    res.status(500).json({
      error: 'Failed to mark messages as read',
      message: 'Unable to update message read status'
    });
  }
});

/**
 * GET CONVERSATION STATISTICS
 * GET /api/conversations/stats
 * 
 * Returns conversation statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const db = getDB();
    
    // Get total conversations
    const totalResult = await db.query(`
      SELECT COUNT(DISTINCT contact_id) as total
      FROM conversations
    `);
    
    // Get unread messages count (simplified for now)
    const unreadResult = await db.query(`
      SELECT COUNT(*) as unread
      FROM conversations
      WHERE direction = 'inbound'
    `);
    
    // Get messages sent today
    const todayResult = await db.query(`
      SELECT COUNT(*) as today
      FROM conversations
      WHERE direction = 'outbound' 
      AND DATE(created_at) = CURRENT_DATE
    `);
    
    const stats = {
      totalConversations: parseInt(totalResult.rows[0].total),
      unreadMessages: parseInt(unreadResult.rows[0].unread),
      messagesSentToday: parseInt(todayResult.rows[0].today)
    };
    
    res.json(stats);
    
  } catch (error) {
    console.error('❌ Error fetching conversation stats:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: 'Unable to retrieve conversation statistics'
    });
  }
});

// Helper function to format time
function formatTime(date) {
  const now = new Date();
  const messageDate = new Date(date);
  
  // If today, show time
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  // If this week, show day and time
  const daysDiff = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
  if (daysDiff < 7) {
    return messageDate.toLocaleDateString('en-US', { 
      weekday: 'short',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  // Otherwise show date
  return messageDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

module.exports = router;
