( function ( $ ) {

	var hoursWidget = {

		init: function( e ) {

			var date        = new Date(),
			    gmt_time    = wpcw_hours.gmt_time,
			    time_blocks = wpcw_hours.schedule[ date.getDay() ].open,
			    $open_sign  = $( '.wpcw-open-sign' ),
			    open        = false;

			if ( time_blocks ) {

				$.each( time_blocks, function( open_time, close_time ) {

					open_time   = ( '00:00' === open_time ) ? '24:00' : open_time;
					close_time  = ( '00:00' === close_time ) ? '24:00' : close_time;

					if ( gmt_time < hoursWidget.localizeTime( close_time ) && gmt_time >= hoursWidget.localizeTime( open_time ) ) {

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

		localizeTime: function( time ) {

			var time_parts = time.split( ':' ),
			    check_time = new Date();

			check_time.setHours( time_parts[0] );
			check_time.setMinutes( time_parts[1] );

			var gmt_string = new Date( check_time.toGMTString() );

			return hoursWidget.addZeros( gmt_string.getHours() ) + ':' + hoursWidget.addZeros( gmt_string.getMinutes() );

		},

		addZeros: function( time ) {

			return ( time < 10 ) ? "0" + time : time;

		}

	};

	hoursWidget.init();

} )( jQuery );
