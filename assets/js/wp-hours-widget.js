( function ( $ ) {

	var hoursWidget = {

		init: function( e ) {

			var date        = new Date(),
					cur_time    = hoursWidget.getCurrentTime( date ),
					time_blocks = wpcw_hours.schedule[ date.getDay() ].open,
					$open_sign  = $( '.wpcw-open-sign' );


			if ( ! time_blocks ) {

				$open_sign.addClass( 'closed' ).html( 'Closed' );

				return;

			}

			for ( i = 0; i < time_blocks.length; i++ ) {

				if ( cur_time < time_blocks[ i ][1] && cur_time >= time_blocks[ i ][0] ) {

					$open_sign.addClass( 'open' ).html( 'Open' );

					return;

				}

			}

			$open_sign.addClass( 'closed' ).html( 'Closed' );

		},

		getCurrentTime: function( date ) {

			var h = hoursWidget.addZeros( date.getHours() ),
					m = hoursWidget.addZeros( date.getMinutes() );

			return h + ":" + m;

		},

		addZeros: function( time ) {

			if ( time < 10 ) {

				time = "0" + time;

			}

			return time;

		}

	};

	hoursWidget.init();

} )( jQuery );
