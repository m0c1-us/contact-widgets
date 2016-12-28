<?php

namespace WPCW;

if ( ! defined( 'ABSPATH' ) ) {

	exit;

}

final class Hours extends Base_Widget {

	/**
	 * Array of days in a week.
	 *
	 * @since NEXT
	 *
	 * @var array
	 */
	public $days_of_week = [];

	/**
	 * Maximum number of time blocks to allow per day.
	 *
	 * @since NEXT
	 *
	 * @var int
	 */
	private $max_time_blocks = 2;

	/**
	 * Widget constructor
	 */
	public function __construct() {

		$widget_options = [
			'classname'                   => 'wpcw-widgets wpcw-widget-hours',
			'description'                 => __( 'Display your hours of operation.', 'contact-widgets' ),
			'customize_selective_refresh' => true,
		];

		parent::__construct(
			'wpcw_hours',
			__( 'Hours of Operation', 'contact-widgets' ),
			$widget_options
		);

		$this->days_of_week = [
			0 => __( 'Sunday', 'contact-widgets' ),
			1 => __( 'Monday', 'contact-widgets' ),
			2 => __( 'Tuesday', 'contact-widgets' ),
			3 => __( 'Wednesday', 'contact-widgets' ),
			4 => __( 'Thursday', 'contact-widgets' ),
			5 => __( 'Friday', 'contact-widgets' ),
			6 => __( 'Saturday', 'contact-widgets' ),
		];

		/**
		 * Filter the maximum number of time blocks to allow per day.
		 *
		 * @since NEXT
		 *
		 * @var int
		 */
		$this->max_time_blocks = (int) apply_filters( 'wpcw_widget_hours_max_time_blocks', $this->max_time_blocks );
		$this->max_time_blocks = ( $this->max_time_blocks > 0 ) ? $this->max_time_blocks : 1; // Must be greater than 0

	}

	/**
	 * Widget form fields
	 *
	 * @param array $instance The widget options
	 *
	 * @return string|void
	 */
	public function form( $instance ) {

		parent::form( $instance );

		$fields = $this->get_fields( $instance );

		echo '<div class="wpcw-widget wpcw-widget-hours">';

		echo '<div class="title">';

		// Title field
		$this->render_form_input( array_shift( $fields ) );

		echo '</div>';

		echo '<div class="form">';

		foreach ( $fields as $key => $field ) {

			$method = $field['form_callback'];

			if (
				! is_callable( [ $this, $method ] )
				||
				( empty( $field['value'] ) && $field['hide_empty'] )
			) {

				continue;

			}

			if ( ! empty( $field['prepend'] ) ) {

				echo $field['prepend']; // xss ok

			}

			$this->$method( $field );

			if ( ! empty( $field['append'] ) ) {

				echo $field['append']; // xss ok

			}

		}

		// Workaround customizer refresh @props @westonruter
		echo '<input class="customizer_update" type="hidden" value="">';

		echo '</div><!-- .form -->';

		echo '</div><!-- .wpcw-widget-hours -->';

	}

	/**
	 * Override update method to unset empty time blocks.
	 *
	 * @since NEXT
	 *
	 * @param  array $new_instance
	 * @param  array $old_instance
	 *
	 * @return array
	 */
	public function update( $new_instance, $old_instance ) {

		$new_instance = parent::update( $new_instance, $old_instance );

		if ( 1 === $this->max_time_blocks ) {

			return $new_instance;

		}

		foreach ( $this->get_days_of_week() as $day => $label ) {

			foreach ( range( 1, $this->max_time_blocks ) as $block ) {

				if (
					empty( $new_instance['schedule'][ $day ]['blocks'][ $block ]['open'] )
					&&
					empty( $new_instance['schedule'][ $day ]['blocks'][ $block ]['close'] )
				) {

					unset( $new_instance['schedule'][ $day ]['blocks'][ $block ] );

				}

			}

		}

		return $new_instance;

	}

