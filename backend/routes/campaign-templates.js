/**
 * Campaign Templates Routes
 * Manage message templates for campaigns
 */

const express = require('express');
const { getDB } = require('../config/database');
const router = express.Router();

/**
 * GET /api/campaign-templates
 * Get all campaign templates
 */
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const templates = await db.query(`
      SELECT * FROM campaign_templates 
      WHERE is_active = true 
      ORDER BY category, name
    `);

    res.json(templates.rows);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

/**
 * POST /api/campaign-templates
 * Create new campaign template
 */
router.post('/', async (req, res) => {
  try {
    const { name, category, template_type, content, variables } = req.body;
    const db = getDB();

    const template = await db.query(`
      INSERT INTO campaign_templates (
        name, category, template_type, content, variables
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, category, template_type || 'text', content, JSON.stringify(variables || [])]);

    res.json(template.rows[0]);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

/**
 * PUT /api/campaign-templates/:id
 * Update campaign template
 */
router.put('/:id', async (req, res) => {
  try {
    const templateId = req.params.id;
    const { name, category, template_type, content, variables, is_active } = req.body;
    const db = getDB();

    const template = await db.query(`
      UPDATE campaign_templates 
      SET name = $1, category = $2, template_type = $3, content = $4, 
          variables = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [name, category, template_type, content, JSON.stringify(variables), is_active, templateId]);

    if (template.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template.rows[0]);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

/**
 * DELETE /api/campaign-templates/:id
 * Delete campaign template (soft delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const templateId = req.params.id;
    const db = getDB();

    await db.query(`
      UPDATE campaign_templates 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [templateId]);

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

/**
 * GET /api/campaign-templates/categories
 * Get all template categories
 */
router.get('/categories', async (req, res) => {
  try {
    const db = getDB();
    const categories = await db.query(`
      SELECT DISTINCT category 
      FROM campaign_templates 
      WHERE is_active = true AND category IS NOT NULL
      ORDER BY category
    `);

    res.json(categories.rows.map(row => row.category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;
