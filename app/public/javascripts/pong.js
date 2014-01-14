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
		ballSpeed:    2,     // should be able to cross court horizontally in 4 seconds, at starting speed ...
		ballAccel:    8,     // ... but accelerate as time passes
	},

	//-----------------------------------------------------------------------------

	init: function(runner) {
		this.runner      = runner;

		this.courtEl     = document.getElementById('court');
		this.width       = $(this.courtEl).width();
		this.height      = $(this.courtEl).height();

		this.scores      = [0, 0];

		this.court       = Object.create(Pong.Court);

		this.paddle      = [null, null];

		this.paddle[0]   = Object.create(Pong.Paddle);
		this.paddle[0].init(this, 0);

		this.paddle[1]   = Object.create(Pong.Paddle);
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

		this.ball.move();
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
			this.paddleEl = document.getElementById('paddle'+this.playerNo);



			this.pong   = pong;
			this.width  = $(this.paddleEl).width();
			this.height = $(this.paddleEl).height();
			this.minY   = 0;
			this.maxY   = pong.height - this.height;

			console.log(this.pong.width);

			this.setpos( (playerNo == 1) ? this.pong.width - this.width : 0, (this.pong.height - this.height)/2 );
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
			this.paddleEl.style.webkitTransform = 'translate3d('+(this.x)+'px,'+(this.y)+'px,0) scale3d(1,1,1)';
		}
	},

	//=============================================================================
	// BALL
	//=============================================================================

	Ball: {

		init: function(pong) {
			this.pong    = pong;
			this.ballEl  = document.getElementById('ball');

			this.size    = $(this.ballEl).width();
			this.radius  = this.size/2;

			this.minX    = 0;
			this.maxX    = this.pong.width - this.size;
			this.minY    = 0;
			this.maxY    = this.pong.height - this.size;
			this.speed   = (this.maxX - this.minX) / pong.cfg.ballSpeed;
			this.accel   = pong.cfg.ballAccel;

			this.reset(0);
		},

		reset: function(playerNo) {
			if(!playerNo) playerNo = 0;

			this.setpos( playerNo == 0 ?  this.minX+this.pong.paddle[0].width : this.maxX-this.pong.paddle[1].width , Pong.Helper.random( this.pong.paddle[playerNo].y , this.pong.paddle[playerNo].y + this.pong.paddle[playerNo].height - this.size) );

			this.setdir( playerNo == 0 ?  this.speed : -this.speed ,  -this.speed );
		},

		setpos: function(x, y) {
			this.x      = x;
			this.y      = y;
			this.left   = this.x;
			this.top    = this.y;
			this.right  = this.x + this.size;
			this.bottom = this.y + this.size;

			this.updatePosition();
		},

		setdir: function(vx, vy) {
			this.vx = vx;
			this.vy = vy;

			this.dirX = vx;
			this.dirY = vy;

			//console.log('vx: ' + this.vx);
		},

		move: function (argument) {
			console.log('ball move');

			// y = rico*x + b
			// b = y - rico*x

			var rico = this.dirY/this.dirX;
			var b    = this.y - rico*this.x;

			// upper wall: y = this.minY
			// lower wall: y = this.maxY;

			//  left bounder (paddle 0): x = this.minX + this.pong.paddle[0].width
			// right bounder (paddle 1): x = this.maxX - this.pong.paddle[1].width


			// crossing point with upper wall:
			var y_upperwall = this.minY;
			var x_upperwall = (y_upperwall-b)/rico;

			// crossing point with lower wall:
			var y_lowerwall = this.maxY;
			var x_lowerwall = (y_lowerwall-b)/rico;

			// crossing point with paddle 0:
			var x_paddle0 = this.minX + this.pong.paddle[0].width;
			var y_paddle0 = rico*x_paddle0 + b;

			// crossing point with paddle 1:
			var x_paddle1 = this.maxX - this.pong.paddle[1].width;
			var y_paddle1 = rico*x_paddle1 + b;


			// debug, lets got to upperwall crossing point:
			this.updatePosition(x_upperwall, y_upperwall);
		},

		update: function(dt, leftPaddle, rightPaddle) {
			return;

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

		updatePosition: function(x, y) {
			if(x !== undefined) this.x = x;
			if(y !== undefined) this.y = y;
			this.ballEl.style.webkitTransform = 'translate3d('+(this.x)+'px,'+(this.y)+'px,0) scale3d(1,1,1)';
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
