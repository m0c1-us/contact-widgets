( function( $ ) {

	$.fn.selectString = function( string ) {

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
			start: function( e, ui ) {
				ui.placeholder.height( ui.helper.height() );
			},
			stop: function( e, ui ) {
				// Trigger change for customizer
				$contact_form.find( '.customizer_update' ).val( ui.item.index() ).trigger( 'change' );
			}
		} );

	}

	function timepicker_init() {

		$( '.timeselect' ).timepicker( {
			'timeFormat': wpcw_admin.time_format
		} );

		var timePicker = {

			changeTime: function() {

				var $this = $( this );

				$this.attr( 'value', $this.val() );

			},

			showPicker: function() {

				$( '.ui-timepicker-wrapper' ).css( 'width', $( this ).innerWidth() + 'px' );

			}

		};

		$( '.timeselect' ).on( 'changeTime', timePicker.changeTime );
		$( '.timeselect' ).on( 'showTimepicker', timePicker.showPicker );

	}

	var socialField = {

		     $btn: null,
		  $widget: null,
		$template: null,

		init: function( e ) {

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

		add: function() {

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

		remove: function() {

			this.$btn.addClass( 'inactive' );

			this.$widget
				.find( '.form .' + this.$btn.data( 'key' ) )
				.stop( true, true )
				.animate( {
					height: 'toggle',
					opacity: 'toggle'
				}, 250, function() {
					$( this ).remove();
				} );

			this.update_customizer();

		},

		update_customizer: function() {

			var count = this.$widget.find( 'div > div' ).length;

			this.$widget.find( '.customizer_update' ).val( count ).trigger( 'change' );

		}

	};

	var dayRow = {

		toggle: function( e ) {

			var $this      = $( this ),
			    $day       = $this.closest( '.day-row' ),
			    $container = $day.find( '.day-row-container' ),
			    is_closed  = $day.hasClass( 'status-closed' );

			if ( $container.is( ':animated' ) ) {

				return false;

			}

			$this.find( 'input[type="checkbox"]' ).prop( 'checked', is_closed );

			timepicker_init();

			$container.slideToggle( 'fast' );

			$day
				.toggleClass( 'status-open', is_closed )
				.toggleClass( 'status-closed', ! is_closed );

			$day.find( '.timeselect' )
				.prop( 'disabled', ! is_closed )
				.toggleClass( 'disabled', ! is_closed );

			$day.find( 'a.button' )
				.toggleClass( 'disabled', ! is_closed );

		},

		addBlock: function( e ) {

			e.preventDefault();

			var $this = $( this );

			if ( $this.hasClass( 'disabled' ) ) {

				return false;

			}

			var $block  = $this.closest( '.time-block' ),
			    $clone  = dayRow.cloneTimeBlock( $block, $block.parent() );

			$clone.find( '.button' )
				.attr( 'data-action', 'remove' );

			$clone.find( '.button span' )
				.removeClass( 'add' );

			$this.hide();

			timepicker_init();

		},

		removeBlock: function( e ) {

			e.preventDefault();

			var $this = $( this );

			if ( $this.hasClass( 'disabled' ) ) {

				return false;

			}

			var $block = $this.closest( '.time-block' );

			$block.prev( '.time-block' ).find( '.button' ).show();

			$block.remove();

		},

		cloneTimeBlock: function( $block, $target ) {

			var block        = parseInt( $block.attr( 'data-time-block' ), 10 ),
			    target_block = $target.is( ':empty' ) ? 0 : parseInt( $target.find( '.time-block' ).last().attr( 'data-time-block' ), 10 ) + 1,
			    $clone       = $block.clone(),
			    html         = $clone.html(),
			    name_search  = '\\[blocks\\]\\[' + block + '\\]',
			    name_replace = '[blocks][' + target_block + ']',
			    id_search    = '-blocks-' + block,
			    id_replace   = '-blocks-' + target_block;

			html = html.replace( new RegExp( name_search, 'g' ), name_replace ),
			html = html.replace( new RegExp( id_search, 'g' ), id_replace ),

			$clone = $clone.html( html );

			$target.append( $clone );

			$clone.attr( 'data-time-block', target_block );

			return $clone;

		}

	};

	$( document ).ready( function( $ ) {

		timepicker_init();

		// Social
		$( document ).on( 'click', '.wpcw-widget-social .icons a', socialField.init );

		// Hours of Operation
		$( document ).on( 'click', '.wpcw-widget-hours .day-row-top label', dayRow.toggle );
		$( document ).on( 'click', '.wpcw-widget-hours .time-block .button[data-action="add"]', dayRow.addBlock );
		$( document ).on( 'click', '.wpcw-widget-hours .time-block .button[data-action="remove"]', dayRow.removeBlock );

		// Sortable
		$( document ).on( 'wpcw.change', function() {

			start_sortable();

			timepicker_init();

		} );
		$( document ).on( 'click.widgets-toggle', start_sortable );
		$( document ).on( 'widget-updated', function() {

			start_sortable();

			timepicker_init();

		} );

	} );

} )( jQuery );
