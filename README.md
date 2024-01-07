
# Redis Chat App

socket.io chat app that uses redis to store user mesages (including media files).

supported formats:  
&emsp;images: jpg, jpeg, png, gif.  
&emsp;videos: mp4, webm.  
&emsp;audio: ogg, mp3, wav.  

## Run Locally

Clone the project

```bash
  git clone github.com/AleksaGolubovic/domaci1.git
```

Go to the project directory

```bash
  cd domaci1
```

Install dependencies

```bash
  npm install redis express socket.io ejs
```

Start the server

```bash
  redis-server
  redis-cli
  node index.js

  browser localhost:3000
```

