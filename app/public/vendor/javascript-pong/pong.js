//=============================================================================
// PONG
//=============================================================================

Pong = {

	Defaults: {
		width:        1280,   // logical canvas width (browser will scale to physical canvas size - which is controlled by @media css queries)
		height:       720,   // logical canvas height (ditto)
		wallWidth:    12,
		paddleWidth:  30,
		paddleHeight: 200,
		paddleSpeed:  2,     // should be able to cross court vertically   in 2 seconds
		ballSpeed:    2,     // should be able to cross court horizontally in 4 seconds, at starting speed ...
		ballAccel:    8,     // ... but accelerate as time passes
		ballRadius:   25/2
	},

	//-----------------------------------------------------------------------------

	initialize: function(runner, cfg) {
		this.cfg         = cfg;
		this.runner      = runner;
		this.width       = runner.width;
		this.height      = runner.height;
		this.playing     = false;
		this.scores      = [0, 0];
		this.menu        = Object.construct(Pong.Menu,   this);
		this.court       = Object.construct(Pong.Court,  this);
		this.leftPaddle  = Object.construct(Pong.Paddle, this);
		this.rightPaddle = Object.construct(Pong.Paddle, this, true);
		this.ball        = Object.construct(Pong.Ball,   this);
		this.runner.start();
	},

	start: function() {
		if (this.playing) return;

		this.scores = [0, 0];
		this.playing = true;
		this.ball.reset();
	},

	stop: function(ask) {
		if (this.playing) {
			this.playing = false;
		}
	},

	goal: function(playerNo) {
		this.scores[playerNo] += 1;
		if (this.scores[playerNo] == 4) {
			this.menu.declareWinner(playerNo);
			this.stop();
		}
		else {
			this.ball.reset(playerNo);
		}
	},

	update: function(dt) {
		this.leftPaddle.update(dt, this.ball);
		this.rightPaddle.update(dt, this.ball);
		if (this.playing) {
			var dx = this.ball.dx;
			var dy = this.ball.dy;
			this.ball.update(dt, this.leftPaddle, this.rightPaddle);
			if (this.ball.left > this.width)
				this.goal(0);
			else if (this.ball.right < 0)
				this.goal(1);
		}
	},

	draw: function(ctx) {
		this.court.draw(ctx, this.scores[0], this.scores[1]);
		this.leftPaddle.draw(ctx);
		this.rightPaddle.draw(ctx);
		if (this.playing)
			this.ball.draw(ctx);
	},

	onkeydown: function(keyCode) {
		switch(keyCode) {
			case Game.KEY.ZERO: this.startDemo();            break;
			case Game.KEY.ONE:  this.startSinglePlayer();    break;
			case Game.KEY.TWO:  this.startDoublePlayer();    break;
			case Game.KEY.ESC:  this.stop(true);             break;
			case Game.KEY.Q:    this.leftPaddle.moveUp();    break;
			case Game.KEY.A:    this.leftPaddle.moveDown();  break;
			case Game.KEY.P:    this.rightPaddle.moveUp();   break;
			case Game.KEY.L:    this.rightPaddle.moveDown(); break;
		}
	},

	onkeyup: function(keyCode) {
		switch(keyCode) {
			case Game.KEY.Q: this.leftPaddle.stopMovingUp();    break;
			case Game.KEY.A: this.leftPaddle.stopMovingDown();  break;
			case Game.KEY.P: this.rightPaddle.stopMovingUp();   break;
			case Game.KEY.L: this.rightPaddle.stopMovingDown(); break;
		}
	},

	//=============================================================================
	// MENU
	//=============================================================================

	Menu: {
		declareWinner: function(playerNo) {
			console.log("winner: " + playerNo);
		}
	},

	//=============================================================================
	// COURT
	//=============================================================================

	Court: {

		initialize: function(pong) {
			var w  = pong.width;
			var h  = pong.height;
			var ww = pong.cfg.wallWidth;

			this.ww    = ww;
			this.walls = [];
			this.walls.push({x: 0, y: 0,      width: w, height: ww});
			this.walls.push({x: 0, y: h - ww, width: w, height: ww});
			var nMax = (h / (ww*2));
			for(var n = 0 ; n < nMax ; n++) { // draw dashed halfway line
				this.walls.push({x: (w / 2) - (ww / 2),
												 y: (ww / 2) + (ww * 2 * n),
												 width: ww, height: ww});
			}

			var sw = 3*ww;
			var sh = 4*ww;
			this.score1 = {x: 0.5 + (w/2) - 1.5*ww - sw, y: 2*ww, w: sw, h: sh};
			this.score2 = {x: 0.5 + (w/2) + 1.5*ww,      y: 2*ww, w: sw, h: sh};
		},

		draw: function(ctx, scorePlayer1, scorePlayer2) {
			// console.log(scorePlayer1 + " - " + scorePlayer2);
		}

	},

	//=============================================================================
	// PADDLE
	//=============================================================================

	Paddle: {

		initialize: function(pong, rhs) {
			this.paddleid = (rhs)?2:1;

			this.pong   = pong;
			this.width  = pong.cfg.paddleWidth;
			this.height = pong.cfg.paddleHeight;
			this.minY   = pong.cfg.wallWidth;
			this.maxY   = pong.height - pong.cfg.wallWidth - this.height;
			this.speed  = (this.maxY - this.minY) / pong.cfg.paddleSpeed;
			this.setpos(rhs ? pong.width - this.width : 0, this.minY + (this.maxY - this.minY)/2);
			this.setdir(0);
		},

		setpos: function(x, y) {
			this.x      = x;
			this.y      = y;
			this.left   = this.x;
			this.right  = this.left + this.width;
			this.top    = this.y;
			this.bottom = this.y + this.height;
		},

		setdir: function(dy) {
			this.up   = (dy < 0 ? -dy : 0);
			this.down = (dy > 0 ?  dy : 0);
		},

		update: function(dt, ball) {
			var amount = this.down - this.up;
			if (amount != 0) {
				var y = this.y + (amount * dt * this.speed);
				if (y < this.minY)
					y = this.minY;
				else if (y > this.maxY)
					y = this.maxY;
				this.setpos(this.x, y);
			}
		},

		draw: function(ctx) {
			document.getElementById('paddle'+this.paddleid).style.webkitTransform = 'translate3d('+(this.x)+'px,'+(this.y)+'px,0) scale3d(1,1,1)';
		},

		moveUp:         function() { this.up   = 1; },
		moveDown:       function() { this.down = 1; },
		stopMovingUp:   function() { this.up   = 0; },
		stopMovingDown: function() { this.down = 0; }

	},

	//=============================================================================
	// BALL
	//=============================================================================

	Ball: {

		initialize: function(pong) {
			this.pong    = pong;
			this.radius  = pong.cfg.ballRadius;
			this.minX    = this.radius;
			this.maxX    = pong.width - this.radius;
			this.minY    = pong.cfg.wallWidth + this.radius;
			this.maxY    = pong.height - pong.cfg.wallWidth - this.radius;
			this.speed   = (this.maxX - this.minX) / pong.cfg.ballSpeed;
			this.accel   = pong.cfg.ballAccel;
		},

		reset: function(playerNo) {
			this.setpos(playerNo == 1 ?   this.maxX : this.minX,  Game.random(this.minY, this.maxY));
			this.setdir(playerNo == 1 ? -this.speed : this.speed, this.speed);
		},

		setpos: function(x, y) {
			this.x      = x;
			this.y      = y;
			this.left   = this.x - this.radius;
			this.top    = this.y - this.radius;
			this.right  = this.x + this.radius;
			this.bottom = this.y + this.radius;
		},

		setdir: function(dx, dy) {
			this.dx = dx;
			this.dy = dy;
		},

		update: function(dt, leftPaddle, rightPaddle) {

			pos = Pong.Helper.accelerate(this.x, this.y, this.dx, this.dy, this.accel, dt);

			if ((pos.dy > 0) && (pos.y > this.maxY)) {
				pos.y = this.maxY;
				pos.dy = -pos.dy;
			}
			else if ((pos.dy < 0) && (pos.y < this.minY)) {
				pos.y = this.minY;
				pos.dy = -pos.dy;
			}

			var paddle = (pos.dx < 0) ? leftPaddle : rightPaddle;
			var pt     = Pong.Helper.ballIntercept(this, paddle, pos.nx, pos.ny);

			if (pt) {
				switch(pt.d) {
					case 'left':
					case 'right':
						pos.x = pt.x;
						pos.dx = -pos.dx;
						break;
					case 'top':
					case 'bottom':
						pos.y = pt.y;
						pos.dy = -pos.dy;
						break;
				}

				// add/remove spin based on paddle direction
				if (paddle.up)
					pos.dy = pos.dy * (pos.dy < 0 ? 0.5 : 1.5);
				else if (paddle.down)
					pos.dy = pos.dy * (pos.dy > 0 ? 0.5 : 1.5);
			}

			this.setpos(pos.x,  pos.y);
			this.setdir(pos.dx, pos.dy);
		},

		draw: function(ctx) {
			document.getElementById('ball').style.webkitTransform = 'translate3d('+(this.x-this.radius)+'px,'+(this.y-2*this.radius)+'px,0) scale3d(1,1,1)';
		}

	},

	//=============================================================================
	// HELPER
	//=============================================================================

	Helper: {

		accelerate: function(x, y, dx, dy, accel, dt) {
			var x2  = x + (dt * dx) + (accel * dt * dt * 0.5);
			var y2  = y + (dt * dy) + (accel * dt * dt * 0.5);
			var dx2 = dx + (accel * dt) * (dx > 0 ? 1 : -1);
			var dy2 = dy + (accel * dt) * (dy > 0 ? 1 : -1);
			return { nx: (x2-x), ny: (y2-y), x: x2, y: y2, dx: dx2, dy: dy2 };
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
