<?php

namespace WPCW;

if ( ! defined( 'ABSPATH' ) ) {

	exit;

}

final class Hours extends Base_Widget {

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

		echo '<div class="wphoow-widget wphoow-widget-hours">';

		echo '<div class="title">';

		// Title field
		$this->render_form_input( array_shift( $fields ) );

		echo '</div>';

		echo '<div class="form">';

		foreach ( $fields as $key => $field ) {

			if ( 'days' === $key ) {

				parent::print_label( $field );

				foreach ( $field['days'] as $day => $hours ) {

					$this->render_day_input( $fields['days'], $day, $hours );

				}
			}
		}

		// Workaround customizer refresh @props @westonruter
		echo '<input class="customizer_update" type="hidden" value="">';

		echo '</div>'; // End form

		echo '</div>'; // End wphoow-widget-hours

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

		foreach ( $fields as $field ) {

			$label = $field['label'];

			if ( isset( $field['days'] ) ) {

				foreach ( $field['days'] as $day_of_week => $store_hours ) {

					$hours = ( $store_hours['not_open'] ) ? __( 'Closed', 'contact-widgets' ) : $store_hours['open'] . ' - ' . $store_hours['closed'];

					$class = ( $store_hours['not_open'] ) ? 'closed' : 'open';

					printf(
						'<li>%s<br />%s</li>',
						'<strong>' . esc_html( ucwords( $day_of_week ) ) . '</strong>',
						'<div class="hours ' . esc_attr( $class ) . '">' . esc_html( $hours ) . '</div>'
					);

				}
			}
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
			'title'   => [
				'label'       => __( 'Title:', 'contact-widgets' ),
				'description' => __( 'The title of this widget. Leave empty for no title.', 'contact-widgets' ),
				'value'       => ! empty( $instance['title'] ) ? $instance['title'] : '',
				'sortable'    => false,
			],
			'days'    => [
				'label'       => __( 'Days of the week:', 'contact-widgets' ),
				'description' => __( 'Enter your hours in the following fields.', 'contact-widgets' ),
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

		$fields = apply_filters( 'wphoow_widget_contact_custom_fields', $fields, $instance );
		$fields = parent::get_fields( $instance, $fields );

		/**
		 * Filter the contact fields
		 *
		 * @since NEXT
		 *
		 * @var array
		 */
		return (array) apply_filters( 'wphoow_widget_contact_fields', $fields, $instance );

	}

	/**
	 * Return an array of days of the week
	 *
	 * @return array
	 */
	public function get_days_of_week() {

		$start_of_week = get_option( 'start_of_week', 1 );

		$days_of_the_week = [
			__( 'Monday', 'contact-widgets' ),
			__( 'Tuesday', 'contact-widgets' ),
			__( 'Wednesday', 'contact-widgets' ),
			__( 'Thursday', 'contact-widgets' ),
			__( 'Friday', 'contact-widgets' ),
			__( 'Saturday', 'contact-widgets' ),
			__( 'Sunday', 'contact-widgets' ),
		];

		if ( 1 < $start_of_week ) {

			return array_merge( array_splice( $days_of_the_week, ( $start_of_week - 1 ) ), $days_of_the_week );

		}

		return $days_of_the_week;

	}

}
