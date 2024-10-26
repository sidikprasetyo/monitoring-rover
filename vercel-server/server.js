const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Setup Express
const app = express();

// Allow CORS
app.use(cors());
app.use(express.json());

// Serve static files (for your HTML, CSS, and JS)
// app.use(express.static('public'));

// Setup Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Generate and save dummy sensor data to Supabase every 5 seconds
setInterval(async () => {
  const sensorData = {
    temperature: parseFloat((Math.random() * 10 + 20).toFixed(1)),
    humidity: parseFloat((Math.random() * 40 + 40).toFixed(1)),
    carbonDioxide: parseFloat((Math.random() * 500 + 300).toFixed(1)),
    ammonia: parseFloat((Math.random() * 30).toFixed(1)),
    timestamp: new Date()
  };

  // Save sensor data to Supabase
  const { error } = await supabase
    .from('sensor_data')
    .insert([sensorData]);

  if (error) {
    console.error('Error saving sensor data:', error);
  }
}, 5000);

// Endpoint to get all sensor data
app.get('/api/sensor-data', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sensor_data')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

module.exports = app;