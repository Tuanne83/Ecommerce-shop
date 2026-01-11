const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Get user info
router.get('/me', authenticate, async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('UserID', sql.Int, req.user.userId);
    
    const result = await request.query(`
      SELECT 
        u.UserID,
        u.Username,
        u.UserFullname,
        u.Email,
        u.Balance,
        u.CreatedAt,
        r.RoleName
      FROM Users u
      JOIN Roles r ON u.RoleID = r.RoleID
      WHERE u.UserID = @UserID
    `);
    
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add shipping address
router.post('/address', authenticate, async (req, res) => {
  try {
    const { street, ward, district, city } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('UserID', sql.Int, req.user.userId);
    request.input('Street', sql.NVarChar, street);
    request.input('Ward', sql.NVarChar, ward);
    request.input('District', sql.NVarChar, district);
    request.input('City', sql.NVarChar, city);
    
    await request.execute('sp_AddShippingAddressForCus');
    res.json({ message: 'Thêm địa chỉ giao hàng thành công' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get user addresses
router.get('/addresses', authenticate, async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('UserID', sql.Int, req.user.userId);
    
    const result = await request.query(`
      SELECT 
        AddressID,
        Street,
        Ward,
        District,
        City,
        Street + ', ' + Ward + ', ' + District + ', ' + City as FullAddress
      FROM Addresses
      WHERE UserID = @UserID
    `);
    
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get transaction history
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('UserID', sql.Int, req.user.userId);
    
    const result = await request.query(`
      SELECT 
        TransactionID,
        Amount,
        TransactionType,
        Description,
        CreatedAt
      FROM TransactionHistory
      WHERE UserID = @UserID
      ORDER BY CreatedAt DESC
    `);
    
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
