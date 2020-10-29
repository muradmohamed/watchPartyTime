const socket = io("/");
let videoSrc;
let movieUser;
const videoGrid = document.getElementById("theShow");
const peeps = document.querySelector('.peepsContainer');
const popup = document.querySelector('.popup');
const myPeer = new Peer(undefined, {
	host:'peerjs-server.herokuapp.com',
	secure: "true",
	port: "443"
});
socket.on('movie-check', userId => {
	movieUser = userId;
  console.log(userId);
  console.log('MOVIE CHECK');
  popup.querySelector('.screen').classList.add('movieInactive');
	console.log('MOVIEUSER: ' + movieUser);
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

popup.addEventListener('click', (event) => {
  if (event.target.classList.contains('screen')) {
    popup.classList.add('popupClicked');
    videoSrc = 0;
    socket.emit('movie');
    navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    }).then(stream => {
			for (s in stream) {
			console.log('stream: ' + s)
		}
      addVideoStreamMovie(myVideo, stream)

      myPeer.on('call', call => {
        console.log('STARTING STREAM')
        call.answer(stream)
				console.log('caught stream')
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
					console.log('adding peep');
					addVideoStreamPeep(video, userVideoStream);
        })
    })
    socket.on('user-connected', userId => {
			console.log('connecting ' + userId);
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
          console.log('STARTING STREAM')
          call.answer(stream)
          console.log('CONNECTION ID: ' + call.peer)
          /*for (c in call) {
            console.log(c);
          }*/
          const video = document.createElement('video')
          call.on('stream', userVideoStream => {
						let compare;
            console.log('STARTING STREAM')
						console.log('CALL.PEER: ' + `'${call.peer}'`);
						console.log('MOVIEUSER: ' + `'${movieUser}'`);
						if (typeof(movieUser) != 'undefined') {
						compare = movieUser.localeCompare(call.peer);
						console.log('CALL = PEER?: ' + compare);
					} else {
						compare = 1;
					}
            if (compare == 0) {
							console.log('STARTING movie')
              addVideoStreamMovie(video, userVideoStream);
            } else {
							console.log('STARTING peep')
              addVideoStreamPeep(video, userVideoStream);
            }
          })
      })
      socket.on('user-connected', userId => {
				console.log('connecting ' + userId);

        setTimeout(function ()
          {
            connectToNewUser(userId, stream);
          },5000
        )
      })
    })
}}, true)


socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
	console.log('USERID: ' + userId);
	console.log('MOVIEUSER: ' + movieUser)
	if (typeof(movieUser) != 'undefined') {
	let compare = movieUser.localeCompare(call.peer);
	console.log('movieUser exists')
} else {
	let compare = 1;
	console.log('movieUser exists not')
}
  const video = document.createElement('video')
  call.on('stream', (userVideoStream, compare) => {
    console.log('CONNECTONG TP NRW USER');
		if (typeof(movieUser) != 'undefined' && compare == 0) {
			console.log('STARTING movie')
			addVideoStreamMovie(video, userVideoStream);
		} else {
			console.log('STARTING peep')
			addVideoStreamPeep(video, userVideoStream);
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
  peeps.appendChild(video);
}
