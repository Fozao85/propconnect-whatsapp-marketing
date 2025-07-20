/**
 * Dashboard Routes
 * 
 * Provides analytics and statistics for the dashboard:
 * 1. Overall statistics (contacts, properties, messages, etc.)
 * 2. Recent activities and updates
 * 3. Chart data for analytics
 * 4. Performance metrics
 */

const express = require('express');
const { getDB } = require('../config/database');
const router = express.Router();

/**
 * GET DASHBOARD STATISTICS
 * GET /api/dashboard/stats
 * 
 * Returns key metrics for the dashboard overview
 */
router.get('/stats', async (req, res) => {
  try {
    const db = getDB();
    
    // Get total contacts
    const contactsResult = await db.query('SELECT COUNT(*) as total FROM contacts');
    const totalContacts = parseInt(contactsResult.rows[0].total);
    
    // Get contacts by stage for conversion calculation
    const stagesResult = await db.query(`
      SELECT stage, COUNT(*) as count 
      FROM contacts 
      GROUP BY stage
    `);
    
    const stageStats = {};
    stagesResult.rows.forEach(row => {
      stageStats[row.stage] = parseInt(row.count);
    });
    
    // Calculate conversion rate (closed / total * 100)
    const closedContacts = stageStats.closed || 0;
    const conversionRate = totalContacts > 0 ? ((closedContacts / totalContacts) * 100).toFixed(1) : 0;
    
    // Get total properties
    const propertiesResult = await db.query('SELECT COUNT(*) as total FROM properties WHERE status = $1', ['available']);
    const totalProperties = parseInt(propertiesResult.rows[0].total);
    
    // Get total messages sent
    const messagesResult = await db.query('SELECT COUNT(*) as total FROM conversations WHERE direction = $1', ['outbound']);
    const totalMessages = parseInt(messagesResult.rows[0].total);
    
    // Get contacts created in last 30 days for growth calculation
    const lastMonthContacts = await db.query(`
      SELECT COUNT(*) as total 
      FROM contacts 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);
    const newContactsThisMonth = parseInt(lastMonthContacts.rows[0].total);
    
    // Get properties added in last 30 days
    const lastMonthProperties = await db.query(`
      SELECT COUNT(*) as total 
      FROM properties 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);
    const newPropertiesThisMonth = parseInt(lastMonthProperties.rows[0].total);
    
    // Get messages sent in last 30 days
    const lastMonthMessages = await db.query(`
      SELECT COUNT(*) as total 
      FROM conversations 
      WHERE direction = 'outbound' AND created_at >= NOW() - INTERVAL '30 days'
    `);
    const messagesThisMonth = parseInt(lastMonthMessages.rows[0].total);
    
    // Calculate growth percentages (simplified)
    const contactGrowth = totalContacts > 0 ? ((newContactsThisMonth / Math.max(totalContacts - newContactsThisMonth, 1)) * 100).toFixed(1) : 0;
    const propertyGrowth = totalProperties > 0 ? ((newPropertiesThisMonth / Math.max(totalProperties - newPropertiesThisMonth, 1)) * 100).toFixed(1) : 0;
    const messageGrowth = totalMessages > 0 ? ((messagesThisMonth / Math.max(totalMessages - messagesThisMonth, 1)) * 100).toFixed(1) : 0;
    
    const stats = {
      totalContacts: {
        value: totalContacts.toLocaleString(),
        change: `+${contactGrowth}%`,
        changeType: 'increase'
      },
      activeProperties: {
        value: totalProperties.toLocaleString(),
        change: `+${propertyGrowth}%`,
        changeType: 'increase'
      },
      messagesSent: {
        value: totalMessages.toLocaleString(),
        change: `+${messageGrowth}%`,
        changeType: 'increase'
      },
      conversionRate: {
        value: `${conversionRate}%`,
        change: '+0.5%',
        changeType: 'increase'
      },
      stageBreakdown: stageStats
    };
    
    console.log('📊 Dashboard stats generated:', stats);
    
    res.json(stats);
    
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: 'Unable to retrieve dashboard statistics'
    });
  }
});

/**
 * GET RECENT ACTIVITIES
 * GET /api/dashboard/activities
 * 
 * Returns recent activities and updates
 */
