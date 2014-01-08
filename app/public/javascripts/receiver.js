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
		// rotateElement( $('video')[0], rotation );
		movePongbar( rotation );
	};

	var rotateElement = function (el, rotation) {
		el.style.webkitTransform = "rotate(" + rotation.lr + "deg) rotate3d(1,0,0, " + (rotation.fb * -1) + "deg)";
	};

	var movePongbar = function (rotation) {
		$pongbar = $("#pongbar");

		var degrees = rotation.lr;

		// rotation.lr ranges from -180 to +180
		// let's cut it from -150 to +0, that feels good on my iPhone
		degrees = Math.max(degrees, -150);
		degrees = Math.min(degrees, +0);

		console.log(rotation.lr);

		var y = degrees + 150; // now it ranges from 0 to 150;
		y = y * ( $(window).height() - $pongbar.height() ) / 150; // now it ranges from 0 to window height

		//console.log(rotation.lr);
		$("#pongbar")[0].style.webkitTransform = 'translate3d(0px,'+y+'px,0)';
	};

	return {
		init: init
	};
};


$(function(){
	var receiver = new Receiver();
	receiver.init();
});


