const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ------------------- Dashboard APIs -------------------
router.get('/metrics', authenticateToken, async (req, res) => {
    try {
        const [customers] = await pool.query('SELECT COUNT(*) AS total_customers FROM customers;');
        const [orders] = await pool.query('SELECT COUNT(*) AS total_orders FROM orders;');
        const [revenue] = await pool.query(
            "SELECT SUM(total_price) AS total_revenue FROM orders WHERE financial_status IN ('paid','partially_paid','refunded');"
        );

        res.status(200).json({
            total_customers: customers[0].total_customers,
            total_orders: orders[0].total_orders,
            total_revenue: revenue[0].total_revenue,
        });
    } catch (err) {
        console.error('Error fetching metrics:', err);
        res.status(500).json('Internal Server Error');
    }
});

router.get('/orders-by-date', authenticateToken, async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        console.log("📅 orders-by-date range:", start_date, "to", end_date);
        const query = `
            SELECT DATE(created_at) AS order_date, COUNT(*) AS order_count,
            SUM(total_price) AS total_revenue
            FROM orders
            WHERE DATE(created_at) BETWEEN ? AND ?
            GROUP BY order_date
            ORDER BY order_date ASC;
        `;
        const [results] = await pool.query(query, [start_date, end_date]);
        console.log(results);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching orders by date:', err);
        res.status(500).json('Internal Server Error');
    }
});

router.get('/top-customers', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                c.id,
                c.first_name,
                c.last_name,
                c.email,
                COUNT(o.id) AS total_orders,
                COALESCE(SUM(o.total_price), 0) AS total_spend
            FROM customers c
            LEFT JOIN orders o ON o.customer_id = c.id
            GROUP BY c.id, c.first_name, c.last_name, c.email
            ORDER BY total_spend DESC
            LIMIT 5;
        `;
        const [results] = await pool.query(query);
        res.status(200).json({
            topCustomers: results,
            message: results.length > 0 ? `Found ${results.length} customer(s)` : 'No customers found yet'
        });
    } catch (err) {
        console.error('Error fetching top customers:', err);
        res.status(500).json('Internal Server Error');
    }
});

router.get('/products', authenticateToken, async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products ORDER BY created_at DESC;');
        res.status(200).json(products);
    } catch (err) {
        console.error('Error fetching all products:', err);
        res.status(500).json('Internal Server Error');
    }
});

router.get('/customers', authenticateToken, async (req, res) => {
    try {
        const [customers] = await pool.query('SELECT * FROM customers ORDER BY created_at DESC;');
        res.status(200).json(customers);
    } catch (err) {
        console.error('Error fetching all customers:', err);
        res.status(500).json('Internal Server Error');
    }
});

router.get('/orders', authenticateToken, async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC;');
        res.status(200).json(orders);
    } catch (err) {
        console.error('Error fetching all orders:', err);
        res.status(500).json('Internal Server Error');
    }
});

module.exports = router;