const socket = io("/");
let videoSrc;
let movieUser;
const videoGrid = document.getElementById("theShow");
const peeps = document.querySelector('.peepsContainer');
const popup = document.querySelector('.popup');
const myPeer = new Peer(undefined, {
	host: "/",
	port: "3002"
});
socket.on('movie-check', userId => {
  console.log(userId);
  console.log('MOVIE CHECK');
  popup.querySelector('.screen').classList.add('movieInactive');
  movieUser = userId;
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

popup.addEventListener('click', (event) => {
  if (event.target.classList.contains('screen')) {
    popup.classList.add('popupClicked');
    videoSrc = 0;
    socket.emit('movie', videoSrc);
    navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    }).then(stream => {
      addVideoStreamMovie(myVideo, stream)

      myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addVideoStreamPeep(video, userVideoStream);
      })
    })
      socket.on('user-connected', userId => {
        setTimeout(function ()
          {
            connectToNewUser(userId, stream);
          },5000
        )
      })
        })
    }
    else if (event.target.classList.contains('mic')) {
      popup.classList.add('popupClicked');
      videoSrc = 1;
      navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true
      }).then(stream => {
        addVideoStreamPeep(myVideo, stream)

        myPeer.on('call', call => {
          call.answer(stream)
          const video = document.createElement('video')
          call.on('stream', userVideoStream => {
            if (userId == movieUser) {
              addVideoStreamMovie(video, userVideoStream);
            } else {
              addVideoStreamPeep(video, userVideoStream);
            }
          })
      })
      socket.on('user-connected', userId => {
        setTimeout(function ()
          {
            connectToNewUser(userId, stream);
          },5000
        )
      })
    })
}})


socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    if (call == movieUser) {
      addVideoStreamMovie(video, userVideoStream)
    } else {
      addVideoStreamPeep(video, userVideoStream)
    }
})
  call.on('close', () => {
    video.remove()
  })
  peers[userId] = call
}


function addVideoStreamMovie(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  video.classList.add('movie');
  videoGrid.appendChild(video);
}

function addVideoStreamPeep(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  video.classList.add('peep');
  peeps.append(video);
}
