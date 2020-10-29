const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const { PeerServer } = require('peer');
const peerServer = PeerServer({ port: 3001, path: '/' });

app.set('view engine', 'ejs')
app.use(express.static('views'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})
let movieUser;
let roomData = {};
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    console.log(userId + ' joined');
    if (!(roomData.hasOwnProperty(roomId))) {
      roomData[roomId] = roomId;
      console.log('ROOMDATA: ' + roomData[roomId]);
    }
    if ((roomData[roomId].hasOwnProperty('movieId'))) {
      socket.emit('movie-check', movieUser);
    }
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })

  socket.on('movie', () => {
      movieUser = userId;
      if (!(roomData[roomId].hasOwnProperty('movie'))) {
        roomData[roomId] = {};
        roomData[roomId].movieId = userId;
        console.log('saved movie host: ' + movieUser);
      }
    })
  /*  socket.on('movie-def', () => {
      socket.emit('movie-check', movieUser);
    })*/
  })
})
const PORT = process.env.PORT || 3000;
server.listen(PORT);
