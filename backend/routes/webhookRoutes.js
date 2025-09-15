const express = require('express');
const crypto = require('crypto');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth'); // This import is not used in this file but kept for consistency

const router = express.Router();

router.post('/shopify', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
        const topicHeader = req.get('X-Shopify-Topic');

        const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
        console.log('--- HMAC Verification Debug ---');
        console.log('Secret Key:', process.env.SHOPIFY_WEBHOOK_SECRET);
        console.log('HMAC Header from Shopify:', hmacHeader);
        console.log('Raw Request Body (first 50 chars):', rawBody.toString('utf8').substring(0, 50));
        console.log('--- End Debug ---');
        const digest = crypto
            .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
            .update(rawBody)
            .digest('base64');

        if (digest !== hmacHeader) return res.status(401).send('Invalid HMAC');

        const data = JSON.parse(rawBody.toString('utf8'));
        console.log(`✅ Webhook received: ${topicHeader}`);

        let query, values, tableName;
        const eventId = data.id;

        switch (topicHeader) {
            case 'orders/create':
            case 'orders/updated':
                tableName = 'orders';
                query = `INSERT INTO orders (id, order_number, total_price, currency, financial_status, created_at, customer_id, payload) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                values = [eventId, data.order_number, data.total_price, data.currency, data.financial_status, data.created_at, data.customer.id, JSON.stringify(data)];
                break;

            case 'products/create':
            case 'products/update':
                tableName = 'products';
                query = `INSERT INTO products (id, title, product_type, vendor, created_at, payload) VALUES (?, ?, ?, ?, ?, ?)`;
                values = [eventId, data.title, data.product_type, data.vendor, data.created_at, JSON.stringify(data)];
                break;

            case 'customers/create':
            case 'customers/update':
                tableName = 'customers';
                query = `INSERT INTO customers (id, first_name, last_name, email, accepts_marketing, created_at, payload) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                values = [eventId, data.first_name, data.last_name, data.email, data.accepts_marketing, data.created_at, JSON.stringify(data)];
                break;

            case 'checkouts/create':
                tableName = 'checkouts';
                query = `INSERT INTO checkouts (id, cart_token, customer_id, total_price, created_at, payload) VALUES (?, ?, ?, ?, ?, ?)`;
                values = [eventId, data.cart_token, data.customer_id, data.total_price, data.created_at, JSON.stringify(data)];
                break;

            case 'carts/create':
                tableName = 'carts';
                query = `INSERT INTO carts (id, cart_token, customer_id, payload) VALUES (?, ?, ?, ?)`;
                values = [eventId, data.token, data.customer ? data.customer.id : null, JSON.stringify(data)];
                break;

            default:
                console.log(`❕ Unhandled topic: ${topicHeader}`);
                return res.status(200).send('OK');
        }

        await pool.query(query, values);
        console.log(`✅ Saved to table "${tableName}"`);

        let eventType = '';
        if (topicHeader.startsWith('orders/')) eventType = 'order_created';
        else if (topicHeader.startsWith('checkouts/')) eventType = 'checkout_started';
        else if (topicHeader.startsWith('carts/')) eventType = 'cart_created';

        if (eventType) {
            await pool.query(
                'INSERT INTO events (event_type, entity_id, payload) VALUES (?, ?, ?)',
                [eventType, eventId.toString(), JSON.stringify(data)]
            );
            console.log(`✅ Event "${eventType}" logged successfully.`);
        }

        res.status(200).send('OK');
    } catch (err) {
        console.error('❌ Error processing webhook:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;