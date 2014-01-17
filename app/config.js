// enter one of your chromecast whitelisted urls with their app id:

exports.chromecastApp = {
	appid       : '0effcd6f-5696-48dc-b46a-631af14aaec3',
	receiverurl : 'http://sam.mixlab.be:3000/receiver',
	title       : 'PongCast'
};

// The receiverurl can be any url (even a local one)
// Some examples:
//   eg: http://192.168.1.124/receiver
//   eg: http://192.168.1.124:3000/receiver
//   eg: http://192.168.1.124/receiver.html
// Just make sure that '192.168.1.124' is the machine you're running this node applicaton on
// and that this url is the one you whitelisted at google
