var Controller = function (options){

	var socket = null;
	var i = 0;
	var throttle = false;

	var init = function (){
		console.log("init");
		initSocket();

		if (window.DeviceOrientationEvent) {
			// Listen for the deviceorientation event and handle the raw data
			window.addEventListener('deviceorientation', onDeviceorientation, false);
		};
	};

	var initSocket = function (){
		if(socket) return; // already initialized

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
		// add ourselves to the 'controller' room
		socket.on('connect', function() {
			socket.emit('room', 'controller');
		});
	};

	var onDeviceorientation = function (eventData) {
		if(!socket.socket.connected) return console.log('socket not yet connected');

		i++;
		if(throttle && (i%4!=0)) return; //throttling

		// gamma is the left-to-right tilt in degrees, where right is positive
		var tiltLR = eventData.gamma;

		// beta is the front-to-back tilt in degrees, where front is positive
		var tiltFB = eventData.beta;

		// alpha is the compass direction the device is facing in degrees
		// var dir = eventData.alpha

		socket.emit('controller.deviceorientation', { lr: tiltLR, fb: tiltFB });
		//console.log(tiltLR+" - "+tiltFB);
		$(".messages").html( Math.round(tiltLR)+" | "+ Math.round(tiltFB));
	};


	return {
		init: init

	};
};



$(function(){
	var controller = new Controller();
	controller.init();
});


