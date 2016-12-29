( function ( $ ) {

	var hoursWidget = {

		init: function( e ) {

			var date        = new Date(),
					cur_time    = hoursWidget.getCurrentTime( date ),
					time_blocks = wpcw_hours.schedule[ date.getDay() ].open,
					$open_sign  = $( '.wpcw-open-sign' ),
					open        = false;

			if ( time_blocks ) {

				$.each( time_blocks, function( open_time, close_time ) {

					open_time   = ( '00:00' !== open_time ) ? open_time : '24:00';
					close_time  = ( '00:00' !== close_time ) ? close_time : '24:00';

					if ( cur_time < close_time && cur_time >= open_time ) {

						open = true;

					}

				} );

			}

			if ( open ) {

				$open_sign.addClass( 'open' ).text( wpcw_hours.open_string );

				return;

			}

			$open_sign.addClass( 'closed' ).text( wpcw_hours.closed_string );

		},

		getCurrentTime: function( date ) {

			var h = hoursWidget.addZeros( date.getHours() ),
					m = hoursWidget.addZeros( date.getMinutes() );

			return h + ":" + m;

		},

		addZeros: function( time ) {

			return ( time < 10 ) ? "0" + time : time;

		}

	};

	hoursWidget.init();

} )( jQuery );
