const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/database');
const jwt = require('jsonwebtoken');

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { username, fullname, password, email } = req.body;
    const pool = await getPool();
    
    const request = pool.request();
    request.input('Username', sql.NVarChar, username);
    request.input('Fullname', sql.NVarChar, fullname);
    request.input('Password', sql.NVarChar, password);
    request.input('RoleID', sql.Int, 3); // Default to Customer role
    request.input('Email', sql.NVarChar, email);
    
    await request.execute('sp_SignUp');
    
    res.json({ message: 'Đăng ký thành công' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const pool = await getPool();
    
    const request = pool.request();
    request.input('Username', sql.NVarChar, username);
    request.input('Password', sql.NVarChar, password);
    
    const result = await request.execute('sp_Login');
    
    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Sai username hoặc password' });
    }
    
    const user = result.recordset[0];
    const token = jwt.sign(
      { 
        userId: user.UserID, 
        username: user.Username,
        roleName: user.RoleName 
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token,
      user: {
        UserID: user.UserID,
        Username: user.Username,
        UserFullname: user.UserFullname,
        Email: user.Email,
        RoleName: user.RoleName,
        Balance: user.Balance
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
