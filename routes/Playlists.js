const DbSvc = require('../services/Db.js');
const PlaylistSvc = require('../services/Playlists.js');

// Get a a single row from the playlist table by ID
exports.getPlaylist = (async function (req, res) {
  const playlistID = req.params.playlistID;

  const db = await DbSvc.connectToDB();    
  const playlist = await PlaylistSvc.getPlaylistByID(db, req.params.playlistID);
  db.end();

  if (!playlist) {
      res.status(404).send({message: "Failed to get playlist" });
      return null;
  }

  res.status(200).send(playlist);
  return true;
})

// Get all the rows from the playlists table
exports.getPlaylists = (async function (req, res) {
  const db = await DbSvc.connectToDB();
  const playlists = await PlaylistSvc.getPlaylists(db);
  db.end();
  if(playlists) {
      res.status(200).send(playlists);
      return true;
  } else {
      res.status(404).send({ message: "Couldn't get songs"});
      return null;
  }
})

// Get all the rows from the playlists table for a given song
exports.getPlaylistsBySongID = (async function (req, res) {
  const songID = req.params.songID;

  if (!songID) {
      res.status(404).send({message: `songID is required, structure request like so: /public/playlist/song/<songID>` });
      return null;
  }

  const db = await DbSvc.connectToDB();
  const playlists = await PlaylistSvc.getPlaylistsBySongID(db, songID);
  db.end();

  if(playlists) {
      res.status(200).send(playlists);
      return true;
  } else {
      res.status(404).send({ message: "Couldn't get playlists"});
      return null;
  }
})

// Add a row to the playlists table
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

// Add a row to the songPlaylists table
exports.addSongToPlaylist = (async function (req, res) {
  const playlistID = req.params.playlistID;
  const songID = req.params.songID;

  if (!playlistID || !songID) {
      res.status(404).send({ message: `Couldn't add song to playlist`});
      return null;
  }

  const db = await DbSvc.connectToDB();
  newSongPlaylistID = await PlaylistSvc.addSongToPlaylist(db, songID, playlistID);
  db.end();

  if(newSongPlaylistID) {
      res.status(200).send({ id: newSongPlaylistID });
      return true;
  } else {
      res.status(404).send({ message: `Couldn't add song(${songID}) to playlist(id=${playlistID})`});
      return null;
  }
})

// Delete a row from the songPlaylists table
exports.deleteSongFromPlaylist = (async function (req ,res) {
  const playlistID = req.params.playlistID;
  const songID = req.params.songID;

  if (!playlistID || !songID) {
      res.status(404).send({ message: `ID's required, structure request like so: /public/playlist/<playlistID>/song/<songID>`});
      return;
  }

  const db = await DbSvc.connectToDB();
  const songDeleted = await PlaylistSvc.deleteSongFromPlaylist(db, songID, playlistID);
  db.end();

  if(songDeleted) {
      res.status(200).send({ message: `Song(${songID}) was deleted from playlist(${playlistID})` });
      return;
  } else {
      res.status(404).send({ message: `Failed to delete song(${songID}) from playlist(${playlistID})`});
      return;
  }
})


exports.updatePlaylist = (async function (req, res) {
    const db = await DbSvc.connectToDB();
    const id = req.params.id;
    const newName = req.body.name;

    newPlaylistName = await PlaylistSvc.updatePlaylistName(db, id, newName);
    db.end();

    if(newPlaylistName) {
        res.status(200).send(newPlaylistName);
        return true;
    } else {
        res.status(404).send({ message: `FAIL: Couldn't change playlist name(id=${id}) to ${newName})`});
        return false;   
    }
})