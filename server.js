const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('views'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})
let movieUser;
let movieState = 0;
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
    socket.on('movie-time', (movieStateServer) => {
      if (movieStateServer == 0) {
      movieStateServer = 1;
    } else {
      movieStateServer = 0;
    }
      socket.to(roomId).emit('movie-time', movieStateServer)
    })
  /*  socket.on('movie-def', () => {
      socket.emit('movie-check', movieUser);
    })*/
  })
})
const PORT = process.env.PORT || 3000;
server.listen(PORT);
