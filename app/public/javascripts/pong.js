if (!window.requestAnimationFrame) {// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
                                   window.mozRequestAnimationFrame    ||
                                   window.oRequestAnimationFrame      ||
                                   window.msRequestAnimationFrame     ||
                                   function(callback, element) {
                                       window.setTimeout(callback, 1000 / 60);
                                   }
}


Runner = {
	init: function() {
		this.pong = Object.create(Pong);
		this.pong.init(this);
	},

	start: function() { // game instance should call runner.start() when its finished initializing and is reavy to start the game loop
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
		this.pong.update(dt);
	}
}


//=============================================================================
// PONG
//=============================================================================

Pong = {

	cfg: {
		width:        1280,
		height:       720,
		wallWidth:    12,
		paddleWidth:  30,
		paddleHeight: 200,
		ballSpeed:    2,     // should be able to cross court horizontally in 4 seconds, at starting speed ...
		ballAccel:    8,     // ... but accelerate as time passes
		ballRadius:   25/2
	},

	//-----------------------------------------------------------------------------

	init: function(runner) {
		this.paddleEl = [null, null];
		this.paddleEl[0] = document.getElementById('paddle0');
		this.paddleEl[1] = document.getElementById('paddle1');

		this.runner      = runner;
		this.scores      = [0, 0];

		this.court       = Object.create(Pong.Court);

		this.paddle = [null, null];

		this.paddle[0]  = Object.create(Pong.Paddle);
		this.paddle[0].init(this, 0);

		this.paddle[1] = Object.create(Pong.Paddle);
		this.paddle[1].init(this, 1);

		this.ball        = Object.create(Pong.Ball);
		this.ball.init(this);

		this.reset();

		this.runner.start();
	},

	reset: function () {
		this.scores = [0, 0];
		this.playing = false;
		this.ball.reset();
		this.court.reset();
		this.ended = false;
	},

	play: function() {
		if (this.playing) return;

		if(this.ended) this.reset();
		this.playing = true;
	},

	pause: function() {
		this.playing = false;
	},

	end: function () {
		this.pause();
		this.ended = true;
	},

	goal: function(playerNo) {
		this.scores[playerNo] += 1;
		if (this.scores[playerNo] == 4) {
			this.court.declareWinner(playerNo);
			this.end();
		}
		else {
			this.ball.reset(playerNo);
			this.pause();
		}
		this.court.updatePlayerScore(playerNo, this.scores[playerNo]);
	},

	update: function(dt) {
		if (!this.playing) return;

		this.ball.update(dt, this.paddle[0], this.paddle[1]);

		if (this.ball.left > this.cfg.width)
			this.goal(0);
		else if (this.ball.right < 0)
			this.goal(1);
	},

	//=============================================================================
	// COURT
	//=============================================================================

	Court: {

		updatePlayerScore: function (playerNo, score) {
			$("#score"+playerNo).html(score);
		},

		declareWinner: function(playerNo) {
			$("#winner"+playerNo).show();
		},

		reset: function () {
			$("#score0").html('0');
			$("#score1").html('0');
			$("#winner0").hide();
			$("#winner1").hide();
		}

	},

	//=============================================================================
	// PADDLE
	//=============================================================================

	Paddle: {

		init: function(pong, playerNo) {
			this.playerNo = playerNo;

			this.pong   = pong;
			this.width  = pong.cfg.paddleWidth;
			this.height = pong.cfg.paddleHeight;
			this.minY   = pong.cfg.wallWidth;
			this.maxY   = pong.cfg.height - pong.cfg.wallWidth - this.height;
			this.setpos((playerNo == 1) ? pong.cfg.width - this.width : 0, this.minY + (this.maxY - this.minY)/2);
		},

		setpos: function(x, y) {
			this.x      = x;
			this.y      = y;
			this.left   = this.x;
			this.right  = this.left + this.width;
			this.top    = this.y;
			this.bottom = this.y + this.height;

			this.updatePosition();
		},

		updatePosition: function() {
			//console.log(this.playerNo);
			this.pong.paddleEl[this.playerNo].style.webkitTransform = 'translate3d('+(this.x)+'px,'+(this.y)+'px,0) scale3d(1,1,1)';
		}
	},

	//=============================================================================
	// BALL
	//=============================================================================

	Ball: {

		init: function(pong) {
			this.pong    = pong;
			this.radius  = pong.cfg.ballRadius;
			this.minX    = this.radius;
			this.maxX    = pong.cfg.width - this.radius;
			this.minY    = pong.cfg.wallWidth + this.radius;
			this.maxY    = pong.cfg.height - pong.cfg.wallWidth - this.radius;
			this.speed   = (this.maxX - this.minX) / pong.cfg.ballSpeed;
			this.accel   = pong.cfg.ballAccel;

			console.log('maxX: ' + this.maxX + ', minX: ' + this.minX);
			console.log('speed: ' + this.speed);

			this.reset(0);
		},

		reset: function(playerNo) {
			if(!playerNo) playerNo = 0;

			this.setpos( playerNo == 0 ?  this.minX+this.pong.paddle[0].width : this.maxX-this.pong.paddle[1].width , Pong.Helper.random( this.pong.paddle[playerNo].y + this.radius, this.pong.paddle[playerNo].y + this.pong.paddle[playerNo].height - this.radius) );

			this.setdir( playerNo == 0 ?  this.speed : -this.speed ,  this.speed );

			console.log(this.x);
			console.log(this.y);
		},

		setpos: function(x, y) {
			this.x      = x;
			this.y      = y;
			this.left   = this.x - this.radius;
			this.top    = this.y - this.radius;
			this.right  = this.x + this.radius;
			this.bottom = this.y + this.radius;

			this.updatePosition();
		},

		setdir: function(vx, vy) {
			this.vx = vx;
			this.vy = vy;

			//console.log('vx: ' + this.vx);
		},

		update: function(dt, leftPaddle, rightPaddle) {

			var pos = Pong.Helper.move(this.x, this.y, this.vx, this.vy, this.accel, dt);

			// check if the ball is smashing against the upper or lower wall:
			if ((pos.vy > 0) && (pos.y > this.maxY)) {
				pos.y = this.maxY;
				pos.vy = -pos.vy;
			}
			else if ((pos.vy < 0) && (pos.y < this.minY)) {
				pos.y = this.minY;
				pos.vy = -pos.vy;
			}


			var paddle = (pos.vx < 0) ? leftPaddle : rightPaddle;
			var pt     = Pong.Helper.ballIntercept(this, paddle, pos.nx, pos.ny);

			if (pt) {
				console.log(pt.d);

				switch(pt.d) {
					case 'left':
					case 'right':
						pos.x = pt.x;
						pos.vx = -pos.vx;
						break;
					case 'top':
					case 'bottom':
						pos.y = pt.y;
						pos.vy = -pos.vy;
						break;
				}
			}

			this.setpos(pos.x,  pos.y);
			this.setdir(pos.vx, pos.vy);
		},

		updatePosition: function() {
			document.getElementById('ball').style.webkitTransform = 'translate3d('+(this.x-this.radius)+'px,'+(this.y-2*this.radius)+'px,0) scale3d(1,1,1)';
		}

	},

	//=============================================================================
	// HELPER
	//=============================================================================

	Helper: {

		random: function(min, max) {
			return (min + (Math.random() * (max - min)));
		},

		move: function(x, y, vx, vy, accel, dt) {
			var x2  = x + (dt * vx) + (accel * dt * dt * 0.5);
			var y2  = y + (dt * vy) + (accel * dt * dt * 0.5);
			var vx2 = vx + (accel * dt) * (vx > 0 ? 1 : -1);
			var vy2 = vy + (accel * dt) * (vy > 0 ? 1 : -1);
			return { nx: (x2-x), ny: (y2-y), x: x2, y: y2, vx: vx2, vy: vy2 };
		},

		intercept: function(x1, y1, x2, y2, x3, y3, x4, y4, d) {
			var denom = ((y4-y3) * (x2-x1)) - ((x4-x3) * (y2-y1));
			if (denom != 0) {
				var ua = (((x4-x3) * (y1-y3)) - ((y4-y3) * (x1-x3))) / denom;
				if ((ua >= 0) && (ua <= 1)) {
					var ub = (((x2-x1) * (y1-y3)) - ((y2-y1) * (x1-x3))) / denom;
					if ((ub >= 0) && (ub <= 1)) {
						var x = x1 + (ua * (x2-x1));
						var y = y1 + (ua * (y2-y1));
						return { x: x, y: y, d: d};
					}
				}
			}
			return null;
		},

		ballIntercept: function(ball, rect, nx, ny) {
			var pt;
			if (nx < 0) {
				pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
																	 rect.right  + ball.radius,
																	 rect.top    - ball.radius,
																	 rect.right  + ball.radius,
																	 rect.bottom + ball.radius,
																	 "right");
			}
			else if (nx > 0) {
				pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
																	 rect.left   - ball.radius,
																	 rect.top    - ball.radius,
																	 rect.left   - ball.radius,
																	 rect.bottom + ball.radius,
																	 "left");
			}
			if (!pt) {
				if (ny < 0) {
					pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
																		 rect.left   - ball.radius,
																		 rect.bottom + ball.radius,
																		 rect.right  + ball.radius,
																		 rect.bottom + ball.radius,
																		 "bottom");
				}
				else if (ny > 0) {
					pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
																		 rect.left   - ball.radius,
																		 rect.top    - ball.radius,
																		 rect.right  + ball.radius,
																		 rect.top    - ball.radius,
																		 "top");
				}
			}
			return pt;
		}

	}

	//=============================================================================

}; // Pong
