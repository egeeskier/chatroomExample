var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const port =  8000;
app.use(express.static('src'));

http.listen(port, function () {
    console.log('listening on:' + port);
});

const rooms = { movies: 0, games: 0, books: 0, music: 0 }

io.on('connection', function (socket) {
    socket.on('joinRoom', (roomName) => {
        console.log('Room request:', roomName)
        let roomCount = rooms[roomName]
        if (roomCount >= 0) {
            console.log('joining room:', roomName)
            socket.join(roomName)//burdan room name tarafina baglaniyor
            roomCount++
            rooms[roomName] = roomCount
            updateRoomCount(roomName, roomCount)
        }
        else {
            socket.emit('noRoom') // nno room mesaji gonderiyor
        }
    })

    //When message arrives call sendMessage()
    socket.on("message", sendMessage);

    socket.on('disconnecting', () => {
        console.log('in disconnect', Object.keys(socket.rooms))
        if (Object.keys(socket.rooms).length == 2) {
            console.log('socket in a room')
            let roomName = Object.values(socket.rooms)[1]
            console.log(roomName)
            let roomCount = rooms[roomName]
            roomCount--
            rooms[roomName] = roomCount
            socket.leave(roomName)
            updateRoomCount(roomName, roomCount)
        }
    })
});

function updateRoomCount(roomName, roomCount) {
    io.to(roomName).emit('updateRoomCount', roomCount)
}

function sendMessage(msg, name, roomName) {
    //Broadcast to everyone in the room except the sender
    this.broadcast.to(roomName).emit("recieve_message", msg, name);
}
