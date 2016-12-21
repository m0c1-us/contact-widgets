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

		$( 'body' ).on( 'click', '.day-container', function() {

			var container = $( this );

			container.find( 'div.hidden-container' ).slideToggle( 'fast', function() {

				if ( container.hasClass( 'closed' ) ) {

					container.removeClass( 'closed' ).addClass( 'open' );

					return;

				}

				container.removeClass( 'open' ).addClass( 'closed' );

			} );

		} );

		$( 'body' ).on( 'click', '.add-time', function( e ) {

			var parent_container = $( this ).parents( '.hidden-container' ).find( '.hours-selection' ).last(),
          clone            = parent_container.clone();

			clone.find( 'select[name*="[open]"], select[name*="[closed]"]' ).attr( 'name', function( i, name ) {

				return name.replace( /\[(\d+)\]$/, function( match, number ) {

					return '[' + ( + number + 1 ) + ']';

				} );

			});

			clone.find( '.add-time' ).replaceWith( '<a href="#" class="remove-time button-secondary"><span class="dashicons dashicons-no-alt"></span></a>' );

			clone.insertAfter( parent_container );

			e.preventDefault();

		} );

		$( 'body' ).on( 'click', '.remove-time', function( e ) {

			var button = $( this ),
			    parent = button.parent( '.hours-selection' );

			parent.fadeOut( 'fast', function() {

				parent.remove();

			} );

			e.preventDefault();

		} );

		$( 'body' ).on( 'click', '.js_wpcw_closed_checkbox, .wpcw-widget-hours select, .add-time, .remove-time, .js_wpcw_apply_hours_to_all', function( e ) {

			e.stopPropagation();

		} );

		// Hours of Operation select field toggle
		$( 'body' ).on( 'change', '.js_wpcw_closed_checkbox', function( e ) {

			var select_fields = $( e.currentTarget ).parents( '.day-container' ).find( 'select' );

			if ( $( this ).is( ':checked' ) ) {

				select_fields.attr( 'disabled', 'disabled' );

				return;

			}

			select_fields.removeAttr( 'disabled' );

		} );

		// Apply hours to all days in the week
		$( 'body' ).on( 'click', '.js_wpcw_apply_hours_to_all', function( e ) {

			if ( $( this ).parents( '.day-container' ).find( 'input.js_wpcw_closed_checkbox' ).is( ':checked' ) ) {

				$( '.wpcw-widget-hours .day-container' ).find( 'select' ).attr( 'disabled', 'disabled' );
				$( '.wpcw-widget-hours .day-checkbox-toggle' ).find( 'input.js_wpcw_closed_checkbox' ).prop( 'checked', true );
				$( '.wpcw-widget-hours .day-container' ).find( '.hours-selection:not(:first)' ).remove();

				e.preventDefault();

				return;

			}

			var first_container = $( this ).parents( '.day-container' ),
			    length = $( this ).parents( '.day-container' ).find( '.hours-selection' ).length;

			$( '.wpcw-widget-hours .day-container' ).find( 'select' ).removeAttr( 'disabled' );
			$( '.wpcw-widget-hours .day-checkbox-toggle' ).find( 'input.js_wpcw_closed_checkbox' ).prop( 'checked', false );

			$( '.day-container' ).not( first_container ).each( function() {

				$( this ).find( '.hidden-container .hours-selection:not(:first)' ).remove();

				var y = 1,
				    z = 0;

				while ( y < length ) {

					var duplicate = $( this ).find( '.hidden-container .hours-selection' ).last().clone();

					duplicate.find( 'select[name*="[open]"], select[name*="[closed]"]' ).attr( 'name', function( i, name ) {

						return name.replace( /\[(\d+)\]$/, function( match, number ) {

							return '[' + ( + number + 1 ) + ']';

						} );

					} );

					duplicate.find( '.add-time' ).replaceWith( '<a href="#" class="remove-time button-secondary"><span class="dashicons dashicons-no-alt"></span></a>' );

					duplicate.insertAfter( $( this ).find( '.hidden-container .hours-selection' ).last() );

					y++;

				}

				while ( z <= length ) {

					var open   = first_container.find( '.hours-selection:nth-child(' + z + ') select:first-child' ).val(),
					    closed = first_container.find( '.hours-selection:nth-child(' + z + ') select:nth-child(2)' ).val();

					$( this ).find( '.hours-selection:nth-child(' + z + ') select:first-child' ).val( open );
					$( this ).find( '.hours-selection:nth-child(' + z + ') select:nth-child(2)' ).val( closed );

					z++;

				}

			} );

			e.preventDefault();

		} );

		// Sortable
		$( document ).on( 'wpcw.change', start_sortable );
		$( document ).on( 'click.widgets-toggle', start_sortable );
		$( document ).on( 'widget-updated', start_sortable );

	} );

} )( jQuery );
