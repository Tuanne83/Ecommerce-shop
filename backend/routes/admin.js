const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// ========== USERS MANAGEMENT ==========

// Get all users
router.get('/users', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT 
        u.UserID,
        u.Username,
        u.UserFullname,
        u.Email,
        u.Balance,
        u.CreatedAt,
        u.RoleID,
        r.RoleName
      FROM Users u
      JOIN Roles r ON u.RoleID = r.RoleID
      ORDER BY u.CreatedAt DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user role
router.put('/users/:id/role', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { roleId } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('UserID', sql.Int, req.params.id);
    request.input('RoleID', sql.Int, roleId);
    
    await request.query(`
      UPDATE Users 
      SET RoleID = @RoleID 
      WHERE UserID = @UserID
    `);
    res.json({ message: 'Cập nhật role thành công' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update user balance
router.put('/users/:id/balance', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { balance } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('UserID', sql.Int, req.params.id);
    request.input('Balance', sql.Decimal(12, 2), balance);
    
    await request.query(`
      UPDATE Users 
      SET Balance = @Balance 
      WHERE UserID = @UserID
    `);
    res.json({ message: 'Cập nhật số dư thành công' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete user
router.delete('/users/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('UserID', sql.Int, req.params.id);
    
    await request.query('DELETE FROM Users WHERE UserID = @UserID');
    res.json({ message: 'Xóa user thành công' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========== SHOPS MANAGEMENT ==========

// Get all shops
router.get('/shops', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT 
        s.ShopID,
        s.ShopName,
        s.CreatedAt,
        u.Username as OwnerUsername,
        u.UserFullname as OwnerName,
        a.Street + ', ' + a.Ward + ', ' + a.District + ', ' + a.City as Address
      FROM Shops s
      JOIN Users u ON s.OwnerID = u.UserID
      JOIN Addresses a ON s.AddressID = a.AddressID
      ORDER BY s.CreatedAt DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete shop
router.delete('/shops/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('ShopID', sql.Int, req.params.id);
    
    await request.query('DELETE FROM Shops WHERE ShopID = @ShopID');
    res.json({ message: 'Xóa shop thành công' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========== PRODUCTS MANAGEMENT ==========

// Get all products
router.get('/products', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT 
        p.ProductID,
        p.ProductName,
        p.Price,
        p.Stock,
        p.ProductDescription,
        s.ShopName,
        u.Username as ShopOwner
      FROM Products p
      JOIN Shops s ON p.ShopID = s.ShopID
      JOIN Users u ON s.OwnerID = u.UserID
      ORDER BY p.ProductID DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product
router.delete('/products/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('ProductID', sql.Int, req.params.id);
    
    await request.query('DELETE FROM Products WHERE ProductID = @ProductID');
    res.json({ message: 'Xóa sản phẩm thành công' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========== ORDERS MANAGEMENT ==========

// Get all orders
router.get('/orders', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT 
        o.OrderID,
        o.OrderDate,
        o.TotalAmount,
        o.Status,
        u.Username,
        u.UserFullname,
        pm.MethodName as PaymentMethod,
        so.OptionName as ShippingOption
      FROM Orders o
      JOIN Users u ON o.UserID = u.UserID
      JOIN PaymentMethods pm ON o.PaymentMethodID = pm.PaymentMethodID
      JOIN ShippingOptions so ON o.ShippingOptionID = so.ShippingOptionID
      ORDER BY o.OrderDate DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status
router.put('/orders/:id/status', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('OrderID', sql.Int, req.params.id);
    request.input('Status', sql.NVarChar, status);
    
    await request.query(`
      UPDATE Orders 
      SET Status = @Status 
      WHERE OrderID = @OrderID
    `);
    res.json({ message: 'Cập nhật trạng thái đơn hàng thành công' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========== CATEGORIES MANAGEMENT ==========

// Get all categories
router.get('/categories', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Categories ORDER BY CategoryName');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete category
router.delete('/categories/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('CategoryID', sql.Int, req.params.id);
    
    await request.query('DELETE FROM Categories WHERE CategoryID = @CategoryID');
    res.json({ message: 'Xóa danh mục thành công' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========== STATISTICS ==========

// Get dashboard statistics
router.get('/statistics', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const pool = await getPool();
    
    const [usersRes, shopsRes, productsRes, ordersRes, revenueRes] = await Promise.all([
      pool.request().query('SELECT COUNT(*) as count FROM Users'),
      pool.request().query('SELECT COUNT(*) as count FROM Shops'),
      pool.request().query('SELECT COUNT(*) as count FROM Products'),
      pool.request().query('SELECT COUNT(*) as count FROM Orders'),
      pool.request().query(`
        SELECT 
          SUM(TotalAmount) as totalRevenue,
          COUNT(*) as totalOrders
        FROM Orders 
        WHERE Status IN ('Paid', 'Shipping', 'Completed')
      `)
    ]);
    
    const [pendingOrdersRes, completedOrdersRes] = await Promise.all([
      pool.request().query("SELECT COUNT(*) as count FROM Orders WHERE Status = 'Pending'"),
      pool.request().query("SELECT COUNT(*) as count FROM Orders WHERE Status = 'Completed'")
    ]);
    
    res.json({
      users: usersRes.recordset[0].count,
      shops: shopsRes.recordset[0].count,
      products: productsRes.recordset[0].count,
      orders: ordersRes.recordset[0].count,
      revenue: revenueRes.recordset[0].totalRevenue || 0,
      pendingOrders: pendingOrdersRes.recordset[0].count,
      completedOrders: completedOrdersRes.recordset[0].count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get roles
router.get('/roles', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Roles');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all transactions
router.get('/transactions', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT 
        t.TransactionID,
        t.Amount,
        t.TransactionType,
        t.Description,
        t.CreatedAt,
        u.Username,
        u.UserFullname
      FROM TransactionHistory t
      JOIN Users u ON t.UserID = u.UserID
      ORDER BY t.CreatedAt DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