router.get('/activities', async (req, res) => {
  try {
    const db = getDB();
    const limit = parseInt(req.query.limit) || 4;
    
    // Get recent activities from multiple sources
    const activities = [];
    
    // Recent contacts
    const recentContacts = await db.query(`
      SELECT id, name, created_at, 'contact' as type
      FROM contacts 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    
    recentContacts.rows.forEach(contact => {
      activities.push({
        id: `contact-${contact.id}`,
        type: 'contact',
        title: 'New contact registered',
        description: `${contact.name} - Looking for properties`,
        time: formatTimeAgo(contact.created_at),
        icon: 'Users',
        color: 'text-purple-600'
      });
    });
    
    // Recent properties
    const recentProperties = await db.query(`
      SELECT id, title, created_at, 'property' as type
      FROM properties 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    
    recentProperties.rows.forEach(property => {
      activities.push({
        id: `property-${property.id}`,
        type: 'property',
        title: 'New property added',
        description: property.title,
        time: formatTimeAgo(property.created_at),
        icon: 'Home',
        color: 'text-green-600'
      });
    });
    
    // Recent messages
    const recentMessages = await db.query(`
      SELECT c.id, c.name, conv.created_at, conv.direction
      FROM conversations conv
      JOIN contacts c ON conv.contact_id = c.id
      WHERE conv.direction = 'outbound'
      ORDER BY conv.created_at DESC 
      LIMIT 3
    `);
    
    recentMessages.rows.forEach(message => {
      activities.push({
        id: `message-${message.id}-${Date.now()}`,
        type: 'message',
        title: 'Message sent',
        description: `WhatsApp message sent to ${message.name}`,
        time: formatTimeAgo(message.created_at),
        icon: 'MessageSquare',
        color: 'text-blue-600'
      });
    });
    
    // Sort all activities by time and limit
    activities.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const limitedActivities = activities.slice(0, limit);
    
    res.json({ activities: limitedActivities });
    
  } catch (error) {
    console.error('❌ Error fetching recent activities:', error);
    res.status(500).json({
      error: 'Failed to fetch activities',
      message: 'Unable to retrieve recent activities'
    });
  }
});

/**
 * GET CHART DATA
 * GET /api/dashboard/charts/:type
 * 
 * Returns data for various charts
 */
router.get('/charts/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const range = req.query.range || '30d';
    const db = getDB();
    
    let chartData = {};
    
    switch (type) {
      case 'messages':
        // Messages over time
        const messagesData = await db.query(`
          SELECT 
            DATE_TRUNC('day', created_at) as date,
            COUNT(*) as count,
            direction
          FROM conversations 
          WHERE created_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE_TRUNC('day', created_at), direction
          ORDER BY date
        `);
        
        chartData = {
          labels: [],
          datasets: [
            {
              label: 'Messages Sent',
              data: [],
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
            },
            {
              label: 'Messages Received',
              data: [],
              borderColor: 'rgb(34, 197, 94)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              tension: 0.4,
            }
          ]
        };
        
        // Process the data (simplified for now)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          last7Days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        
        chartData.labels = last7Days;
        chartData.datasets[0].data = [12, 19, 30, 25, 20, 30, 35]; // Sample data
        chartData.datasets[1].data = [8, 12, 18, 15, 12, 18, 22]; // Sample data
        break;
        
      case 'property-types':
        // Property types distribution
        const propertyTypes = await db.query(`
          SELECT property_type, COUNT(*) as count
          FROM properties
          WHERE status = 'available'
          GROUP BY property_type
        `);
        
        chartData = {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: [
              '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
            ],
            borderWidth: 0,
          }]
        };
        
        propertyTypes.rows.forEach(row => {
          chartData.labels.push(row.property_type.charAt(0).toUpperCase() + row.property_type.slice(1));
          chartData.datasets[0].data.push(parseInt(row.count));
        });
        break;
        
      case 'lead-sources':
        // Lead sources
        const leadSources = await db.query(`
          SELECT source, COUNT(*) as count
          FROM contacts
          WHERE source IS NOT NULL
          GROUP BY source
        `);
        
        chartData = {
          labels: [],
          datasets: [{
            label: 'Leads',
            data: [],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
          }]
        };
        
        leadSources.rows.forEach(row => {
          const sourceName = row.source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          chartData.labels.push(sourceName);
          chartData.datasets[0].data.push(parseInt(row.count));
        });
        break;
        
      default:
        return res.status(400).json({
          error: 'Invalid chart type',
          message: 'Supported types: messages, property-types, lead-sources'
        });
    }
    
    res.json(chartData);
    
  } catch (error) {
    console.error('❌ Error fetching chart data:', error);
    res.status(500).json({
      error: 'Failed to fetch chart data',
      message: 'Unable to retrieve chart data'
    });
  }
});

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

module.exports = router;
