require('dotenv').config(); // Load environment variables first
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit'); // Import the rate limiter
const connectDB = require('./config/db.js');

// Initialize Express
const app = express();

// Trust proxy for express-rate-limit behind Render/Vercel reverse proxies
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// --- GLOBAL MIDDLEWARES ---
// 1. Security Headers
app.use(helmet()); 

// 2. Cross-Origin Resource Sharing
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true 
}));

// 3. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Cookie Parser
app.use(cookieParser());

// 5. Sanitize Data (Prevents NoSQL injection)
app.use(mongoSanitize());

// --- RATE LIMITING (DDoS & Brute Force Protection) ---

// Strict Login Limiter: Max 5 attempts per 15 minutes to stop brute-forcing
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, 
    message: { message: 'Too many login attempts. Please try again after 15 minutes to prevent brute-forcing.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict AI Chat Limiter: Max 15 prompts per 15 minutes to save Gemini API credits
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 15, 
    message: { message: 'AI Chat limit reached (15 msgs/15 mins). Please wait to prevent API billing abuse.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Standard Global Limiter: 100 requests per 15 minutes for standard browsing
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply limiters to specific routes BEFORE mapping the routers
app.use('/api/auth/login', loginLimiter);
app.use('/api/ai/chat', aiLimiter);
app.use('/api/', globalLimiter); // Catch-all for other /api routes

// --- ROUTES ---
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'TechTown API is running securely!' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));

// --- SERVER STARTUP ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});