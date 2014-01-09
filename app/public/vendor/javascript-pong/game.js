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
	start: function(game, cfg) {
		return Object.construct(Game.Runner, game, cfg).game; // return the game instance, not the runner (caller can always get at the runner via game.runner)
	},

	ready: function(fn) {
		if(document.readyState === "complete" || document.readyState === "interactive")
			fn();
		else
			Game.addEvent(document, 'DOMContentLoaded', fn);
	},

	random: function(min, max) {
		return (min + (Math.random() * (max - min)));
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

		initialize: function(game, cfg) {
			this.cfg          = Object.extend(game.Defaults || {}, cfg || {}); // use game defaults (if any) and extend with custom cfg (if any)
			this.width        = this.cfg.width;
			this.height       = this.cfg.height;
			this.addEvents();

			this.game = Object.construct(game, this, this.cfg); // finally construct the game object itself
		},

		start: function() { // game instance should call runner.start() when its finished initializing and is ready to start the game loop
			this.lastFrame = Date.now();
			requestAnimationFrame( this.loop.bind(this) );
		},

		loop: function() {
			var start  = Date.now();
			this.update((start - this.lastFrame)/1000.0); // send dt as seconds
			this.lastFrame = start;

			requestAnimationFrame( this.loop.bind(this) )
		},

		update: function(dt) {
			this.game.update(dt);
		},

		addEvents: function() {
			document.addEventListener( 'keydown', this.onkeydown.bind(this) );
			document.addEventListener( 'keyup', this.onkeyup.bind(this) );
		},

		onkeydown: function(ev) { if (this.game.onkeydown) this.game.onkeydown(ev.keyCode); },
		onkeyup:   function(ev) { if (this.game.onkeyup)   this.game.onkeyup(ev.keyCode);   }

		//-------------------------------------------------------------------------

	} // Game.Runner
} // Game
