# raspberry pi - file server

## Start the app remotely
```
$ putty
```
Connect to server using UI

Once in the terminal:       

```
$ node app.js
```
Or, to persist in background after terminal is closed
```
forever start 
```
## Local Host
```
192.168.86.163:3000
```

## Public Host
```
75.7.146.255:80
http://api.ragtagrecords.com
```

## Test Connection
```
$ telnet 75.7.146.255 80
Trying 75.7.146.255...
Connected to 75.7.146.255.
```

## Example File Locations
```
http://api.ragtagrecords.com/public/audio/sample1.mp3
http://api.ragtagrecords.com/public/images/image1.jpeg
```
