const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Get cart items
router.get('/', authenticate, async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('UserID', sql.Int, req.user.userId);
    
    const result = await request.query(`
      SELECT 
        ci.CartItemID,
        ci.Quantity,
        p.ProductID,
        p.ProductName,
        p.Price,
        p.Stock,
        p.ProductDescription,
        s.ShopName
      FROM CartItems ci
      JOIN Carts c ON ci.CartID = c.CartID
      JOIN Products p ON ci.ProductID = p.ProductID
      JOIN Shops s ON p.ShopID = s.ShopID
      WHERE c.UserID = @UserID
    `);
    
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add product to cart
router.post('/add', authenticate, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('UserID', sql.Int, req.user.userId);
    request.input('ProductID', sql.Int, productId);
    request.input('Quantity', sql.Int, quantity);
    
    await request.execute('sp_AddProductToCart');
    res.json({ message: 'Thêm sản phẩm vào giỏ hàng thành công' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update cart item
router.put('/update', authenticate, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('UserID', sql.Int, req.user.userId);
    request.input('ProductID', sql.Int, productId);
    request.input('Quantity', sql.Int, quantity);
    
    await request.execute('sp_UpdateCartItem');
    res.json({ message: 'Cập nhật giỏ hàng thành công' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
