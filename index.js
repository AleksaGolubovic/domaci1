const express = require("express");
const path = require('path');
const app = express();
const PORT = 3000;
const http = require("http");
const socketio = require("socket.io");

const redis = require("redis");
const client = redis.createClient();

(async() =>{
	await client.connect();
	})();

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);

const io = require("socket.io")(server, {
    maxHttpBufferSize: 1e8, pingTimeout: 60000
});

io.on("connection", socket => {
    socket.on("message", ({ message, from }) => {
        if (message.type === "text") {
            client.rPush("messages", `${from}:${message.content}`);
        } else if (message.type === "file") {
            client.rPush("messages", `${from}:${JSON.stringify(message)}`);
        }
        io.emit("message", { from, message });
    });
});

app.get("/chat", (req, res) => {
    const username = req.query.username;
    io.emit("joined", username);
	res.render("chat", { username });
});

app.get("/", (req, res) => {
    res.render("index");
});

server.listen(PORT, () => {
    console.log(`Server at ${PORT}`);
});
