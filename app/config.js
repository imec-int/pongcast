// enter one of your chromecast whitelisted urls with their app id:

exports.chromecastApp = {
	appid       : '58e94236-9c71-4239-bfbc-caedb87dd0b0',
	receiverurl : 'http://cast1.neat.be/receiver',
	title       : 'PongCast'
};

// The receiverurl can be any url (even a local one)
// Some examples:
//   eg: http://192.168.1.124/receiver
//   eg: http://192.168.1.124:3000/receiver
//   eg: http://192.168.1.124/receiver.html
// Just make sure that '192.168.1.124' is the machine you're running this node applicaton on
// and that this url is the one you whitelisted at google
