# audiofiler backend


## Production Endpoints
Load these URL's in your browser to check if production API is working
```
http://api.ragtagrecords.com
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
npm start
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

// Fetch the new code from Github and restart the server
npm run reboot
```

## Code Commentary

### Directory
`public.js`
- Middleware for public API endpoints using Express
- Connects a request like `( GET /songs )` to a function in `/routes` like `getSongs()`
- Not responsbile for interpreting or returning anything

`/routes`
- These files contain functions for handling requests/responses. Here we interpret the request, call a function from `/services`, and then return an response to the client.

`/services`
- These files interact with the database. They mostly contain functions which make SQL queries based on the given parameters.
- Responsible for catching exceptions and internally logging errors

### Falsey returns
In general, the `services` return null if they fail. Undefined is never explicitly assigned, so if `result==undefined` this means a variable or function is incorrectly being referenced. Of course there are other falsey options `(NaN, 0, '')` but for the sake of consistency and ease they are not used directly.
```
// Functions that return null when they fail
function foo() {
  const result = null;

  if (someConditionIsTrue) {
    results = `aValidReturnValue`;
  }
  return result;
}

OR 

function foo() {
  try {
    const result = doThing();
    return result;
  }
  catch (exception)
  {
    return null;
  }
}
```

Then in `routes` you will use something like:
```
const stuff = foo();

// if failure
if (!stuff) {
  console.log('error info');
  res.status(404).send('error info');
  return null;
}

// if success
res.status(200).send(stuff);
```


