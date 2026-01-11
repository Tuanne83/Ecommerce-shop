const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/database');

// Get all products
router.get('/', async (req, res) => {
  try {
    const { categoryId, shopId, search } = req.query;
    const pool = await getPool();
    let query = `
      SELECT 
        p.ProductID,
        p.ProductName,
        p.Price,
        p.Stock,
        p.ProductDescription,
        p.ShopID,
        s.ShopName,
        STRING_AGG(c.CategoryName, ', ') as Categories
      FROM Products p
      JOIN Shops s ON p.ShopID = s.ShopID
      LEFT JOIN ProductCategories pc ON p.ProductID = pc.ProductID
      LEFT JOIN Categories c ON pc.CategoryID = c.CategoryID
      WHERE 1=1
    `;
    
    const request = pool.request();
    
    if (categoryId) {
      query += ' AND EXISTS (SELECT 1 FROM ProductCategories WHERE ProductID = p.ProductID AND CategoryID = @CategoryID)';
      request.input('CategoryID', sql.Int, categoryId);
    }
    
    if (shopId) {
      query += ' AND p.ShopID = @ShopID';
      request.input('ShopID', sql.Int, shopId);
    }
    
    if (search) {
      query += ' AND (p.ProductName LIKE @Search OR p.ProductDescription LIKE @Search)';
      request.input('Search', sql.NVarChar, `%${search}%`);
    }
    
    query += ' GROUP BY p.ProductID, p.ProductName, p.Price, p.Stock, p.ProductDescription, p.ShopID, s.ShopName';
    
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('ProductID', sql.Int, req.params.id);
    
    const result = await request.query(`
      SELECT 
        p.*,
        s.ShopName,
        STRING_AGG(c.CategoryName, ', ') as Categories
      FROM Products p
      JOIN Shops s ON p.ShopID = s.ShopID
      LEFT JOIN ProductCategories pc ON p.ProductID = pc.ProductID
      LEFT JOIN Categories c ON pc.CategoryID = c.CategoryID
      WHERE p.ProductID = @ProductID
      GROUP BY p.ProductID, p.ProductName, p.Price, p.Stock, p.ProductDescription, p.ShopID, s.ShopName
    `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get categories
router.get('/categories/all', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Categories ORDER BY CategoryName');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
