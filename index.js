let express = require("express"),
    app = express(),
    http = require("http").Server(app),
    io = require('socket.io')(http);

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/views"));

app.get('/', (req, res) => {
    res.sendFile("index.html")
});

io.on('connection', socket => {
    socket.on('addQuestion', message => {
        io.emit('addQuestion', message)
    });
    socket.on('moreVote', vote => {
        io.emit('moreVote', vote)
    })
});

http.listen(3000, () => {
    console.log("App is running!");
});