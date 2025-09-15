const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const router = express.Router();

// Registration Endpoint for ADMIN Users
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(409).json('Admin user with this email already exists.');

        const passwordHash = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash]);
        res.status(201).json('Admin user registered successfully');
    } catch (err) {
        console.error('Error during admin registration:', err);
        res.status(500).json('Internal Server Error');
    }
});

// Login Endpoint for ADMIN Users
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json('Invalid email or password');

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json('Invalid email or password');

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
        console.log(token);
        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        console.error('Error during admin login:', err);
        res.status(500).json('Internal Server Error');
    }
});

module.exports = router;