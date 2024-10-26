const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

let lastGeneratedTime = 0;
const INTERVAL = 5000; // 20 seconds in milliseconds

// Middleware to check and generate data if needed
const generateDataMiddleware = async (req, res, next) => {
  const currentTime = Date.now();
  if (currentTime - lastGeneratedTime >= INTERVAL) {
    try {
      const sensorData = {
        temperature: parseFloat((Math.random() * 10 + 20).toFixed(1)),
        humidity: parseFloat((Math.random() * 40 + 40).toFixed(1)),
        carbonDioxide: parseFloat((Math.random() * 500 + 300).toFixed(1)),
        ammonia: parseFloat((Math.random() * 30).toFixed(1)),
        timestamp: new Date()
      };

      await supabase.from('sensor_data').insert([sensorData]);
      lastGeneratedTime = currentTime;
    } catch (error) {
      console.error('Error generating data:', error);
    }
  }
  next();
};

// Apply middleware to all routes
app.use(generateDataMiddleware);

// Your existing endpoints...
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/api/sensor-data', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sensor_data')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/sensor-data', async (req, res) => {
  try {
    const sensorData = {
      temperature: parseFloat((Math.random() * 10 + 20).toFixed(1)),
      humidity: parseFloat((Math.random() * 40 + 40).toFixed(1)),
      carbonDioxide: parseFloat((Math.random() * 500 + 300).toFixed(1)),
      ammonia: parseFloat((Math.random() * 30).toFixed(1)),
      timestamp: new Date()
    };

    const { error } = await supabase
      .from('sensor_data')
      .insert([sensorData]);

    if (error) throw error;

    res.json({ message: 'Data added successfully', data: sensorData });
  } catch (error) {
    console.error('Error adding data:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = app;