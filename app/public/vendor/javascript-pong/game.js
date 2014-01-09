Object.construct = function(base) {
	var instance = Object.create(base);
	if (instance.initialize)
		instance.initialize.apply(instance, [].slice.call(arguments, 1));
	return instance;
}

Object.extend = function(destination, source) {
	for (var property in source) {
		if (source.hasOwnProperty(property))
			destination[property] = source[property];
	}
	return destination;
};

if (!window.requestAnimationFrame) {// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
																 window.mozRequestAnimationFrame    ||
																 window.oRequestAnimationFrame      ||
																 window.msRequestAnimationFrame     ||
																 function(callback, element) {
																	 window.setTimeout(callback, 1000 / 60);
																 }
}


//=============================================================================
// GAME
//=============================================================================

Game = {
	start: function(id, game, cfg) {
		return Object.construct(Game.Runner, id, game, cfg).game; // return the game instance, not the runner (caller can always get at the runner via game.runner)
	},

	addEvent:    function(obj, type, fn) { obj.addEventListener(type, fn, false);    },
	removeEvent: function(obj, type, fn) { obj.removeEventListener(type, fn, false); },

	ready: function(fn) {
		if(document.readyState === "complete" || document.readyState === "interactive")
			fn();
		else
			Game.addEvent(document, 'DOMContentLoaded', fn);
	},

	createCanvas: function() {
		return document.createElement('canvas');
	},


	random: function(min, max) {
		return (min + (Math.random() * (max - min)));
	},

	timestamp: function() {
		return new Date().getTime();
	},

	KEY: {
		BACKSPACE: 8,
		TAB:       9,
		RETURN:   13,
		ESC:      27,
		SPACE:    32,
		LEFT:     37,
		UP:       38,
		RIGHT:    39,
		DOWN:     40,
		DELETE:   46,
		HOME:     36,
		END:      35,
		PAGEUP:   33,
		PAGEDOWN: 34,
		INSERT:   45,
		ZERO:     48,
		ONE:      49,
		TWO:      50,
		A:        65,
		L:        76,
		P:        80,
		Q:        81,
		TILDA:    192
	},

	//-----------------------------------------------------------------------------

	Runner: {

		initialize: function(id, game, cfg) {
			this.cfg          = Object.extend(game.Defaults || {}, cfg || {}); // use game defaults (if any) and extend with custom cfg (if any)
			this.fps          = this.cfg.fps || 60;
			this.interval     = 1000.0 / this.fps;
			this.canvas       = document.getElementById(id);
			this.width        = this.cfg.width  || this.canvas.offsetWidth;
			this.height       = this.cfg.height || this.canvas.offsetHeight;
			this.front        = this.canvas;
			this.front.width  = this.width;
			this.front.height = this.height;
			this.back         = Game.createCanvas();
			this.back.width   = this.width;
			this.back.height  = this.height;
			this.front2d      = this.front.getContext('2d');
			this.back2d       = this.back.getContext('2d');
			this.addEvents();

			this.game = Object.construct(game, this, this.cfg); // finally construct the game object itself
		},

		start: function() { // game instance should call runner.start() when its finished initializing and is ready to start the game loop
			this.lastFrame = Game.timestamp();
			//this.timer     = setInterval(this.loop.bind(this), this.interval);
			this.timer = requestAnimationFrame( this.loop.bind(this) );
		},

		stop: function() {
			clearInterval(this.timer);
		},

		loop: function() {
			var start  = Game.timestamp(); this.update((start - this.lastFrame)/1000.0); // send dt as seconds
			var middle = Game.timestamp(); this.draw();
			var end    = Game.timestamp();
			this.lastFrame = start;

			requestAnimationFrame( this.loop.bind(this) )
		},

		update: function(dt) {
			this.game.update(dt);
		},

		draw: function() {
			this.back2d.clearRect(0, 0, this.width, this.height);
			this.game.draw(this.back2d);
			this.front2d.clearRect(0, 0, this.width, this.height);
			this.front2d.drawImage(this.back, 0, 0);
		},

		addEvents: function() {
			Game.addEvent(document, 'keydown', this.onkeydown.bind(this));
			Game.addEvent(document, 'keyup',   this.onkeyup.bind(this));
		},

		onkeydown: function(ev) { if (this.game.onkeydown) this.game.onkeydown(ev.keyCode); },
		onkeyup:   function(ev) { if (this.game.onkeyup)   this.game.onkeyup(ev.keyCode);   },

		alert: function(msg) {
			this.stop(); // alert blocks thread, so need to stop game loop in order to avoid sending huge dt values to next update
			result = window.alert(msg);
			this.start();
			return result;
		},

		confirm: function(msg) {
			this.stop(); // alert blocks thread, so need to stop game loop in order to avoid sending huge dt values to next update
			result = window.confirm(msg);
			this.start();
			return result;
		}

		//-------------------------------------------------------------------------

	} // Game.Runner
} // Game
