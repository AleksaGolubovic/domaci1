const express = require("express");
const path = require('path');
const app = express();
const PORT = 3000;
const http = require("http");
const socketio = require("socket.io");

const redis = require("redis");
const client = redis.createClient();

(async () => {
    await client.connect();
})();

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);

const io = require("socket.io")(server, {
    maxHttpBufferSize: 1e8,
    pingTimeout: 60000
});

io.on("connection", async socket => {
    const username = socket.handshake.query.username;

    await client.sAdd("onlineUsers", username);

    const chatHistory = await client.lRange("messages", -20, -1);
    chatHistory.forEach(msg => {
        const match = msg.match(/^(.*?):/);
        const user = match ? match[1] : null;
        const contentString = msg.substring(msg.indexOf(':') + 1);
        const contentObject = JSON.parse(contentString);
        io.to(socket.id).emit("message", { from: user, message: contentObject});
        console.log(user,contentObject);
    });

    socket.on("message", async ({ message, from }) => {
        if (message.type === "text") {
            await client.rPush("messages", `${from}:${JSON.stringify(message)}`);
        } else if (message.type === "file") {
            await client.rPush("messages", `${from}:${JSON.stringify(message)}`);
        }
        io.emit("message", { from, message });
    });

    socket.on("disconnect", async () => {
        await client.sRem("onlineUsers", username);
    });
});

app.get("/chat", async (req, res) => {
    const username = req.query.username;
    io.emit("joined", username);
	res.render("chat", { username });

    const onlineUsers = await client.sMembers("onlineUsers");

    res.render("chat", { username, onlineUsers });
});

app.get("/", (req, res) => {
    res.render("index");
});

server.listen(PORT, () => {
    console.log(`Server at ${PORT}`);
});
