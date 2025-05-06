require('dotenv').config();
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const scanRoutes = require('./routes/scans');
const userRoutes = require('./routes/users');


const app = express();

app.use((req, res, next) => {
  res.removeHeader('X-Powered-By');
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/scans', scanRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));