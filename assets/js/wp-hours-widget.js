( function ( $ ) {

	var hoursWidget = {

		init: function( e ) {

			var date        = new Date(),
					cur_time    = hoursWidget.getCurrentTime( date ),
					time_blocks = wpcw_hours.schedule[ date.getDay() ].open,
					$open_sign  = $( '.wpcw-open-sign' );

			if ( time_blocks.length ) {

				for ( i = 0; i < time_blocks.length; i++ ) {

					var open_time   = ( '00:00' !== time_blocks[ i ][0] ) ? time_blocks[ i ][0] : '24:00',
					    closed_time = ( '00:00' !== time_blocks[ i ][1] ) ? time_blocks[ i ][1] : '24:00';

					if ( cur_time < closed_time && cur_time >= open_time ) {

						$open_sign.addClass( 'open' ).text( wpcw_hours.open_string );

						return;

					}

				}

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
