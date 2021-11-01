const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('views'))

app.get('/', (req, res) => {
  res.render('home.ejs');
})
app.get('/room', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})
app.get('/:room', (req, res) => {
  res.render('room.ejs', { roomId: req.params.room })
})

let movieUserServer;

io.on('connection', socket => {
  socket.on('join-room', async(roomId, userId) => {
    //Join room
    socket.join(roomId)
    //Get clients list
    const clients = await getRoomClients(roomId);
    let clientsList = clients.length;

    socket.emit('movie-check', movieUserServer, clientsList);

    console.log('CLIENTS: ' + clients);
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })

    socket.on('movie', () => {
      movieUserServer = userId;
    })
  })
})

function addMessage(msg, nickname) {
  let messages = '';
}

function getRoomClients(roomId) {
  return new Promise((resolve, reject) => {
    io.of('/').in(roomId).clients((error, clients) => {
      resolve(clients);
    });
  });
}
const PORT = process.env.PORT || 3000;
server.listen(PORT);
