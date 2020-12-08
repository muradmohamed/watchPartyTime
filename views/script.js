const socket = io("/");
const videoGrid = document.getElementById("theShow");
const peeps = document.querySelector('.peepsContainer');
const peers = {};
const elem = document.querySelector('.mainWrapper');
const popup = document.querySelector('.popup');
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
		})
	}, 1000)
}
let videoSrc;
let movieUser;
let movietime;
let clientsList;

socket.on('movie-check', (movieUserServer, movieStateServer, clientsList) => {
	movieUser = movieUserServer;
	console.log('MOVIE CHECK');
	movieTime(movieStateServer)
	movieState = movieStateServer;
})

document.querySelector('.skipButton').addEventListener('click', () => {

	const myVideo = document.createElement('video')
	myVideo.muted = true
		if (clientsList <= 1) {
			videoSrc = 0;
			socket.emit('movie');

			navigator.mediaDevices.getDisplayMedia = navigator.mediaDevices.getDisplayMedia ||
		navigator.mediaDevices.webkitGeDisplayMedia ||
		navigator.mediaDevices.mozGetDisplayMedia || navigator.mediaDevices.msGetDisplayMedia;
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
		}     else if (event.target.id == 'noChat' || event.target.classList.contains('noChat')) {
			peepStart();
		}
		}, true)
	}
})

socket.on('movie-times', movieStateServer => {
	movieTime(movieStateServer);
}
)
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
	const contextMenu = document.createElement('div');
	contextMenu.classList.add('context', 'container');
	const slider = document.createElement('input');
	slider.classList.add('volume');
	slider.type = "range";
	slider.min = "0.0";
	slider.max = "1.0";
	slider.value = "0.5";
	slider.step = "0.01";
	slider.addEventListener("input", () => {
		video.volume = slider.value;
		console.log('VOLUME: ' + slider.value);
	})

	peepContainer.appendChild(video);
	contextMenu.appendChild(slider);
	peepContainer.appendChild(contextMenu);
}
document.querySelector('.skipButton').addEventListener('click', () => {
	document.querySelector('.overlay').style.display = 'none';
})

peeps.addEventListener("click", () => {
	if (event.target.classList.contains('peepVideo')) {
		event.target.nextSibling.id = 'peep';
		console.log(event.target.nextSibling)
		event.target.nextSibling.classList.toggle('contextActive');
		console.log('clicked');
		document.querySelectorAll('.context').forEach(c => {
			if (c.id == 'peep') {
				console.log(c + 'clickedX');
				return;
			} else {
				console.log(c + 'clickedY');
				c.classList.remove('contextActive');
			}
		})
		event.target.nextSibling.id = '';
	} else if (event.target.classList.contains('peep"Video') == false){
		document.querySelectorAll('.context').forEach(c => {
				c.classList.remove('contextActive');
			})
	}
})

function movieTime(movieStateServer) {
	if (movieStateServer == 0) {
	document.querySelector('.cover').classList.remove('coverUp');
	document.querySelector('.peepsWrapper').classList.remove('peepsActive');
	document.querySelector('.mainWrapper').classList.remove('movieTime');
	document.querySelector('.peepsContainer').classList.remove('movieButtonMovie');
	document.querySelector('.tvEffect').classList.remove('tvBackgroundMovieTime');
	document.querySelector('.cover').addEventListener('transitionend', () => {
		document.querySelector('.mainWrapper').classList.remove('paddingOff');
		document.querySelector('.mainWrapper').requestFullscreen()

		//closeFullscreen();
	})
} else if (movieStateServer == 1) {
	document.querySelector('.cover').classList.add('coverUp');
	document.querySelector('.peepsWrapper').classList.add('peepsActive');
	document.querySelector('.mainWrapper').classList.add('movieTime');
	document.querySelector('.peepsContainer').classList.add('movieButtonMovie');
	document.querySelector('.tvEffect').classList.add('tvBackgroundMovieTime');
	document.querySelector('.cover').addEventListener('transitionend', () => {
		document.querySelector('.mainWrapper').classList.add('paddingOff');
		document.exitFullscreen()
		console.log('Blafdgfgf');
		//openFullscreen();
 		})
	}
}
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
  if (elem.exitFullscreen) {
    elem.exitFullscreen();
  } else if (elem.webkitExitFullscreen) { /* Safari */
    elem.webkitExitFullscreen();
  } else if (elem.msExitFullscreen) { /* IE11 */
    elem.msExitFullscreen();
  }
}
let movieState = 0;
function localMovieTime() {
	if (movieState == 0) {
		document.querySelector('.cover').classList.remove('coverUp');
	document.querySelector('.peepsWrapper').classList.remove('peepsActive');
	document.querySelector('.mainWrapper').classList.remove('movieTime');
	document.querySelector('.peepsContainer').classList.remove('movieButtonMovie');
	document.querySelector('.tvEffect').classList.remove('tvBackgroundMovieTime');
		document.querySelector('.cover').addEventListener('transitionend', () => {
			document.querySelector('.mainWrapper').classList.remove('paddingOff');

	})

} else if (movieState == 1) {
	document.querySelector('.cover').classList.add('coverUp');
	document.querySelector('.peepsWrapper').classList.add('peepsActive');
	document.querySelector('.mainWrapper').classList.add('movieTime');
	document.querySelector('.peepsContainer').classList.add('movieButtonMovie');
	document.querySelector('.tvEffect').classList.add('tvBackgroundMovieTime');
	document.querySelector('.cover').addEventListener('transitionend', () =>{
		document.querySelector('.mainWrapper').classList.add('paddingOff');

	})
}}
const nextButton1 = document.querySelector('.nextButton1');
const nextButton2 = document.querySelector('.nextButton2');
const finishButton = document.querySelector('.finishButton');
const overlay = document.querySelector('.overlayCarousel');
const oc1 = document.getElementById('oc1');
const oc2 = document.getElementById('oc2');
const oc3 = document.getElementById('oc3');

/*overlay.addEventListener("click", (event) => {
	if (event.target.classList.contains('nextButton1')) {
	console.log('clicked');
	oc1.classList.add('seethrough');
	oc1.classList.remove('seeyou');
	oc2.classList.add('seeyou');
	oc1.ontransitionend = () => {
		oc1.style.display = "none";
	}
} else if (event.target.classList.contains('nextButton2')) {
	console.log('clicked2');
	oc2.classList.add('seethrough');
	oc2.classList.remove('seeyou');
	oc3.classList.add('seeyou');
	oc2.ontransitionend = () => {
		oc2.style.display = "none";
	}
} else if (event.target.classList.contains('skipButton')) {

}
});*/

document.querySelector('.movieButton').addEventListener("click", () => {
	if (movieState == 0) {
	movieState = 1;
} else if (movieState == 1) {
	movieState = 0;
}
	socket.emit('movie-time', movieState);
	localMovieTime()
})
function error() {
	popup.innerHTML = 'Error. Please refresh and try again';
}
let color;
/*document.querySelector('.colors').addEventListener('click', event => {
	if (event.target.classList.contains('color')) {
		event.target.classList.add('colorPicked');
		color = event.target.id;
		let colors = document.getElementsByClassName('color');
		for(let x = 0; x < colors.length; x++) {
			if (colors[x].id != event.target.id) {
				colors[x].classList.remove('colorPicked');
			}
		}
	}
})*/

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
