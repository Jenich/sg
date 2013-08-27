var Snake = (function ($, window, document, undefined) {

	var defaults = {
			speed: 300,
			lines: 15,
			column: 20,
			isFullScreen: true
		},

		self = {
			masterListeners: function (param) {
				self.events = self.events || {
					onKeydown: function (e) {
						self.changeDirectionKey(e);
					},
					onMousedown: function (e) {
						self.mouseX = e.screenX;
						self.mouseY = e.screenY;
					},
					onMousemove: function (e) {
						var touch = e.touches[0];
						self.changeDirectionMouseDown(touch.screenX, touch.screenY);
					},
					onMouseup: function (e) {
						self.mouseX = null;
						self.mouseY = null;

					},
					onDeviceReady: function () {
						self.watchID = null;
						self.startWatch( self.options.speed / 4 );
					}
				};

				document[param]('touchmove', self.events.onMousemove, false);
				document[param]('touchend', self.events.onMouseup, false);
				document[param]('deviceready', self.events.onDeviceReady, false);
			},

			clearAll: function () {
				$('body > *').remove();
			},

			createTable: function () {
				var template = '';
				for (var i = 0; i < self.options.lines; i++) {
					template += '<tr>'
					for (var j = 0; j < self.options.columns; j++) {
						template += '<td></td>'
					}
					template += '</tr>'
				}
				$('body').find('table').append(template);
			},

			createSnake: function () {
				self.currentSpeed = self.options.speed;
				self.snake = [];

				$('body').find('td').eq(0).addClass('body');
				$('body').find('td').eq(1).addClass('body');
				$('body').find('td').eq(2).addClass('head');
				self.lineHead = 0;
				self.columnHead = 2;
				self.direction = 1;

				self.snake.push([0,2]);
				self.snake.push([0,1]);
				self.snake.push([0,0]);
			},

			addOptions: function () {
				self.isFirstAcceleration = true;
				self.snake = [];
				self.minPixels = Math.floor( $(document).width() / 10 );
			},

			changeDirectionMouseDown: function (x, y) {
				self.mouseX = self.mouseX || x;
				self.mouseY = self.mouseY || y;
				var vectorX = [x - self.mouseX, y - self.mouseY],
					modX = Math.sqrt( vectorX[0] * vectorX[0] + vectorX[1] * vectorX[1] );

				if (modX > self.minPixels) {
					self.mouseX = x;
					self.mouseY = y;
					var ch1 = 2, ch2 = 2;
					if ( self.snake.length ) {
						ch1 = self.snake[0][0] - self.snake[1][0];
						ch2 = self.snake[0][1] - self.snake[1][1];
					}
					self.changeDirectionMouse(vectorX, ch1, ch2);
				}
			},

			startWatch: function (speed) {
				var options = { frequency: speed };
				self.watchID = navigator.accelerometer.watchAcceleration(self.onSuccess, self.onError, options);
			},

			stopWatch: function () {
				if ( self.watchID ) {
					navigator.accelerometer.clearWatch( self.watchID );
					self.watchID = null;
				}
			},

			onSuccess: function (acceleration) {
				var ch1 = 2, ch2 = 2;

				if ( !self.isFirstAcceleration ) {
					if ( self.snake.length ) {
						ch1 = self.snake[0][0] - self.snake[1][0];
						ch2 = self.snake[0][1] - self.snake[1][1];
					}
					self.changeDirectionAccelerometer( acceleration, ch1, ch2 );
				}
				else {
					self.primaryAcceleration = acceleration;
					self.isFirstAcceleration = false;
				}
			},

			onError: function () {
				alert('onError!');
			},

			changeDirectionAccelerometer: function (acceleration, ch1, ch2) {
				var differOnX = self.primaryAcceleration.x - acceleration.x,
					differOnY = self.primaryAcceleration.y - acceleration.y;

				if ( differOnX > 2.5 && -1.5 < differOnY && differOnY < 1.5 && ch1 !== 0 && ch2 !== 1 ) {
					//right
					self.direction = 1;
				}
				else if ( differOnX < -2.5 && -1.5 < differOnY && differOnY < 1.5 && ch1 !== 0 && ch2 !== -1 ) {
					//left
					self.direction = 3;
				}
				else if ( differOnY > 2.5 && -1.5 < differOnX && differOnX < 1.5 && ch1 !== 1 && ch2 !== 0 ) {
					//up
					self.direction = 0;
				}
				else if ( differOnY < -2.5 && -1.5 < differOnX && differOnX < 1.5 && ch1 !== -1 && ch2 !== 0 ) {
					//down
					self.direction = 2;
				}
			},

			changeDirectionMouse: function (vx, ch1, ch2) {
				var vectorA = [1, 1],
					vectorB = [-1, 1],
					vectorX = vx;
					fi1 = 0,
					fi2 = 0,
					modX = Math.sqrt( vectorX[0] * vectorX[0] + vectorX[1] * vectorX[1] );
				if ( modX > self.minPixels ) {
					fi1 = 
						( vectorX[0] * vectorA[0] + vectorX[1] * vectorA[1] ) / 
						( modX * Math.sqrt( vectorA[0] * vectorA[0] + vectorA[1] * vectorA[1] ) );

					fi2 = 
						( vectorX[0] * vectorB[0] + vectorX[1] * vectorB[1] ) / 
						( modX * Math.sqrt( vectorB[0] * vectorB[0] + vectorB[1] * vectorB[1] ) );

					if ( fi1 < 0 && fi2 < 0 && ch1 !== 1 && ch2 !== 0 ) {
						// up
						self.direction = 0;
					}
					else if ( fi1 > 0 && fi2 < 0 && ch1 !== 0 && ch2 !== 1 ) {
						// right
						self.direction = 1;
					}
					else if ( fi1 > 0 && fi2 > 0 && ch1 !== -1 && ch2 !== 0 ) {
						// down
						self.direction = 2
					}
					else if ( fi1 < 0 && fi2 > 0 && ch1 !== 0 && ch2 !== -1 ) {
						// left
						self.direction = 3;
					}
				}
			},

			snakeMove: function () {
				var $body = $('body'),
					i = 0;
				var moveInterval =
				setInterval(function () {
					if ( !$body.find('td.food').length ) {
						self.addFood();
						//self.currentSpeed--;
					}
					if ( 0 <= self.lineHead && self.lineHead < self.options.lines && 0 <= self.columnHead && self.columnHead < self.options.columns) {
						var element = $body.find('td').eq( self.lineHead * self.options.columns + self.columnHead );
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
							$body.find('.head').removeClass('head');
							$body.find('td').eq( self.lineHead * self.options.columns + self.columnHead ).addClass('head');
						}
						else {
							self.endGame(moveInterval);
						}
					}
				}, self.currentSpeed);
			},

			endGame: function (interval) {
				clearInterval(interval);
				self.masterListeners('removeEventListener');
				self.clearAll();

				if ( confirm('You lose(\nTry again?') ) {
					self.isFirstAcceleration = true;
					self.clearField();
					self.createSnake();
					self.snakeMove();
					self.masterListeners('addEventListener');
				}
			},

			clearField: function () {
				$('body').find('td').removeClass('body food head');		
			},

			isCollision: function () {
				for (var i = 1; i < self.snake.length; i++) {
					if (self.snake[i][0] === self.lineHead && self.snake[i][1] === self.columnHead) {
						return true;
					}
				}
				return false;
			},

			drawBody: function (isGrow) {
				var length = self.snake.length,
					tds = $('body').find('td');
				tds.eq( self.lineHead * self.options.columns + self.columnHead ).addClass('body');
				tds.eq( self.snake[length - 1][0] * self.options.columns + self.snake[length - 1][1] ).removeClass('body');
				if ( !isGrow ) {
					self.snake.pop();
				}
				self.snake.unshift([self.snake[0][0], self.snake[0][1]]);
			},

			addFood: function () {
				var tds = $('td:not(td.head, td.body)'),
					number = Math.floor(Math.random() * tds.length);
				tds.eq(number).addClass('food');
			},

			createButtonStart: function () {
				var buttonStart = $('<button>Start games</button>');
				$('body').after( buttonStart );				
				buttonStart.click(function () {
					$(this).css('display', 'none');
					self.createTable();
					self.createSnake();
					self.snakeMove();
				});
			},
		};

	return {
		init: function (options) {
			options = options || {};
			if ( typeof options === 'number' ) {
				self.options = defaults;
				self.options.speed = options;
			}
			else {
				self.options = $.extend( {}, defaults, options );
			}

			self.clearAll();
			self.createButtonStart();
			if ( self.options.isFullScreen ) {
				$('body').css({
					'min-width': '100px',
					'min-height': '200px'
				});

				self.options.columns = Math.floor( $('body').width() / 16 );
				self.options.lines = Math.floor( $('body').height() / 16 );
			}
			alert( $('body').width() + 'x' + $('body').height() );
			self.addOptions();
			self.masterListeners('addEventListener');
			
		}
	};

})(jQuery, window, document, undefined);