	/**
	 * Front-end display
	 *
	 * @param array $args
	 * @param array $instance
	 */
	public function widget( $args, $instance ) {

		$fields = $this->get_fields( $instance );

		if ( $this->is_widget_empty( $fields ) ) {

			return;

		}

		$this->before_widget( $args, $fields );

		$display_current_status = ( 'yes' === $this->get_field_value( $instance, 'display_current_status', 'yes' ) );
		$hide_closed            = ( 'yes' === $this->get_field_value( $instance, 'hide_closed', 'yes' ) );
		$display_in_groups      = ( 'yes' === $this->get_field_value( $instance, 'display_in_groups', 'yes' ) );

		if ( $display_current_status ) {

			/**
			 * TODO: Handle this with JavaScript so it works with full-page caching.
			 *
			 * 1. Expose this site's timezone and daily schedule as JSON.
			 * 2. Use JavaScript to compare the visitor's current time against our schedule.
			 * 3. Populate this element dynamically with JavaScript.
			 */
			echo '<li><span class="wpcw-open-sign"></span></li>';

		}

		/**
		 * TODO: Combine days that have identical hours when the
		 * `$display_in_groups` option is ON.
		 *
		 * And it should also group closed days if the `$hide_closed`
		 * option is OFF.
		 *
		 * e.g.
		 *
		 * Monday - Friday
		 * 9:00 am - 5:00 pm
		 *
		 * Saturday
		 * 9:00 am - 12:00 pm
		 *
		 * Sunday
		 * Closed
		 */
		foreach ( $this->get_days_of_week() as $day => $label ) {

			$is_closed = ( 'yes' === $this->get_field_value( $instance, "schedule[{$day}][closed]", 'no' ) );

			if ( $hide_closed && $is_closed ) {

				continue;

			}

			$time_blocks = $this->get_field_value( $instance, "schedule[{$day}][blocks]", [] );
			$time_blocks = array_combine(
				wp_list_pluck( $time_blocks, 'open' ),
				wp_list_pluck( $time_blocks, 'close' )
			);

			echo '<li>';

			printf( '<strong class="day">%s</strong>', esc_html( $label ) );

			if ( $is_closed ) {

				printf( '<span>%s</span>', __( 'Closed', 'contact-widgets' ) );

				continue;

			}

			printf(
				'<time itemprop="openingHours" datetime="%s %s">%s</time>',
				substr( jddayofweek( fmod( $day - 1, 7 ), 2 ), 0, 2 ),
				implode( ', ', array_map(
					function ( $close, $open ) {
						return sprintf( '%s-%s', $open, $close );
					},
					$time_blocks,
					array_keys( $time_blocks )
				) ),
				implode( '<br>', array_map(
					function ( $close, $open ) {
						return sprintf(
							'%s &ndash; %s',
							date( (string) get_option( 'time_format' ), strtotime( $open ) ),
							date( (string) get_option( 'time_format' ), strtotime( $close ) )
						);
					},
					$time_blocks,
					array_keys( $time_blocks )
				) )
			);

			echo '</li>';

		}

		if ( $info = $this->get_field_value( $instance, 'info' ) ) {

			printf( '<li>%s</li>', wpautop( $info ) ); // xss ok

		}

		$this->after_widget( $args, $fields );

	}

