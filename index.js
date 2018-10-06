let app = require('express')(),
    http = require("http").Server(app),
    io = require('socket.io');

app.get('/', (req, res) => {
    res.send("Hello") // fix later
});

io.on('connection', socket => {
    socket.on('vote', message => {
        io.emit('vote', message)
    })
});

http.listen(3000, () => {
    console.log("App is running!");
});