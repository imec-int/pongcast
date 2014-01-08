#!/usr/bin/env node

var express = require('express');
var http = require('http')
var path = require('path');
var chromecast = require('chromecast')();
var utils = require('./utils');
var config = require('./config');
var socketio = require('socket.io');
var url = require('url');

// parsing some data from the receiver url:
var receiverUrl = url.parse(config.chromecastApp.receiverurl);

var app = express();

app.configure(function(){
	app.set('port', receiverUrl.port?receiverUrl.port:80); // run express webserver on the port specified by the receiver url
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('pongcast654646416843161'));
	app.use(express.session());
	app.use(app.router);
	app.use(require('stylus').middleware(__dirname + '/public'));
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

// Webserver:
if( app.get('port') < 1024 )
	console.log("> IMPORTANT: You're trying to run this webserver on port " + app.get('port') + ", if you're on Mac OS X/Linux, make sure you're using 'sudo node app' to run this app.");

var server = http.createServer(app).listen(app.get('port'), function (){
	console.log("> Webserver listening on port " + app.get('port'));

	// Find Chromecast:
	findChromecastAndRunApp(config.chromecastApp, function (err) {
		if(err) return console.log(err);
	});
});

// Socket IO
var io = socketio.listen(server);
io.set('log level', 0);

// using the path extracted from the receiver-url in the config.js file so you don't have to do this manually
app.get(receiverUrl.path, function (req, res){
	res.render('receiver', {
		title: 'Pong'
	});

	console.log("> Chromecast app connected to this webserver.");
	var serverAddress = req.protocol + "://" + req.get('host');
	console.log("> Go to '"+serverAddress+"/controller' to test it out");
});

app.get('/controller', function (req, res){
	res.render('controller', {
		title: 'Pong Controller app for chromecast'
	});
});


function findChromecastAndRunApp (app, callback) {
	console.log("> Looking for Chromecast...");

	chromecast.on('device', function (device){
		console.log("> Found Chromecast: " + device.name.replace(/&apos;/, "'") );
		console.log("> Launching app " + app.appid + ", Chromecast will try to connect to " + app.receiverurl);
		console.log("> If you get a 'brainfreeze error', you're receiver url is probably not accesable from the Chromecast.");
		device.launch(app.appid, {v:''}, callback);
	});

	chromecast.discover();
}


io.sockets.on('connection', function (socket) {
	console.log("> some socket client connected");

	// send play video:
	io.sockets.emit('chromecast.playvideo', {});

	// listening voor messages:
	socket.on('controller.deviceorientation', function (data) {
		// console.log(data);
		io.sockets.emit('chromecast.changeoriention', data);
	});
});


