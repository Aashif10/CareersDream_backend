const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();

// Middleware — CORS must come BEFORE routes and body parsers
app.use(cors({
  origin: [
    'https://www.careersdream.com',
    'https://careersdream.com',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight requests explicitly (Express 5 syntax)
app.options('/{*path}', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded profile images as static files
// Access via: http://localhost:5000/uploads/<filename>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/team', require('./routes/team'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api', require('./routes/questionRoutes'));


// Health check route
app.get('/', (req, res) => {
    res.json({ success: true, message: 'CareersDream API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
