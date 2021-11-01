const socket = io("/");
const videoGrid = document.getElementById("theShow");
const peeps = document.querySelector('.peepsContainer');
const peers = {};
const elem = document.querySelector('.mainWrapper');
const popup = document.querySelector('.popup');
const myVideo = document.createElement('video')
const myPeer = new Peer(undefined, {
	host:'peerjs-server.herokuapp.com',
	secure: "true",
	port: "443"
});


document.querySelector('.load').classList.remove('loading');
window.onload = () => {
	setTimeout(() => {
		document.querySelector('.loader').classList.add('loaded');
		document.querySelector('.loader').addEventListener("transitionend", () => {
			document.querySelector('.loaded').style.display = "none";
			document.querySelector('.overlay').style.display="flex";
		})
	}, 1000)
}

let videoSrc;
let movieUser;
let movietime;
let clientsList;	
let nickname;

socket.on('movie-check', (movieUserServer, clientsList) => {
	movieUser = movieUserServer;
	console.log('MOVIE CHECK');
	document.querySelector('.skipButton').addEventListener('click', () => {
		myVideo.muted = true
			if (clientsList <= 1) {
				videoSrc = 0;
				socket.emit('movie');

				navigator.mediaDevices.getDisplayMedia =
				navigator.mediaDevices.getDisplayMedia ||
				navigator.mediaDevices.webkitGeDisplayMedia ||
				navigator.mediaDevices.mozGetDisplayMedia ||
				navigator.mediaDevices.msGetDisplayMedia;
				navigator.mediaDevices.getDisplayMedia({
					video: true,
					audio: true
				}).then(stream => {
					addVideoStreamMovie(myVideo, stream)
					popup.classList.add('popupClicked');
					myPeer.on('call', call => {
						call.answer(stream)
						const video = document.createElement('video')
						call.on('stream', userVideoStream => {
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
			}).catch(error());
		} else {
			popup.addEventListener('click', (event) => {
			     if (event.target.id == 'mic' || event.target.classList.contains('mic')) {
			      videoSrc = 1;
					navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia ||
					navigator.mediaDevices.webkitGetUserMedia ||
					navigator.mediaDevices.mozGetUserMedia || navigator.mediaDevices.msGetUserMedia;
					navigator.mediaDevices.getUserMedia({
						video: false,
						audio: true
			      }).then(stream => {
			        addVideoStreamPeep(myVideo, stream)
							popup.classList.add('popupClicked');

			        myPeer.on('call', call => {
			          call.answer(stream)
			          const video = document.createElement('video');
			          call.on('stream', userVideoStream => {
									let compare;
									if (typeof(movieUser) != 'undefined') {
									compare = movieUser.localeCompare(call.peer);
								} else {
									compare = 1;
								}
			            if (compare == 0) {
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
				}
			}, true)
		}
	})
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id, nickname)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
	console.log('USERID: ' + userId);
	console.log('MOVIEUSER: ' + movieUser)
	if (movieUser!= null) {
		console.log(movieUser);
	let compare = movieUser.localeCompare(call.peer);
	console.log('movieUser exists')
	} else {
		let compare = 1;
		console.log('movieUser exists not')
	}
  const video = document.createElement('video');
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
    video.parentNode.remove()
  })
  peers[userId] = call
}

function addVideoStreamMovie(video, stream) {
  video.srcObject = stream;
  video.setAttribute('controls', 'true');
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  video.classList.add('movie');
  videoGrid.appendChild(video);
}

function addVideoStreamPeep(video, stream) {
  video.srcObject = stream;
  video.className = 'peepVideo';
  video.addEventListener("loadedmetadata", () => {
  	video.play();
  });
  const peepContainer = document.createElement('div');
  peepContainer.classList.add('peep');
  peeps.appendChild(peepContainer);
  peepContainer.appendChild(video);
}

document.querySelector('.skipButton').addEventListener('click', () => {
	document.querySelector('.overlay').style.display = 'none';
})

/* View in fullscreen */
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
}

/* Close fullscreen */
function closeFullscreen() {
	console.log('GHGHGHGHGH');
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  }
}

const nextButton1 = document.querySelector('.nextButton1');
const nextButton2 = document.querySelector('.nextButton2');
const finishButton = document.querySelector('.finishButton');
const overlay = document.querySelector('.overlayCarousel');
const oc1 = document.getElementById('oc1');
const oc2 = document.getElementById('oc2');
const oc3 = document.getElementById('oc3');

function error() {
	popup.innerHTML = 'Error. Please refresh and try again';
}

function peepStart() {
	videoSrc = 1;
		addVideoStreamPeep(myVideo, undefined)
		popup.classList.add('popupClicked');

		myPeer.on('call', call => {
			call.answer()
			const video = document.createElement('video');
			call.on('stream', userVideoStream => {
				let compare;
				if (typeof(movieUser) != 'undefined') {
				compare = movieUser.localeCompare(call.peer);
			} else {
				compare = 1;
			}
				if (compare == 0) {
					addVideoStreamMovie(video, userVideoStream);
				} else {
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
}


let slideIndex = 1;
let slides = document.getElementsByClassName('oc');
let inds = document.getElementsByClassName("overlayInd");
inds[0].style.background = 'rgb(0,0,0,0.5)';
document.querySelector('.prevButton').style.opacity = '0';
document.querySelector('.prevButton').style.pointerEvents = 'none';

function plusSlides(n) {
  console.log('clicked');
  showSlides(slideIndex += n)
}
function currentSlide(n) {
  showSlides(slideIndex = n)
}
function showSlides(n) {
  let i;

  if ( n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.opacity = "0";
  }
	for ( i = 0; i < inds.length; i++) {
    inds[i].style.backgroundColor = "rgba(0,0,0,0)";
  }

  slides[slideIndex-1].style.opacity = "1";
  inds[slideIndex-1].style.backgroundColor = "rgba(0,0,0,0.5)";

	if (slides[slideIndex-1].id == 'oc3') {
		document.querySelector('.nextButton1').style.opacity = '0.5';
		document.querySelector('.nextButton1').style.pointerEvents = 'none';
		document.querySelector('.skipButtonText').textContent = 'Close'
	} else {
		document.querySelector('.nextButton1').style.opacity = '1';
		document.querySelector('.nextButton1').style.pointerEvents = 'auto';
		document.querySelector('.skipButtonText').textContent = 'Skip'
	}
	if (slides[slideIndex-1].id == 'oc1') {
		document.querySelector('.prevButton').style.opacity = '0';
		document.querySelector('.prevButton').style.pointerEvents = 'none';
	} else {
		document.querySelector('.prevButton').style.opacity = '1';
		document.querySelector('.prevButton').style.pointerEvents = 'auto';

	}
}

function copyLink() {
	let dummy = document.createElement('input');
	let link = window.location.href;

	document.body.appendChild(dummy);

	dummy.value = link;
	dummy.select()
	document.execCommand('copy');
	document.body.removeChild(dummy);
	document.querySelector('.fa-check').classList.remove('seethrough')
	setTimeout(() => {
		document.querySelector('.fa-check').classList.add('seethrough')
	}, 750)
}
