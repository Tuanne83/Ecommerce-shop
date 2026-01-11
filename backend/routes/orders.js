const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Get user orders
router.get('/', authenticate, async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('UserID', sql.Int, req.user.userId);
    
    const result = await request.query(`
      SELECT 
        o.OrderID,
        o.OrderDate,
        o.TotalAmount,
        o.Status,
        pm.MethodName as PaymentMethod,
        so.OptionName as ShippingOption,
        so.Cost as ShippingCost,
        a.Street + ', ' + a.Ward + ', ' + a.District + ', ' + a.City as ShippingAddress
      FROM Orders o
      JOIN PaymentMethods pm ON o.PaymentMethodID = pm.PaymentMethodID
      JOIN ShippingOptions so ON o.ShippingOptionID = so.ShippingOptionID
      JOIN Addresses a ON o.ShippingAddressID = a.AddressID
      WHERE o.UserID = @UserID
      ORDER BY o.OrderDate DESC
    `);
    
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('OrderID', sql.Int, req.params.id);
    request.input('UserID', sql.Int, req.user.userId);
    
    const orderResult = await request.query(`
      SELECT 
        o.*,
        pm.MethodName as PaymentMethod,
        so.OptionName as ShippingOption,
        so.Cost as ShippingCost,
        a.Street + ', ' + a.Ward + ', ' + a.District + ', ' + a.City as ShippingAddress
      FROM Orders o
      JOIN PaymentMethods pm ON o.PaymentMethodID = pm.PaymentMethodID
      JOIN ShippingOptions so ON o.ShippingOptionID = so.ShippingOptionID
      JOIN Addresses a ON o.ShippingAddressID = a.AddressID
      WHERE o.OrderID = @OrderID AND o.UserID = @UserID
    `);
    
    if (orderResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const itemsRequest = pool.request();
    itemsRequest.input('OrderID', sql.Int, req.params.id);
    const itemsResult = await itemsRequest.query(`
      SELECT 
        oi.*,
        p.ProductName,
        p.ProductDescription
      FROM OrderItems oi
      JOIN Products p ON oi.ProductID = p.ProductID
      WHERE oi.OrderID = @OrderID
    `);
    
    res.json({
      order: orderResult.recordset[0],
      items: itemsResult.recordset
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create order from cart
router.post('/create', authenticate, async (req, res) => {
  try {
    const { shippingOptionId, paymentMethodId, shippingAddressId } = req.body;
    const pool = await getPool();
    const request = pool.request();
    request.input('UserID', sql.Int, req.user.userId);
    request.input('ShippingOptionID', sql.Int, shippingOptionId);
    request.input('PaymentMethodID', sql.Int, paymentMethodId);
    request.input('ShippingAddressID', sql.Int, shippingAddressId);
    
    await request.execute('sp_CreateOrderFromCart');
    res.json({ message: 'Tạo đơn hàng thành công' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Pay order
router.post('/:id/pay', authenticate, async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('OrderID', sql.Int, req.params.id);
    
    await request.execute('sp_PayOrder');
    res.json({ message: 'Thanh toán thành công' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get shipping options
router.get('/shipping/options', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT 
        so.ShippingOptionID,
        so.OptionName,
        so.Cost,
        sc.CompanyName
      FROM ShippingOptions so
      JOIN ShippingCompanies sc ON so.CompanyID = sc.CompanyID
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get payment methods
router.get('/payment/methods', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM PaymentMethods');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
