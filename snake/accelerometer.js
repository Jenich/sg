(function ($) {
	function Snake () {
		this.isFirstAcceleration = true;
		this.init();
	};

	Snake.prototype = {
		init: function () {
			this.events = this.events || {
				onDeviceReady: function () {
					self.watchID = null;
					alert('onDeviceReady');
					self.startWatch( self.options.speed / 4 );
				}
			};
			document.addEventListener('deviceready', this.events.onDeviceReady, false);
		},

		startWatch: function (speed) {
			var self = this,
				options = { frequency: speed};
			alert( speed );
			self.watchID = navigator.accelerometer.watchAcceleration(self.onSuccess, self.onError, options);
		},

		onSuccess: function (acceleration) {
			var self = this;

			if ( !self.isFirstAcceleration ) {
				self.changeDirectionAccelerometer( acceleration );
			}
			else {
				self.primaryAcceleration = acceleration;
				self.isFirstAcceleration = false;
				alert( 'first acceleration' );
			}
		},

		onError: function () {
			alert('onError!');
		},

		changeDirectionAccelerometer: function (acceleration) {
			var self = this,
				differOnX = self.primaryAcceleration.x - acceleration.x,
				differOnY = self.primaryAcceleration.y - acceleration.y;

			//alert( differOnX + " " + differOnY );

			if ( differOnX > 2.5 && -1.5 < differOnY && differOnY < 1.5 ) {
				//left
				alert( 'left' );
			}
			else if ( differOnX < -2.5 && -1.5 < differOnY && differOnY < 1.5 ) {
				//right
				alert( 'right' );
			}
			else if ( differOnY > 2.5 && -1.5 < differOnX && differOnX < 1.5 ) {
				//down
				alert( 'down' );
			}
			else if ( differOnY < -2.5 && -1.5 < differOnX && differOnX < 1.5 ) {
				//up
				alert( 'up' );
			}
		}
	};

})(jQuery);