	/**
	 * Initialize fields for use on front-end of forms
	 *
	 * @param array $instance
	 * @param array $fields
	 * @param bool  $ordered
	 *
	 * @return array
	 */
	protected function get_fields( array $instance, array $fields = [], $ordered = false ) {

		$fields['title'] = [
			'label'       => __( 'Title:', 'contact-widgets' ),
			'description' => __( 'The title of this widget. Leave empty for no title.', 'contact-widgets' ),
		];

		foreach ( $this->get_days_of_week() as $day => $label ) {

			$is_closed = ( 'yes' === $this->get_field_value( $instance, "schedule[{$day}][closed]" ) );
			$blocks    = range( 0, $this->max_time_blocks - 1 );

			foreach ( $blocks as $block ) {

				$is_last_block = ( false === $this->get_field_value( $instance, sprintf( 'schedule[%d][blocks][%d][open]', $day, $block + 1 ), false ) );

				$fields[ "schedule[{$day}][blocks][{$block}][open]" ] = [
					'type'           => 'select',
					'sanitizer'      => function( $value ) { return date( 'H:i', strtotime( (string) $value ) ); },
					'label'          => ( $block > 0 ) ? sprintf( _x( 'Open Time (Block %d)', 'time block number', 'contact-widgets' ), $block + 1 ) : __( 'Open Time', 'contact-widgets' ),
					'hide_label'     => true,
					'form_callback'  => 'render_form_select',
					'select_options' => $this->get_times(),
					'prepend'        => sprintf( '<div class="time-block" data-time-block="%d">', $block ),
					'hide_empty'     => ( $block > 0 ),
					'default'        => ( $block > 0 ) ? '' : '00:00',
					'class'          => ( $is_closed ) ? 'widefat time-block-open disabled' : 'widefat time-block-open',
					'sortable'       => false,
					'wrapper'        => '',
				];

				if ( 0 === $block ) {

					ob_start();

					?>
					<div class="day-row <?php echo ( $is_closed ) ? 'status-closed' : 'status-open'; ?>" data-day="<?php echo absint( $day ); ?>">
						<div class="day-row-top">
							<strong><?php echo esc_html( $label ); ?></strong>
							<span class="toggle-icon dashicons dashicons-arrow-down"></span>
							<span class="status-open-label"><?php _e( 'Open', 'contact-widgets' ); ?></span>
							<span class="status-closed-label"><?php _e( 'Closed', 'contact-widgets' ); ?></span>
						</div><!-- .day-row-top -->
						<div class="day-row-container">
							<div class="time-blocks">
								<div class="time-block" data-time-block="<?php echo absint( $block ); ?>">
					<?php

					$fields[ "schedule[{$day}][blocks][{$block}][open]" ]['prepend'] = ob_get_clean();

				}

				$fields[ "schedule[{$day}][blocks][{$block}][close]" ] = [
					'type'           => 'select',
					'sanitizer'      => function( $value ) { return date( 'H:i', strtotime( (string) $value ) ); },
					'label'          => ( $block > 0 ) ? sprintf( _x( 'Close Time (Block %d)', 'time block number', 'contact-widgets' ), $block + 1 ) : __( 'Close Time', 'contact-widgets' ),
					'hide_label'     => true,
					'form_callback'  => 'render_form_select',
					'select_options' => $this->get_times(),
					'hide_empty'     => ( $block > 0 ),
					'default'        => ( $block > 0 ) ? '' : '00:00',
					'class'          => ( $is_closed ) ? 'widefat time-block-open disabled' : 'widefat time-block-open',
					'sortable'       => false,
					'wrapper'        => '',
					'append'         => sprintf(
						'<a href="#" class="button button-secondary %s" data-action="%s" %s>%s</a></div><!-- .time-block -->',
						( $is_closed ) ? 'disabled' : '',
						( $block > 0 ) ? 'remove' : 'add',
						( ! $is_last_block ) ? 'style="display: none;"' : '',
						( $block > 0 ) ? '-' : '+'
					),
				];

			}

			$fields[ "schedule[{$day}][closed]" ] = [
				'type'      => 'checkbox',
				'sanitizer' => function ( $value ) { return ( 'yes' === (string) $value ) ? 'yes' : 'no'; },
				'class'     => 'status-closed-checkbox',
				'label'     => __( 'Closed', 'contact-widgets' ),
				'default'   => 'no',
				'value'     => 'yes',
				'atts'      => $this->checked( $is_closed, true ),
				'sortable'  => false,
				'wrapper'   => '',
				'prepend'   => sprintf(
					'</div><!-- .time-blocks --><a href="#" class="apply-to-all">%s</a><span class="status-closed-checkbox">',
					__( 'Apply to all', 'contact-widgets' )
				),
				'append'    => '</span><!-- .status-closed-checkbox --></div><!-- .day-row-container --></div><!-- .day-row -->',
			];

		}

		$fields['display_current_status'] = [
			'type'        => 'checkbox',
			'sanitizer'   => function ( $value ) { return ( 'yes' === (string) $value ) ? 'yes' : 'no'; },
			'label'       => __( 'Display current status?', 'contact-widgets' ),
			'label_after' => true,
			'default'     => 'no',
			'value'       => 'yes',
			'atts'        => $this->checked( 'yes', $this->get_field_value( $instance, 'display_current_status', 'yes' ) ),
			'sortable'    => false,
		];

		$fields['hide_closed'] = [
			'type'        => 'checkbox',
			'sanitizer'   => function ( $value ) { return ( 'yes' === (string) $value ) ? 'yes' : 'no'; },
			'label'       => __( 'Hide days marked as closed?', 'contact-widgets' ),
			'label_after' => true,
			'default'     => 'no',
			'value'       => 'yes',
			'atts'        => $this->checked( 'yes', $this->get_field_value( $instance, 'hide_closed', 'yes' ) ),
			'sortable'    => false,
		];

		$fields['display_in_groups'] = [
			'type'        => 'checkbox',
			'sanitizer'   => function ( $value ) { return ( 'yes' === (string) $value ) ? 'yes' : 'no'; },
			'label'       => __( 'Group days with the same hours?', 'contact-widgets' ),
			'label_after' => true,
			'default'     => 'no',
			'value'       => 'yes',
			'atts'        => $this->checked( 'yes', $this->get_field_value( $instance, 'display_in_groups', 'yes' ) ),
			'sortable'    => false,
		];

		$fields['info'] = [
			'label'         => __( 'More Information:', 'contact-widgets' ),
			'type'          => 'textarea',
			'sanitizer'     => function( $value ) { return current_user_can( 'unfiltered_html' ) ? (string) $value : wp_kses_post( stripslashes( (string) $value ) ); },
			'escaper'       => function( $value ) { return nl2br( apply_filters( 'widget_text', (string) $value ) ); },
			'form_callback' => 'render_form_textarea',
			'description'   => __( 'Display more information about your hours of operation.', 'contact-widgets' ),
			'sortable'      => false,
			'hide_empty'    => false,
		];

		$fields = apply_filters( 'wpcw_widget_hours_custom_fields', $fields, $instance );
		$fields = parent::get_fields( $instance, $fields, $ordered );

		/**
		 * Filter the contact fields
		 *
		 * @since NEXT
		 *
		 * @return array
		 */
		return (array) apply_filters( 'wpcw_widget_hours_fields', $fields, $instance );

	}

