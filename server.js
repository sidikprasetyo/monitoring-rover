const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Setup Express and Socket.IO
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Allow CORS
app.use(cors());
app.use(express.json());

// Serve static files (for your HTML, CSS, and JS)
app.use(express.static('public'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Define a sensor data schema
const sensorDataSchema = new mongoose.Schema({
    suhu: Number,
    kelembapan: Number,
    co2: Number,
    nh3: Number,
    timestamp: { type: Date, default: Date.now }
});

// Create a model from the schema
const SensorData = mongoose.model('SensorData', sensorDataSchema);

// Generate dummy sensor data every 5 seconds
setInterval(async () => {
  const sensorData = {
    suhu: parseFloat((Math.random() * 10 + 20).toFixed(1)),
    kelembapan: parseFloat((Math.random() * 40 + 40).toFixed(1)),
    co2: parseFloat((Math.random() * 500 + 300).toFixed(1)),
    nh3: parseFloat((Math.random() * 30).toFixed(1))
  };

  // Save sensor data to MongoDB
  try {
    const newSensorData = new SensorData(sensorData);
    await newSensorData.save();
    // Emit data to clients via Socket.IO
    io.emit('sensor-data', sensorData);
  } catch (error) {
    console.error('Error saving sensor data:', error);
  }
}, 5000);

// Set up Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Endpoint to get all sensor data
app.get('/api/sensor-data', async (req, res) => {
  try {
      const data = await SensorData.find().sort({ timestamp: -1 });
      res.json(data);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// Use process.env.PORT to listen for requests
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
