const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Add root path handler
app.get('/', (_, res) => {
  res.json({ message: 'Server is running' });
});

// Endpoint esp32
app.post('/api/sensor-data', async (req, res) => {

  try {
    // Simpan data ke Supabase
    const { error } = await supabase
      .from('sensor_data')
      .insert([req.body]);

    if (error) throw error;
    res.status(201).json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving sensor data:', error);
    res.status(500).json({ message: 'Failed to save data' });
  }
});

app.get('/api/sensor-data', async (_, res) => {
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

const PORT = process.env.PORT || 3000; // 3000 sebagai default jika tidak ada port yang diberikan.

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;