	/**
	 * Return an array of days relative to the site's `start_of_week` setting.
	 *
	 * @since NEXT
	 *
	 * @return array
	 */
	public function get_days_of_week() {

		$start_of_week = (int) get_option( 'start_of_week', 1 );

		$slice_1 = array_slice( $this->days_of_week, $start_of_week, null, true );
		$slice_2 = array_slice( $this->days_of_week, 0, count( $this->days_of_week ) - count( $slice_1 ), true );

		return $slice_1 + $slice_2; // Preserve keys

	}

	/**
	 * Return an array of times in half-hour increments
	 *
	 * @since NEXT
	 *
	 * @return array
	 */
	protected function get_times() {

		/**
		 * Filter the time increment (in minutes)
		 *
		 * @since NEXT
		 *
		 * @return int
		 */
		$increment = (int) apply_filters( 'wpcw_hours_time_increment', HOUR_IN_SECONDS / 60 / 2 );

		$times = range( 0, DAY_IN_SECONDS / 60, $increment );

		$keys = array_map( function ( $time ) {

			return date( 'H:i', $time * 60 );

		}, $times );

		$values = array_map( function ( $time ) {

			return date( (string) get_option( 'time_format' ), $time * 60 );

		}, $times );

		return array_combine( $keys, $values );

	}

	/**
	 * Generate the opening hours microformat markup
	 * @link https://schema.org/openingHours
	 *
	 * @since NEXT
	 *
	 * @param  array $microformat_data Microformat data array.
	 *
	 * @return string
	 */
	protected function get_microformat_markup( $microformat_data, $iteration ) {

		$day   = ucwords( substr( $microformat_data['day'], 0, 2 ) );
		$open  = date( 'H:i', strtotime( $microformat_data['open'][ $iteration ] ) );
		$close = date( 'H:i', strtotime( $microformat_data['close'][ $iteration ] ) );

		$microformat_attributes = [
			'itemprop="openingHours"',
			'datetime="' . esc_attr( $day . ' ' . $open . '-' . $close ) . '"',
		];

		return implode( ' ', $microformat_attributes );

	}

	/**
	 * Check if the business is open based on the current server time
	 *
	 * @param array $hours Open/Closed times
	 *
	 * @since NEXT
	 *
	 * @return boolean
	 */
	protected function is_business_open( $hours ) {

		$iteration = 1;

		if ( $hours['not_open'] ) {

			return false;

		}

		foreach ( $hours['open'] as $open_hours ) {

			if ( $this->current_time >= strtotime( $open_hours ) && $this->current_time <= strtotime( $hours['closed'][ $iteration ] ) ) {

				return true;

			}

			$iteration++;

		}

		return false;

	}

}
