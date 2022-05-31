# audiofiler backend

## Public host
```
// No endpoint defined for root URL currently
http://api.ragtagrecords.com
```

## Production Endpoints
Load these URL's in your browser to check if production API is working
```
http://api.ragtagrecords.com/public/songs/
http://api.ragtagrecords.com/public/songs/sample1.mp3
http://api.ragtagrecords.com/public/playlists
```

## Testing Locally

All development and testing should be done on your machine. Type these commands into your terminal to download the latest code and run the app locally.

### Run the server locally
```
// download the code
git clone git@github.com:ragtagrecords/audiofiler-fs.git 

// enter the new folder
cd audiofiler-fs 

// install dependencies
npm install 

// run the app
node app.js
```

### Test an endpoint
Check URL in your browser
```
http://localhost:3000/public/songs
```


## Deploy changes to production
On our server, we use `nginx` to route requests. When you go to audiofiler.ragtagrecords.com, we redirect the request to the local IP address on port 3000. To update production we simply need to update the server's code and restart the server.
```
// Connect to server that hosts our backend
ssh username@75.7.146.255

// Enter your password

// Navigate into the directory
cd Apps/audiofiler-fs

// Fetch the new code from Github
git fetch origin main

// Update to new code
git reset origin/main--hard

// Stop the old server session
forever stop app.js

// Start the new one
forever start app.js
```


