( function ( $ ) {

	$.fn.selectString = function ( string ) {

		var el    = $( this )[ 0 ],
		    start = el.value.indexOf( string ),
		    end   = start + string.length;

		if ( ! el || start < 0 ) {

			return;

		} else if ( el.setSelectionRange ) {

			// Webkit
			el.focus();
			el.setSelectionRange( start, end );

		} else if ( el.createTextRange ) {

			var range = el.createTextRange();

			// IE
			range.collapse( true );
			range.moveEnd( 'character', end );
			range.moveStart( 'character', start );
			range.select();

		} else if ( el.selectionStart ) {

			el.selectionStart = start;
			el.selectionEnd   = end;

		}

	};

	function start_sortable() {

		var $contact_form = $( '.wpcw-widget .form' ).not( '.wpcw-widget-hours .form' );

		$contact_form.sortable( {
			items : '> *:not(.not-sortable)',
			handle: '.wpcw-widget-sortable-handle',
			containment: 'parent',
			placeholder: 'sortable-placeholder',
			axis: 'y',
			tolerance: 'pointer',
			forcePlaceholderSize: true,
			cursorAt: { top: 40 },
			stop: function ( e, ui ) {
				// Trigger change for customizer
				$contact_form.find( '.customizer_update' ).val( ui.item.index() ).trigger( 'change' );
			}
		} );

	}

	var socialField = {

		     $btn: null,
		  $widget: null,
		$template: null,

		init: function ( e ) {

			e.preventDefault();

			var self = socialField;

			self.$btn    = $( this );
			self.$widget = self.$btn.parents( '.wpcw-widget' );

			// Make sure we don't trigger the animation again on double-click
			if ( self.$widget.find( '.' + self.$btn.data('key') ).is( ':animated' ) ) {

				return false;

			}

			if ( self.$btn.hasClass( 'inactive' ) ) {

				self.$template = self.$widget.find( '.default-fields' );
				self.$template = $( $.trim( self.$template.clone().html() ) );

				self.add();

				return;

			}

			self.remove();

		},

		add: function () {

			this.$btn.removeClass( 'inactive' );

			var data = this.$btn.data();

			this.$template
				.addClass( data.key )
				.find( 'label' )
				.prop( 'for', data.id );

			this.$template
				.find( 'input' )
				.prop( 'id', data.id )
				.prop( 'name', data.name )
				.prop( 'value', data.value );

			this.$template
				.find( 'label span.fa' )
				.prop( 'class', this.$btn.find( 'i' ).attr( 'class' ) );

			this.$template
				.find( 'label span.text' )
				.text( data.label );

			this.$template
				.hide()
				.prependTo( this.$widget.find( '.form' ) )
				.stop( true, true )
				.animate( {
					height: 'toggle',
					opacity: 'toggle'
				}, 250 );

			this.$template.find( 'input' ).selectString( data.select );

			this.update_customizer();

		},

		remove: function () {

			this.$btn.addClass( 'inactive' );

			this.$widget
				.find( '.form .' + this.$btn.data( 'key' ) )
				.stop( true, true )
				.animate( {
					height: 'toggle',
					opacity: 'toggle'
				}, 250, function () {
					$( this ).remove();
				} );

			this.update_customizer();

		},

		update_customizer: function () {

			var count = this.$widget.find( 'div > div' ).length;

			this.$widget.find( '.customizer_update' ).val( count ).trigger( 'change' );

		}

	};

	$( document ).ready( function ( $ ) {

		// Social
		$( document ).on( 'click', '.wpcw-widget-social .icons a', socialField.init );

		// Hours of Operation select field toggle
		$( 'body' ).on( 'change', '.js_wphoow_closed_checkbox', function( e ) {

			var select_fields = $( e.currentTarget ).parents( '.day-container' ).find( 'select' );

			if ( $( this ).is( ':checked' ) ) {

				select_fields.attr( 'disabled', 'disabled' );

				return;

			}

			select_fields.removeAttr( 'disabled' );

		} );

		$( 'body' ).on( 'click', '.js_wpcw_apply_hours_to_all', function( e ) {

			if ( $( this ).next().is( ':checked' ) ) {

				$( '.wpcw-widget-hours .day-container' ).find( 'select' ).attr( 'disabled', 'disabled' );
				$( '.wpcw-widget-hours .day-checkbox-toggle' ).find( 'input[type="checkbox"]' ).prop( 'checked', true );
				e.preventDefault();

				return;

			}

			var first_container = $( this ).parents( '.day-container' ),
			    open   = first_container.find( 'select:first-child' ).val(),
			    closed = first_container.find( 'select:nth-child(2)' ).val();

			$( '.wpcw-widget-hours .day-checkbox-toggle' ).find( 'input[type="checkbox"]' ).prop( 'checked', false );
			$( '.wpcw-widget-hours .day-container' ).find( 'select' ).removeAttr( 'disabled' );
			$( '.wpcw-widget-hours .day-container' ).find( 'select:first-child' ).val( open );
			$( '.wpcw-widget-hours .day-container' ).find( 'select:nth-child(2)' ).val( closed );

			e.preventDefault();

		} );

		// Sortable
		$( document ).on( 'wpcw.change', start_sortable );
		$( document ).on( 'click.widgets-toggle', start_sortable );
		$( document ).on( 'widget-updated', start_sortable );

	} );

} )( jQuery );
