/**
 * Properties Routes
 * 
 * Manages real estate property listings:
 * 1. Get all properties with filtering and search
 * 2. Create new property listings
 * 3. Update existing properties
 * 4. Delete properties
 * 5. Property matching algorithm for customers
 */

const express = require('express');
const { getDB } = require('../config/database');
const router = express.Router();

/**
 * GET ALL PROPERTIES
 * GET /api/properties
 * 
 * Returns paginated list of properties with filtering options
 */
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    
    // Parse query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Filter parameters
    const propertyType = req.query.property_type;
    const transactionType = req.query.transaction_type;
    const city = req.query.city;
    const minPrice = req.query.min_price;
    const maxPrice = req.query.max_price;
    const bedrooms = req.query.bedrooms;
    const status = req.query.status || 'available';
    const search = req.query.search;
    
    // Build WHERE clause
    let whereConditions = ['status = $1'];
    let queryParams = [status];
    let paramIndex = 2;
    
    if (propertyType) {
      whereConditions.push(`property_type = $${paramIndex}`);
      queryParams.push(propertyType);
      paramIndex++;
    }
    
    if (transactionType) {
      whereConditions.push(`transaction_type = $${paramIndex}`);
      queryParams.push(transactionType);
      paramIndex++;
    }
    
    if (city) {
      whereConditions.push(`city ILIKE $${paramIndex}`);
      queryParams.push(`%${city}%`);
      paramIndex++;
    }
    
    if (minPrice) {
      whereConditions.push(`price >= $${paramIndex}`);
      queryParams.push(parseInt(minPrice));
      paramIndex++;
    }
    
    if (maxPrice) {
      whereConditions.push(`price <= $${paramIndex}`);
      queryParams.push(parseInt(maxPrice));
      paramIndex++;
    }
    
    if (bedrooms) {
      whereConditions.push(`bedrooms >= $${paramIndex}`);
      queryParams.push(parseInt(bedrooms));
      paramIndex++;
    }
    
    if (search) {
      whereConditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR address ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
    
    // Get properties with pagination
    const propertiesQuery = `
      SELECT 
        id, title, description, property_type, transaction_type, price, currency,
        address, city, region, bedrooms, bathrooms, area_sqm, furnished,
        parking, security, images, virtual_tour_url, status, created_at, updated_at
      FROM properties 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    
    const propertiesResult = await db.query(propertiesQuery, queryParams);
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM properties ${whereClause}`;
    const countResult = await db.query(countQuery, queryParams.slice(0, -2)); // Remove limit and offset
    
    const totalProperties = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalProperties / limit);
    
    res.json({
      properties: propertiesResult.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalProperties,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching properties:', error);
    res.status(500).json({
      error: 'Failed to fetch properties',
      message: 'Unable to retrieve property listings'
    });
  }
});

/**
 * GET PROPERTY BY ID
 * GET /api/properties/:id
 * 
 * Returns detailed information about a specific property
 */
router.get('/:id', async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    const db = getDB();
    
    const propertyResult = await db.query(
      'SELECT * FROM properties WHERE id = $1',
      [propertyId]
    );
    
    if (propertyResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Property not found',
        message: 'No property found with the specified ID'
      });
    }
    
    const property = propertyResult.rows[0];
    
    // Get property match history (which customers viewed this property)
    const matchesResult = await db.query(`
      SELECT pm.*, c.name, c.phone, c.customer_interest, c.feedback
      FROM property_matches pm
      JOIN contacts c ON pm.contact_id = c.id
      WHERE pm.property_id = $1
      ORDER BY pm.shown_at DESC
    `, [propertyId]);
    
    res.json({
      property,
      viewHistory: matchesResult.rows
    });
    
  } catch (error) {
    console.error('❌ Error fetching property:', error);
    res.status(500).json({
      error: 'Failed to fetch property',
      message: 'Unable to retrieve property details'
    });
  }
});

/**
 * CREATE NEW PROPERTY
 * POST /api/properties
 * 
 * Creates a new property listing
 */
router.post('/', async (req, res) => {
  try {
    const {
      title, description, property_type, transaction_type, price, currency = 'XAF',
      address, city, region, country = 'Cameroon', latitude, longitude,
      bedrooms, bathrooms, area_sqm, furnished = false, parking = false, security = false,
      images = [], virtual_tour_url, documents = [], owner_id
    } = req.body;
    
    // Validate required fields
    if (!title || !property_type || !transaction_type || !price || !city) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'property_type', 'transaction_type', 'price', 'city']
      });
    }
    
    const db = getDB();
    
    const newProperty = await db.query(`
      INSERT INTO properties (
        title, description, property_type, transaction_type, price, currency,
        address, city, region, country, latitude, longitude,
        bedrooms, bathrooms, area_sqm, furnished, parking, security,
        images, virtual_tour_url, documents, owner_id, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *
    `, [
      title, description, property_type, transaction_type, price, currency,
      address, city, region, country, latitude, longitude,
      bedrooms, bathrooms, area_sqm, furnished, parking, security,
      images, virtual_tour_url, documents, owner_id
    ]);
    
    console.log('✅ New property created:', newProperty.rows[0].id);
    
    res.status(201).json({
      message: 'Property created successfully',
      property: newProperty.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Error creating property:', error);
    res.status(500).json({
      error: 'Failed to create property',
      message: 'Unable to create property listing'
    });
  }
});

/**
 * PROPERTY MATCHING ALGORITHM
 * POST /api/properties/match
 * 
 * Finds properties that match a customer's preferences
 */
