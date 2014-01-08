var Receiver = function (options){
	var $messages = $('.messages');
	var $body = $('body');

	var socket = null;

	var init = function () {
		initSocket();
	};

	var initSocket = function (){
		if(socket) return; // already initialized

		// socket.io initialiseren
		socket = io.connect(window.location.hostname);
		// some debugging statements concerning socket.io
		socket.on('reconnecting', function(seconds){
			console.log('reconnecting in ' + seconds + ' seconds');
		});
		socket.on('reconnect', function(){
			console.log('reconnected');
		});
		socket.on('reconnect_failed', function(){
			console.log('failed to reconnect');
		});

		socket.on('chromecast.playvideo', onPlayvideo);
		socket.on('chromecast.changeoriention', onChangeorientation);
	};

	var onPlayvideo = function (data) {
		$('video')[0].play();
	};

	var onChangeorientation = function(rotation) {
		rotateElement( $('video')[0], rotation );
		rotateElement( $('.testimage')[0], rotation );
	};

	var rotateElement = function (el, rotation) {
		el.style.webkitTransform = "rotate(" + rotation.lr + "deg) rotate3d(1,0,0, " + (rotation.fb * -1) + "deg)";
	}

	return {
		init: init
	};
};


$(function(){
	var receiver = new Receiver();
	receiver.init();
});


