<?php

namespace WPCW;

if ( ! defined( 'ABSPATH' ) ) {

	exit;

}

final class Hours extends Base_Widget {

	private $current_day;

	private $current_time;

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

		$this->current_time = current_time( 'timestamp' );
		$this->current_day  = strtolower( date( 'l', $this->current_time ) );

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

			if ( 'days' === $key ) {

				foreach ( $field['days'] as $day => $hours ) {

					$this->render_day_input( $fields['days'], $day, $hours );

				}

				continue;

			}

			$method = $field['form_callback'];

			if ( is_callable( [ $this, $method ] ) ) {

				$this->$method( $field );

			}

		}

		// Workaround customizer refresh @props @westonruter
		echo '<input class="customizer_update" type="hidden" value="">';

		echo '</div>'; // End form

		echo '</div>'; // End wpcw-widget-hours

	}

	/**
	 * Front-end display
	 *
	 * @param array $args
	 * @param array $instance
	 */
	public function widget( $args, $instance ) {

		$fields = $this->get_fields( $instance );

		$this->before_widget( $args, $fields );

		foreach ( $fields as $field ) {

			if ( isset( $field['days'] ) ) {

				foreach ( $field['days'] as $day_of_week => $store_hours ) {

					if ( $store_hours['not_open'] ) {

						printf(
							'<li>%1$s %2$s</li>',
							'<strong>' . esc_html( ucwords( $day_of_week ) ) . $this->open_sign( $day_of_week, $store_hours ) . '</strong>',
							'<div class="hours closed">' . __( 'Closed', 'wp-contact-widgets' ) . '</div>'
						);

						continue;

					}

					$hour_length = count( $store_hours['open'] );

					$x = 1;

					$microformat_data = [
						'day'   => $day_of_week,
						'open'  => $store_hours['open'],
						'close' => $store_hours['closed'],
					];

					$hours = [];

					while ( $x <= $hour_length ) {

						$hours[] = '<time ' . $this->get_microformat_markup( $microformat_data, $x ) . '>' . $store_hours['open'][ $x ] . ' - ' . $store_hours['closed'][ $x ] . '</time><br />';

						$x++;

					}

					printf(
						'<li>%1$s %2$s</li>',
						'<strong>' . esc_html( ucwords( $day_of_week ) ) . $this->open_sign( $day_of_week, $store_hours ) . '</strong>',
						'<div class="hours open">' . implode( '', $hours ) . '</div>'
					);

				}

				continue;

			}

			$escape_callback = $field['escaper'];

			echo apply_filters( 'the_content', $escape_callback( $field['value'] ) );

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
	protected function get_fields( array $instance, array $fields = [], $ordered = true ) {

		$fields = [
			'title' => [
				'label'       => __( 'Title:', 'contact-widgets' ),
				'description' => __( 'The title of this widget. Leave empty for no title.', 'contact-widgets' ),
				'value'       => ! empty( $instance['title'] ) ? $instance['title'] : '',
				'sortable'    => false,
			],
			'days' => [],
			'additional_content' => [
				'label'         => __( 'Additional Info.', 'contact-widgets' ),
				'type'          => 'textarea',
				'sanitizer'     => function( $value ) { return current_user_can( 'unfiltered_html' ) ? $value : wp_kses_post( stripslashes( $value ) ); },
				'escaper'       => function( $value ) { return nl2br( apply_filters( 'widget_text', $value ) ); },
				'form_callback' => 'render_form_textarea',
				'description'   => __( 'Enter additional information about your business.', 'contact-widgets' ),
			],
		];

		foreach ( $this->get_days_of_week() as $day ) {

			$day = strtolower( $day );

			$fields['days']['days'][ $day ] = [
				'open'     => ! empty( $instance['days'][ $day ]['open'] ) ? $instance['days'][ $day ]['open'] : '',
				'closed'   => ! empty( $instance['days'][ $day ]['closed'] ) ? $instance['days'][ $day ]['closed'] : '',
				'not_open' => ! empty( $instance['days'][ $day ]['not_open'] ) ? true : false,
			];

		}

		$fields = apply_filters( 'wpcw_widget_hours_custom_fields', $fields, $instance );
		$fields = parent::get_fields( $instance, $fields );

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
	 * Return an array of days of the week
	 *
	 * @since NEXT
	 *
	 * @return array
	 */
	public function get_days_of_week() {

		$days_of_the_week = [
			__( 'Monday', 'contact-widgets' ),
			__( 'Tuesday', 'contact-widgets' ),
			__( 'Wednesday', 'contact-widgets' ),
			__( 'Thursday', 'contact-widgets' ),
			__( 'Friday', 'contact-widgets' ),
			__( 'Saturday', 'contact-widgets' ),
			__( 'Sunday', 'contact-widgets' ),
		];

		/**
		 * Filter the start of the week on the front end
		 *
		 * @since NEXT
		 *
		 * @return string
		 */
		switch ( apply_filters( 'wpcw_widget_hours_first_day', 'start_of_week' ) ) {

			case 'current_day':

				$start_of_week = array_search( date( 'l', $this->current_time ), $days_of_the_week ) + 1;

				break;

			case 'start_of_week':
			default:

				$start_of_week = get_option( 'start_of_week', 1 );

				break;

		}

		if ( 1 < $start_of_week ) {

			return array_merge( array_splice( $days_of_the_week, ( $start_of_week - 1 ) ), $days_of_the_week );

		}

		return (array) $days_of_the_week;

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
	 * Generate the open sign on the front-end
	 *
	 * @param  string $day    The current day in the iteration.
	 * @param  array  $hours  Open/Closed hours.
	 *
	 * @since NEXT
	 *
	 *
	 * @return mixed
	 */
	protected function open_sign( $day, $hours ) {

		/**
		 * Allow users to disable the open sign
		 *
		 * @since NEXT
		 *
		 * @return string
		 */
		if ( (bool) ! apply_filters( 'wpcw_widget_hours_open_sign', true ) || $this->current_day !== $day ) {

			return;

		}

		$open_sign_text  = $this->is_business_open( $hours ) ? __( 'Open', 'wp-contact-widgets' ) : __( 'Closed', 'wp-contact-widgets' );
		$open_sign_class = $this->is_business_open( $hours ) ? 'open' : 'closed';

		return sprintf(
			'<span class="open-sign %1$s">%2$s</span>',
			esc_attr( $open_sign_class ),
			apply_filters( 'wpcw_widget_hours_open_sign_text', $open_sign_text, $this->is_business_open( $hours ) )
		);

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

		foreach ( $hours['open'] as $open_hours ) {

			if ( $this->current_time >= strtotime( $open_hours ) && $this->current_time <= strtotime( $hours['closed'][ $iteration ] ) ) {

				return true;

			}

			$iteration++;

		}

		return false;

	}

}