router.post('/match', async (req, res) => {
  try {
    const {
      intent, budget_min, budget_max, preferred_location,
      property_type, bedrooms, transaction_type
    } = req.body;
    
    const db = getDB();
    
    // Build matching query
    let whereConditions = ["status = 'available'"];
    let queryParams = [];
    let paramIndex = 1;
    
    // Transaction type (buy/rent)
    if (transaction_type) {
      whereConditions.push(`transaction_type = $${paramIndex}`);
      queryParams.push(transaction_type);
      paramIndex++;
    }
    
    // Budget range
    if (budget_min) {
      whereConditions.push(`price >= $${paramIndex}`);
      queryParams.push(budget_min);
      paramIndex++;
    }
    
    if (budget_max) {
      whereConditions.push(`price <= $${paramIndex}`);
      queryParams.push(budget_max);
      paramIndex++;
    }
    
    // Location preference
    if (preferred_location) {
      whereConditions.push(`(city ILIKE $${paramIndex} OR region ILIKE $${paramIndex} OR address ILIKE $${paramIndex})`);
      queryParams.push(`%${preferred_location}%`);
      paramIndex++;
    }
    
    // Property type
    if (property_type) {
      whereConditions.push(`property_type = $${paramIndex}`);
      queryParams.push(property_type);
      paramIndex++;
    }
    
    // Minimum bedrooms
    if (bedrooms) {
      whereConditions.push(`bedrooms >= $${paramIndex}`);
      queryParams.push(bedrooms);
      paramIndex++;
    }
    
    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
    
    // Calculate match scores and get properties
    const matchQuery = `
      SELECT *,
        CASE 
          WHEN city ILIKE $${paramIndex} THEN 40
          WHEN region ILIKE $${paramIndex} THEN 20
          ELSE 0
        END +
        CASE 
          WHEN price BETWEEN $${paramIndex + 1} AND $${paramIndex + 2} THEN 30
          WHEN price <= $${paramIndex + 2} THEN 20
          ELSE 0
        END +
        CASE 
          WHEN property_type = $${paramIndex + 3} THEN 20
          ELSE 0
        END +
        CASE 
          WHEN bedrooms >= $${paramIndex + 4} THEN 10
          ELSE 0
        END as match_score
      FROM properties 
      ${whereClause}
      ORDER BY match_score DESC, price ASC
      LIMIT 10
    `;
    
    // Add parameters for match scoring
    queryParams.push(
      `%${preferred_location || ''}%`,  // Location match
      budget_min || 0,                  // Budget min
      budget_max || 999999999,          // Budget max
      property_type || '',              // Property type
      bedrooms || 0                     // Bedrooms
    );
    
    const matchResult = await db.query(matchQuery, queryParams);
    
    res.json({
      matches: matchResult.rows,
      totalMatches: matchResult.rows.length,
      searchCriteria: {
        intent, budget_min, budget_max, preferred_location,
        property_type, bedrooms, transaction_type
      }
    });
    
  } catch (error) {
    console.error('❌ Error matching properties:', error);
    res.status(500).json({
      error: 'Failed to match properties',
      message: 'Unable to find matching properties'
    });
  }
});

/**
 * GET PROPERTY STATISTICS
 * GET /api/properties/stats/overview
 * 
 * Returns analytics about properties
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const db = getDB();
    
    const stats = await Promise.all([
      // Total properties
      db.query('SELECT COUNT(*) as total FROM properties'),
      
      // Properties by type
      db.query(`
        SELECT property_type, COUNT(*) as count 
        FROM properties 
        GROUP BY property_type 
        ORDER BY count DESC
      `),
      
      // Properties by transaction type
      db.query(`
        SELECT transaction_type, COUNT(*) as count 
        FROM properties 
        GROUP BY transaction_type
      `),
      
      // Properties by status
      db.query(`
        SELECT status, COUNT(*) as count 
        FROM properties 
        GROUP BY status
      `),
      
      // Average prices by property type
      db.query(`
        SELECT property_type, AVG(price) as avg_price, MIN(price) as min_price, MAX(price) as max_price
        FROM properties 
        WHERE status = 'available'
        GROUP BY property_type
      `),
      
      // Properties by city (top 10)
      db.query(`
        SELECT city, COUNT(*) as count 
        FROM properties 
        GROUP BY city 
        ORDER BY count DESC 
        LIMIT 10
      `)
    ]);
    
    res.json({
      totalProperties: parseInt(stats[0].rows[0].total),
      propertiesByType: stats[1].rows,
      propertiesByTransaction: stats[2].rows,
      propertiesByStatus: stats[3].rows,
      averagePrices: stats[4].rows,
      propertiesByCity: stats[5].rows
    });
    
  } catch (error) {
    console.error('❌ Error fetching property stats:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: 'Unable to retrieve property statistics'
    });
  }
});

/**
 * DELETE PROPERTY
 * DELETE /api/properties/:id
 *
 * Deletes a property and all related data
 */
router.delete('/:id', async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    const db = getDB();

    // Check if property exists
    const existingProperty = await db.query(
      'SELECT id, title FROM properties WHERE id = $1',
      [propertyId]
    );

    if (existingProperty.rows.length === 0) {
      return res.status(404).json({
        error: 'Property not found',
        message: 'No property found with the specified ID'
      });
    }

    const propertyTitle = existingProperty.rows[0].title;

    // Delete property (this will cascade delete property_matches)
    await db.query('DELETE FROM properties WHERE id = $1', [propertyId]);

    console.log('✅ Property deleted:', propertyId, propertyTitle);

    res.json({
      message: 'Property deleted successfully',
      deletedProperty: { id: propertyId, title: propertyTitle }
    });

  } catch (error) {
    console.error('❌ Error deleting property:', error);
    res.status(500).json({
      error: 'Failed to delete property',
      message: 'Unable to delete property'
    });
  }
});

module.exports = router;
