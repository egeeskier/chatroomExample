var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const port =  8000;
app.use(express.static('src'));

http.listen(port, function () {
    console.log('listening on:' + port);
});

const rooms = { CS100:0,CS101:0,CS103:0,CS112:0,CS201:0,CS202:0,CS320:0,CS321:0,CS397:0,CS409:0,CS410:0,CS418:0,CS442:0,CS447:0,CS450:0,CS454:0}

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
            socket.emit('noRoom') // no room mesaji gonderiyor
        }
    })

    //When message arrives call sendMessage()
    socket.on("message", sendMessage);

    socket.on('disconnecting', () => {
        console.log('in disconnect', Object.keys(socket.rooms))
        if (Object.keys(socket.rooms).length == 2) {
            console.log('a user disconnected from the room')
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
