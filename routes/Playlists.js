const DbSvc = require('../services/Db.js');
const PlaylistSvc = require('../services/Playlists.js');

// Add a new row to the playlists table
exports.addPlaylist = (async function (req, res) {
  const db = await DbSvc.connectToDB();    
  const newPlaylistID = await PlaylistSvc.addPlaylist(db, req.body.name);
  db.end();

  if (!newPlaylistID) {
      res.status(404).send({'message': "Failed to create playlist" });
      return null;
  }

  res.status(200).send({id: newPlaylistID});
  return true;
})

// Add a new row to the playlists table
exports.getPlaylist = (async function (req, res) {
  const db = await DbSvc.connectToDB();    
  const playlist = await PlaylistSvc.getPlaylistByID(db, req.params.playlistID);
  db.end();

  if (!playlist) {
      res.status(404).send({'message': "Failed to get playlist" });
      return null;
  }

  res.status(200).send(playlist);
  return true;
})

// Get JSON info for all playlists
exports.getPlaylists = (async function (req, res) {
  const db = await DbSvc.connectToDB();
  const playlists = await PlaylistSvc.getAllPlaylists(db);
  db.end();
  if(playlists) {
      res.status(200).send(playlists);
      return true;
  } else {
      res.status(404).send({ message: "Couldn't get songs"});
      return null;
  }
})
