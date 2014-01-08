var Receiver = function (options){
	var $messages = $('.messages');
	var $body = $('body');
	var $player1bar = $("#player1bar");
	var $player2bar = $("#player2bar");

	var socket;

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
		// add ourselves to the 'chromecast' room
		socket.on('connect', function() {
			socket.emit('room', 'chromecast');
		});

		socket.on('playvideo', onPlayvideo);

		socket.on('player1.enters', onPlayer1Enters);
		socket.on('player2.enters', onPlayer2Enters);
		socket.on('player1.moves', onPlayer1Moves);
		socket.on('player2.moves', onPlayer2Moves);
		socket.on('player1.leaves', onPlayer1Leaves);
		socket.on('player2.leaves', onPlayer2Leaves);
	};

	var onPlayvideo = function (data) {
		$('video')[0].play();
	};

	var onPlayer1Enters = function (playerid) {
		$player1bar.show(); // just show it, dont keep track of number of players, that happens on the server
	};

	var onPlayer2Enters = function (playerid) {
		$player2bar.show(); // just show it, dont keep track of number of players, that happens on the server
	};

	var onPlayer1Moves = function (y) {
		$player1bar[0].style.webkitTransform = 'translate3d(0px,'+y+'px,0)';
	};

	var onPlayer2Moves = function (y) {
		$player2bar[0].style.webkitTransform = 'translate3d(0px,'+y+'px,0)';
	};

	var onPlayer1Leaves = function (playerid) {
		$player1bar.hide();
	};

	var onPlayer2Leaves = function (playerid) {
		$player2bar.hide();
	};

	return {
		init: init
	};
};


$(function(){
	var receiver = new Receiver();
	receiver.init();
});


