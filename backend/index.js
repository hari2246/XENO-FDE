require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { setupDatabase, pool } = require('./db');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();

// ---------------------------- Middleware ----------------------------
const corsOptions = {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions));

// This middleware is for parsing JSON bodies in non-webhook routes.
// It is moved AFTER the webhook route to ensure webhooks receive the raw body.
// app.use(express.json());

// ---------------------------- Routes ----------------------------
// Public authentication routes for customers

// Protected routes for admin users


// The webhook route must be defined *before* the global express.json() middleware.
// express.raw() is used here to get the raw body buffer for HMAC verification.
app.use('/webhooks', webhookRoutes);

// Now, we can safely use express.json() for all other routes.
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', apiRoutes);

// ---------------------------- Start Server & Database ----------------------------
async function startApp() {
    try {
        await setupDatabase();
        
        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => console.log(`✅ Listening on ${PORT}`));
    } catch (err) {
        console.error('❌ Application startup failed:', err);
        process.exit(1);
    }
}

startApp();