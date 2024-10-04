import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css'; // Import your styles

function App() {
  const [songs, setSongs] = useState([]);
  const [leader, setLeader] = useState('Nikita'); // Default worship leader
  const [newSong, setNewSong] = useState({ title: '', key: '' }); // State for new song input
  const [editingSong, setEditingSong] = useState(null); // State for the song being edited
  const [isAscending, setIsAscending] = useState(true); // State to track sort order
  const [sortBy, setSortBy] = useState('title'); // State to track the current sorting criteria (title or key)
  const [showAddSong, setShowAddSong] = useState(false); // State to toggle the visibility of the add song fields
  const [searchQuery, setSearchQuery] = useState(''); // State for the search input

  useEffect(() => {
    fetchSongs(leader);
  }, [leader]);

  const fetchSongs = (selectedLeader) => {
  axios.get(`http://localhost:5000/songs/${selectedLeader}`)
    .then(response => {
      console.log("Fetched songs:", response.data); // Log the response data
      setSongs(response.data);
    })
    .catch(error => console.log(error));
};

  const handleLeaderClick = (selectedLeader) => {
    setLeader(selectedLeader);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSong(prevState => ({ ...prevState, [name]: value }));
  };

  const addSong = () => {
    if (editingSong) {
      // Update existing song
      axios.put(`http://localhost:5000/songs/${leader}/${editingSong._id}`, { ...newSong })
        .then(response => {
          const updatedSongs = songs.map(song => (song._id === editingSong._id ? response.data : song));
          setSongs(updatedSongs);
          resetForm();
        })
        .catch(error => console.log(error));
    } else {
      // Add new song
      axios.post(`http://localhost:5000/songs/${leader}`, { ...newSong })
        .then(response => {
          setSongs([...songs, response.data]);
          resetForm();
          setShowAddSong(false); // Hide the input fields after adding the song
        })
        .catch(error => console.log(error));
    }
  };

  const editSong = (song) => {
    setNewSong({ title: song.title, key: song.key }); // Populate input fields with song data
    setEditingSong(song); // Set the current song as the one being edited
    setShowAddSong(true); // Show the input fields for editing
  };

  const deleteSong = (id) => {
    axios.delete(`http://localhost:5000/songs/${leader}/${id}`)
      .then(() => {
        setSongs(songs.filter(song => song._id !== id)); // Remove deleted song from state
      })
      .catch(error => console.log('Error deleting song:', error));
  };

  const resetForm = () => {
    setNewSong({ title: '', key: '' });
    setEditingSong(null);
  };

  const toggleSortOrder = () => {
    setIsAscending(!isAscending);
  };

  const sortByTitle = () => {
    setSortBy('title');
    toggleSortOrder();
  };

  const sortByKey = () => {
    setSortBy('key');
    toggleSortOrder();
  };

  // Sorting logic based on title or key
  const sortedSongs = songs.sort((a, b) => {
    if (sortBy === 'title') {
      return isAscending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    } else {
      return isAscending ? a.key.localeCompare(b.key) : b.key.localeCompare(a.key);
    }
  });

  // Filter songs based on the search query
  const filteredSongs = sortedSongs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Logo Section */}
      <img src={`${process.env.PUBLIC_URL}/cbm_logo.png`} alt="Logo" className="logo" />
      <h1>
        Worship Song List: {leader === 'Nikita' ? ' Nikita D' : ' Grace Augustine'}
      </h1>
      <h3>Total Songs: {songs.length}</h3> {/* Display the total number of songs */}
      <div className="leader-buttons">
        <button onClick={() => handleLeaderClick('Nikita')}>Nikita</button>
        <button onClick={() => handleLeaderClick('Grace')}>Grace</button>
      </div>
      
      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search Songs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Sort Buttons and Add New Song Button */}
      <div className="sort-buttons-container">
        <button className="sort-button" onClick={sortByTitle}>
          {isAscending && sortBy === 'title' ? 'Sort Descending by Title' : 'Sort Ascending by Title'}
        </button>
        <button className="sort-button" onClick={sortByKey}>
          {isAscending && sortBy === 'key' ? 'Sort Descending by Key' : 'Sort Ascending by Key'}
        </button>
        <button className="add-song-button" onClick={() => setShowAddSong(!showAddSong)}>
          {showAddSong ? 'Cancel' : 'Add New Song'}
        </button>
      </div>

      {showAddSong && (
        <div className="input-container">
          <input
            type="text"
            name="title"
            placeholder="Song Title"
            value={newSong.title}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="key"
            placeholder="Song Key"
            value={newSong.key}
            onChange={handleInputChange}
          />
          <button className="add-song-button" onClick={addSong}>
            {editingSong ? 'Update Song' : 'Add Song'}
          </button>
        </div>
      )}

      <ul>
        {filteredSongs.map(song => (
          <li key={song._id}>
            {song.title} - {song.key}
            <div className="button-group">
              <button onClick={() => editSong(song)}>Edit</button>
              <button className="delete" onClick={() => deleteSong(song._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
