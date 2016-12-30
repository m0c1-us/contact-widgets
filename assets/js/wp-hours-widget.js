/* globals wpcw_hours */
( function ( $ ) {

	var hoursWidget = {

		init: function() {

			var date = new Date(),
			    gmt  = date.getTime() + ( date.getTimezoneOffset() * 60000 ), // Offset in milliseconds
			    site = new Date( gmt + parseInt( wpcw_hours.gmt_offset, 10 ) ),
			    day  = site.getDay(),
			    now  = site.getHours() + ':' + site.getMinutes();

			$( '.widget.wpcw-widget-hours' ).each( function() {

				var schedule = window[ $( this ).prop( 'id' ).replace( '-', '_' ) ], // Get global var for this instance
				    is_open  = hoursWidget.isOpen( schedule[ day ].open, now ),
				    $sign    = $( this ).find( '.wpcw-open-sign' );

				hoursWidget.display( is_open, $sign );

			} );

		},

		isOpen: function ( times, now ) {

			var i = 0;

			do {

				is_open = ( Object.keys( times )[ i ] <= now && now <= Object.values( times )[ i ] );

				i++;

			}
			while ( i < Object.keys( times ).length && ! is_open );

			return is_open;

		},

		display: function ( is_open, $sign ) {

			var string = ( is_open ) ? wpcw_hours.i18n.open : wpcw_hours.i18n.closed;

			$sign
				.toggleClass( 'open', is_open )
				.toggleClass( 'closed', ! is_open )
				.text( string );

		}

	};

	hoursWidget.init();

} )( jQuery );
