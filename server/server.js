// Smart Lab - main server file
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/issues', require('./routes/issues'));
app.use('/api/users', require('./routes/users'));
app.use('/api/stats', require('./routes/stats'));

// simple test route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Smart Lab API is running' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_lab_db';

// connect to MongoDB first, then start the server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected: ' + mongoose.connection.name);
    app.listen(PORT, '0.0.0.0', () => {
      console.log('Server running on http://localhost:' + PORT);
    });
  })
  .catch((err) => {
    console.log('MongoDB connection failed: ' + err.message);
    console.log('Check that MongoDB is running and MONGO_URI in server/.env is correct.');
  });
