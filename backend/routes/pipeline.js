const express = require('express');
const router = express.Router();
const { getDB } = require('../config/database');

/**
 * GET /api/pipeline/stats
 * Get pipeline statistics for all stages
 */
router.get('/stats', async (req, res) => {
  try {
    const db = getDB();
    
    // Get counts and values for each stage
    const stats = await db.query(`
      SELECT 
        stage,
        COUNT(*) as count,
        COALESCE(SUM(GREATEST(budget_max, budget_min)), 0) as total_value,
        COALESCE(AVG(GREATEST(budget_max, budget_min)), 0) as avg_value
      FROM contacts 
      WHERE stage IS NOT NULL
      GROUP BY stage
      ORDER BY 
        CASE stage
          WHEN 'new' THEN 1
          WHEN 'contacted' THEN 2
          WHEN 'qualified' THEN 3
          WHEN 'viewing' THEN 4
          WHEN 'negotiating' THEN 5
          WHEN 'closed' THEN 6
          ELSE 7
        END
    `);
    
    // Get total pipeline value
    const totalValue = await db.query(`
      SELECT COALESCE(SUM(GREATEST(budget_max, budget_min)), 0) as total
      FROM contacts 
      WHERE stage IS NOT NULL AND stage != 'closed'
    `);
    
    res.json({
      success: true,
      stats: stats.rows,
      total_pipeline_value: totalValue.rows[0].total,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching pipeline stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pipeline statistics',
      error: error.message
    });
  }
});

/**
 * GET /api/pipeline/conversion
 * Get conversion rates between stages
 */
router.get('/conversion', async (req, res) => {
  try {
    const db = getDB();
    
    // Get stage transitions from activity logs
    const conversions = await db.query(`
      WITH stage_transitions AS (
        SELECT 
          contact_id,
          stage as current_stage,
          LAG(stage) OVER (PARTITION BY contact_id ORDER BY updated_at) as previous_stage,
          updated_at
        FROM (
          SELECT contact_id, stage, updated_at FROM contacts
          UNION ALL
          SELECT contact_id, 
                 CASE 
                   WHEN description LIKE '%Stage changed to%' 
                   THEN LOWER(TRIM(SUBSTRING(description FROM 'Stage changed to (.+)')))
                   ELSE NULL 
                 END as stage,
                 created_at as updated_at
          FROM customer_activities 
          WHERE activity_type = 'stage_change'
        ) combined
        WHERE stage IS NOT NULL
      )
      SELECT 
        previous_stage,
        current_stage,
        COUNT(*) as transition_count,
        ROUND(
          COUNT(*) * 100.0 / 
          SUM(COUNT(*)) OVER (PARTITION BY previous_stage), 
          2
        ) as conversion_rate
      FROM stage_transitions
      WHERE previous_stage IS NOT NULL
      GROUP BY previous_stage, current_stage
      ORDER BY previous_stage, current_stage
    `);
    
    res.json({
      success: true,
      conversions: conversions.rows,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching conversion rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversion rates',
      error: error.message
    });
  }
});

/**
 * GET /api/pipeline/velocity
 * Get average time spent in each stage
 */
router.get('/velocity', async (req, res) => {
  try {
    const db = getDB();
    
    const velocity = await db.query(`
      WITH stage_durations AS (
        SELECT 
          contact_id,
          stage,
          updated_at as stage_start,
          LEAD(updated_at) OVER (PARTITION BY contact_id ORDER BY updated_at) as stage_end
        FROM (
          SELECT contact_id, stage, updated_at FROM contacts
          UNION ALL
          SELECT contact_id, 
                 CASE 
                   WHEN description LIKE '%Stage changed to%' 
                   THEN LOWER(TRIM(SUBSTRING(description FROM 'Stage changed to (.+)')))
                   ELSE NULL 
                 END as stage,
                 created_at as updated_at
          FROM customer_activities 
          WHERE activity_type = 'stage_change'
        ) combined
        WHERE stage IS NOT NULL
        ORDER BY contact_id, updated_at
      )
      SELECT 
        stage,
        COUNT(*) as sample_size,
        ROUND(AVG(EXTRACT(EPOCH FROM (stage_end - stage_start)) / 86400), 1) as avg_days,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (stage_end - stage_start)) / 86400), 1) as median_days
      FROM stage_durations
      WHERE stage_end IS NOT NULL
      GROUP BY stage
      ORDER BY 
        CASE stage
          WHEN 'new' THEN 1
          WHEN 'contacted' THEN 2
          WHEN 'qualified' THEN 3
          WHEN 'viewing' THEN 4
          WHEN 'negotiating' THEN 5
          WHEN 'closed' THEN 6
          ELSE 7
        END
    `);
    
    res.json({
      success: true,
      velocity: velocity.rows,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching stage velocity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stage velocity',
      error: error.message
    });
  }
});

