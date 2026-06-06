require('dotenv').config(); // Load environment variables first
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db.js');

// Initialize Express
const app = express();

// Connect to MongoDB
connectDB();

// --- GLOBAL MIDDLEWARES ---
// 1. Security Headers
app.use(helmet()); 

// 2. Cross-Origin Resource Sharing (Allows your React frontend to talk to this API)
app.use(cors({
    origin: 'http://localhost:5173', // Default Vite port for React
    credentials: true // Crucial for allowing HTTP-only cookies (JWT) to be sent
}));

// 3. Body Parsers (To read JSON and URL-encoded data from requests)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Cookie Parser (To read the JWT cookie for authentication)
app.use(cookieParser());

// 5. Sanitize Data (Prevents NoSQL injection attacks)
app.use(mongoSanitize());

// --- ROUTES ---
// Basic health check route to test the server
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'TechTown API is running securely!' });
});

// Auth routes (for registration, login, logout)
app.use('/api/auth', require('./routes/authRoutes'));

// Product routes (for CRUD operations on products)
app.use('/api/products', require('./routes/productRoutes'));

// Order routes (for creating and managing orders)
app.use('/api/orders', require('./routes/orderRoutes'));

// AI Chat route (for interacting with the AI bot)
app.use('/api/ai', require('./routes/aiRoutes'));

// Cart routes (for managing the shopping cart)
app.use('/api/cart', require('./routes/cartRoutes'));

// --- SERVER STARTUP ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});