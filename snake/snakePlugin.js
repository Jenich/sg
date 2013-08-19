(function ($, window, document, undefined) {
	function Snake (options, elem) {
		this.elem = elem;
		this.$elem = $(elem);
		if (typeof options === 'number') {
			this.options = $.fn.snakePlugin.defaults;
			this.options.speed = options;
		}
		else {
			this.options = $.extend({}, $.fn.snakePlugin.defaults, options);
		}
		
		this.isMouseDown = false;

		this.createTable();
		this.createSnake();
		this.snakeMove();
		this.masterListeners('on');
	};

	Snake.prototype = {
		masterListeners: function (param) {
			var self = this;
			self.events = self.events || {
				onKeydown: function (e) {
					self.changeDirectionKey(e);
				},
				onMousedown: function (e) {
					console.log('start');
					self.mouseX = e.clientX;
					self.mouseY = e.clientY;
					self.isMouseDown = true;
				},
				onMousemove: function (e) {
					self.changeDirectionMouseDown(e);
				},
				onMouseup: function (e) {
					self.isMouseDown = false;
					self.changeDirectionMouse(e);
					alert('mouse up');
				}
			};

			$(document)[param]('keydown', this.events.onKeydown);
			$(document)[param]('touchstart mousedown', this.events.onMousedown);
			$(document)[param]('touchend mouseup', this.events.onMouseup);
			$(document)[param]('mousemove', this.events.onMousemove);
		},

		changeDirectionMouseDown: function (e) {
			var self = this;
			if (self.isMouseDown) {
				var vectorX = [e.clientX - self.mouseX, e.clientY - self.mouseY],
					modX = Math.sqrt( vectorX[0] * vectorX[0] + vectorX[1] * vectorX[1] );
				
				if (modX > 100) {
					self.mouseX = e.clientX;
					self.mouseY = e.clientY;
					self.changeDirectionMouse(e, vectorX);
				}
			}
		},

		changeDirectionMouse: function (e, vx) {
			
			var self = this,
				vectorA = [1, 1],
				vectorB = [-1, 1],
				vectorX = vx || [e.clientX - self.mouseX, e.clientY - self.mouseY],
				fi1 = 0,
				fi2 = 0,
				modX = Math.sqrt( vectorX[0] * vectorX[0] + vectorX[1] * vectorX[1] );
			if ( modX > 100 ) {
				fi1 = 
					( vectorX[0] * vectorA[0] + vectorX[1] * vectorA[1] ) / 
					( modX * Math.sqrt( vectorA[0] * vectorA[0] + vectorA[1] * vectorA[1] ) );

				fi2 = 
					( vectorX[0] * vectorB[0] + vectorX[1] * vectorB[1] ) / 
					( modX * Math.sqrt( vectorB[0] * vectorB[0] + vectorB[1] * vectorB[1] ) );
				console.log(fi1, '', fi2);

				if ( fi1 < 0 && fi2 < 0 && self.direction !== 2 ) {
					self.direction = 0
				}
				else if ( fi1 > 0 && fi2 < 0 && self.direction !== 3 ) {
					self.direction = 1;
				}
				else if ( fi1 > 0 && fi2 > 0 && self.direction !== 0 ) {
					self.direction = 2
				}
				else if ( fi1 < 0 && fi2 > 0 && self.direction !== 1 ) {
					self.direction = 3;
				}
			}
		},

		changeDirectionKey: function (e) {
			var self = this;
			if ( e.keyCode === 37 && self.direction !== 1 ) {
				self.direction = 3;
			}
			else if ( e.keyCode === 38 && self.direction !== 2 ) {
				self.direction = 0;
			}
			else if ( e.keyCode === 39 && self.direction !== 3 ) {
				self.direction = 1;
			} 
			else if ( e.keyCode === 40 && self.direction !== 0 ) {
				self.direction = 2;
			}
		},

		createTable: function () {
			var self = this,
				template = '';
			for (var i = 0; i < self.options.lines; i++) {
				template += '<tr>'
				for (var j = 0; j < self.options.columns; j++) {
					template += '<td></td>'
				}
				template += '</tr>'
			}
			self.$elem.append(template);
		},

		createSnake: function () {
			var self = this;

			self.currentSpeed = self.options.speed;
			self.snake = [];

			self.$elem.find('td').eq(0).addClass('body');
			self.$elem.find('td').eq(1).addClass('body');
			self.$elem.find('td').eq(2).addClass('head');
			self.lineHead = 0;
			self.columnHead = 2;
			self.direction = 1;

			self.snake.push([0,2]);
			self.snake.push([0,1]);
			self.snake.push([0,0]);
		},

		snakeMove: function () {
			var self = this,
				i = 0;
			var moveInterval =
			setInterval(function () {
				if ( !self.$elem.find('td.food').length ) {
					self.addFood();
				}
				if ( 0 <= self.lineHead && self.lineHead < self.options.lines && 0 <= self.columnHead && self.columnHead < self.options.columns) {
					var element = self.$elem.find('td').eq( self.lineHead * self.options.columns + self.columnHead );
					if (self.direction === 0 && self.lineHead > 0 ) {
						if ( !element.hasClass('food') ) {
							self.drawBody();
						}
						else {
							self.drawBody(true);
							element.removeClass('food');
						}			
						
						self.lineHead--;
						self.snake[0][0]--;
					}
					else if (self.direction === 1 && self.columnHead < self.options.columns - 1 ) {
						if ( !element.hasClass('food') ) {						
							self.drawBody();
						}
						else {
							self.drawBody(true);
							element.removeClass('food');
						}
						self.columnHead++;
						self.snake[0][1]++;
					}
					else if (self.direction === 2 && self.lineHead < self.options.lines - 1 ) {
						if ( !element.hasClass('food') ) {					
							self.drawBody();
						}
						else {
							self.drawBody(true);
							element.removeClass('food');
						}
						self.lineHead++;
						self.snake[0][0]++;
					}
					else if (self.direction === 3 && self.columnHead > 0 ) {
						if ( !element.hasClass('food') ) {					
							self.drawBody();
						}
						else {
							self.drawBody(true);
							element.removeClass('food');
						}
						self.columnHead--;
						self.snake[0][1]--;
					}
					else {
						self.endGame(moveInterval);
						return;
					}

					if ( !self.isCollision() ) {
						self.$elem.find('.head').removeClass('head');
						self.$elem.find('td').eq( self.lineHead * self.options.columns + self.columnHead ).addClass('head');
					}
					else {
						self.endGame(moveInterval);
					}
				}
			}, self.currentSpeed);
		},

		endGame: function (interval) {
			var self = this;
			clearInterval(interval);
			self.masterListeners('off');
			if ( confirm('You lose(\nTry again?') ) {
				
				self.clearField();
				self.createSnake();
				self.snakeMove();
				self.masterListeners('on');
			}
		},

		clearField: function () {
			var self = this;
			self.$elem.find('td').removeClass('body food head');		
		},

		isCollision: function () {
			var self = this;
			for (var i = 1; i < self.snake.length; i++) {
				if (self.snake[i][0] === self.lineHead && self.snake[i][1] === self.columnHead) {
					return true;
				}
			}
			return false;
		},

		drawBody: function (isGrow) {
			var self = this,
				length = self.snake.length;
			self.$elem.find('td').eq( self.lineHead * self.options.columns + self.columnHead ).addClass('body');
			self.$elem.find('td').eq( self.snake[length - 1][0] * self.options.columns + self.snake[length - 1][1] ).removeClass('body');
			if ( !isGrow ) {
				self.snake.pop();
			}
			self.snake.unshift([self.snake[0][0], self.snake[0][1]]);
		},

		addFood: function () {
			var self = this,
				tds = $('td:not(td.head, td.body)'),
				number = Math.floor(Math.random() * tds.length);
			tds.eq(number).addClass('food');
		}
	};


	$.fn.snakePlugin = function (options) {
		return this.each(function () {
			if ( !$(this).attr('data-snake') ) {
				$(this).attr( 'data-snake', new Snake(options, this) );
			}
		});
	};

	$.fn.snakePlugin.defaults = {
		columns: 25,
		lines: 15,
		speed: 300
	};
})(jQuery, window, document, undefined);