/**
 * GET /api/pipeline/bottlenecks
 * Identify pipeline bottlenecks
 */
router.get('/bottlenecks', async (req, res) => {
  try {
    const db = getDB();
    
    const bottlenecks = await db.query(`
      WITH stage_metrics AS (
        SELECT 
          stage,
          COUNT(*) as contact_count,
          AVG(EXTRACT(EPOCH FROM (NOW() - updated_at)) / 86400) as avg_days_in_stage,
          COUNT(CASE WHEN updated_at < NOW() - INTERVAL '7 days' THEN 1 END) as stale_contacts
        FROM contacts
        WHERE stage IS NOT NULL AND stage != 'closed'
        GROUP BY stage
      )
      SELECT 
        stage,
        contact_count,
        ROUND(avg_days_in_stage, 1) as avg_days_in_stage,
        stale_contacts,
        ROUND(stale_contacts * 100.0 / contact_count, 1) as stale_percentage,
        CASE 
          WHEN avg_days_in_stage > 14 THEN 'high'
          WHEN avg_days_in_stage > 7 THEN 'medium'
          ELSE 'low'
        END as bottleneck_severity
      FROM stage_metrics
      ORDER BY avg_days_in_stage DESC
    `);
    
    res.json({
      success: true,
      bottlenecks: bottlenecks.rows,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching bottlenecks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pipeline bottlenecks',
      error: error.message
    });
  }
});

/**
 * PUT /api/contacts/bulk-stage-update
 * Update stage for multiple contacts
 */
router.put('/contacts/bulk-stage-update', async (req, res) => {
  try {
    const db = getDB();
    const { contact_ids, stage, notes } = req.body;
    
    if (!contact_ids || !Array.isArray(contact_ids) || contact_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Contact IDs array is required'
      });
    }
    
    if (!stage) {
      return res.status(400).json({
        success: false,
        message: 'Stage is required'
      });
    }
    
    // Update contacts
    const placeholders = contact_ids.map((_, index) => `$${index + 3}`).join(',');
    const updateResult = await db.query(`
      UPDATE contacts 
      SET stage = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id IN (${placeholders})
      RETURNING id, name, stage
    `, [stage, notes, ...contact_ids]);
    
    // Log activities for each contact
    for (const contactId of contact_ids) {
      await db.query(`
        INSERT INTO customer_activities (contact_id, activity_type, description, created_at)
        VALUES ($1, 'stage_change', $2, CURRENT_TIMESTAMP)
      `, [contactId, `Stage changed to ${stage}${notes ? ` - ${notes}` : ''}`]);
    }
    
    res.json({
      success: true,
      message: `${updateResult.rows.length} contacts updated successfully`,
      updated_contacts: updateResult.rows
    });
    
  } catch (error) {
    console.error('❌ Error bulk updating contact stages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact stages',
      error: error.message
    });
  }
});

/**
 * GET /api/pipeline/metrics
 * Get comprehensive pipeline metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const db = getDB();
    const { range = '30d' } = req.query;
    
    // Convert range to days
    const days = parseInt(range.replace('d', '')) || 30;
    
    const metrics = await db.query(`
      WITH date_range AS (
        SELECT NOW() - INTERVAL '${days} days' as start_date, NOW() as end_date
      ),
      pipeline_metrics AS (
        SELECT 
          COUNT(*) as total_contacts,
          COUNT(CASE WHEN stage = 'new' THEN 1 END) as new_leads,
          COUNT(CASE WHEN stage = 'closed' THEN 1 END) as closed_deals,
          COUNT(CASE WHEN created_at >= (SELECT start_date FROM date_range) THEN 1 END) as new_contacts_period,
          COUNT(CASE WHEN stage = 'closed' AND updated_at >= (SELECT start_date FROM date_range) THEN 1 END) as closed_deals_period,
          COALESCE(SUM(CASE WHEN stage = 'closed' THEN GREATEST(budget_max, budget_min) END), 0) as total_revenue,
          COALESCE(AVG(CASE WHEN stage = 'closed' THEN GREATEST(budget_max, budget_min) END), 0) as avg_deal_size
        FROM contacts
        WHERE created_at >= (SELECT start_date FROM date_range)
      )
      SELECT 
        *,
        CASE 
          WHEN new_contacts_period > 0 
          THEN ROUND(closed_deals_period * 100.0 / new_contacts_period, 2)
          ELSE 0 
        END as conversion_rate
      FROM pipeline_metrics
    `);
    
    res.json({
      success: true,
      metrics: metrics.rows[0],
      period: `${days} days`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching pipeline metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pipeline metrics',
      error: error.message
    });
  }
});

module.exports = router;
