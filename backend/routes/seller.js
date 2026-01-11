const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Create shop
router.post('/shop', authenticate, authorize('Seller'), async (req, res) => {
  try {
    const { shopName, street, ward, district, city } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('SellerID', sql.Int, req.user.userId);
    request.input('ShopName', sql.NVarChar, shopName);
    request.input('Street', sql.NVarChar, street);
    request.input('Ward', sql.NVarChar, ward);
    request.input('District', sql.NVarChar, district);
    request.input('City', sql.NVarChar, city);
    
    await request.execute('sp_CreateShopWithAddress');
    res.json({ message: 'Tạo shop thành công' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get seller's shops
router.get('/shops', authenticate, authorize('Seller'), async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('SellerID', sql.Int, req.user.userId);
    
    const result = await request.query(`
      SELECT 
        s.ShopID,
        s.ShopName,
        s.CreatedAt,
        a.Street + ', ' + a.Ward + ', ' + a.District + ', ' + a.City as Address
      FROM Shops s
      JOIN Addresses a ON s.AddressID = a.AddressID
      WHERE s.OwnerID = @SellerID
    `);
    
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add product to shop
router.post('/products', authenticate, authorize('Seller'), async (req, res) => {
  try {
    const { shopId, productName, price, description, stock } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('SellerID', sql.Int, req.user.userId);
    request.input('ShopID', sql.Int, shopId);
    request.input('ProductName', sql.NVarChar, productName);
    request.input('Price', sql.Decimal(12, 2), price);
    request.input('Description', sql.NVarChar, description);
    request.input('Stock', sql.Int, stock);
    
    await request.execute('sp_AddProductToShop');
    res.json({ message: 'Thêm sản phẩm thành công' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add product to category
router.post('/products/category', authenticate, authorize('Seller'), async (req, res) => {
  try {
    const { productId, categoryId } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('SellerID', sql.Int, req.user.userId);
    request.input('ProductID', sql.Int, productId);
    request.input('CategoryID', sql.Int, categoryId);
    
    await request.execute('sp_AddProductToCategory');
    res.json({ message: 'Gán sản phẩm vào danh mục thành công' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create category
router.post('/categories', authenticate, async (req, res) => {
  try {
    const { categoryName } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('CategoryName', sql.NVarChar, categoryName);
    
    await request.execute('sp_CreateCategory');
    res.json({ message: 'Tạo danh mục thành công' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
