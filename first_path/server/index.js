require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

const journeyRoutes = require('./routes/discord');
app.use('/journey', journeyRoutes);

require('./bot/scheduler');

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`FirstPath backend running on port ${PORT}`);
});
