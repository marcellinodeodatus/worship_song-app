const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path'); // Add path module to serve the frontend
const Song = require('./models/song'); // Import the Song model
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection URI from .env
const uri = process.env.MONGODB_URI;

async function run() {
  try {
    // Connect to MongoDB using Mongoose
    await mongoose.connect(uri);
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// Serve static files from the React app (frontend/build)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API Routes
app.get('/api', (req, res) => {
  res.send('Worship Song API is running');
});

// Create a new song in the appropriate database
app.post('/songs/:leader', async (req, res) => {
  const leader = req.params.leader;
  const dbName = leader === 'Nikita' ? 'worship_songs_db' : 'grace_worship_songs_db';
  const song = new Song(req.body);

  try {
    const db = mongoose.connection.useDb(dbName);
    const createdSong = await db.model('Song', Song.schema).create(song);
    res.status(201).send(createdSong);
  } catch (error) {
    console.error("Error creating song:", error);
    res.status(400).send(error);
  }
});

// Get all songs for a specific worship leader
app.get('/songs/:leader', async (req, res) => {
  const leader = req.params.leader;
  const dbName = leader === 'Nikita' ? 'worship_songs_db' : 'grace_worship_songs_db';

  try {
    const db = mongoose.connection.useDb(dbName);
    const songs = await db.model('Song', Song.schema).find().select('-__v'); // Exclude the __v field
    res.status(200).send(songs);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a song for a specific worship leader
app.put('/songs/:leader/:id', async (req, res) => {
  const leader = req.params.leader;
  const dbName = leader === 'Nikita' ? 'worship_songs_db' : 'grace_worship_songs_db';

  try {
    const db = mongoose.connection.useDb(dbName);
    const song = await db.model('Song', Song.schema).findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!song) {
      return res.status(404).send();
    }
    res.send(song);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a song for a specific worship leader
app.delete('/songs/:leader/:id', async (req, res) => {
  const leader = req.params.leader;
  const dbName = leader === 'Nikita' ? 'worship_songs_db' : 'grace_worship_songs_db';

  try {
    const db = mongoose.connection.useDb(dbName);
    const song = await db.model('Song', Song.schema).findByIdAndDelete(req.params.id);
    if (!song) {
      return res.status(404).send(); // Song not found
    }
    res.send(song); // Return the deleted song
  } catch (error) {
    console.error("Error deleting song:", error);
    res.status(500).send(error);
  }
});

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Call the run function to start everything
run();
