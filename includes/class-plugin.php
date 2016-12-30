<?php

namespace WPCW;

if ( ! defined( 'ABSPATH' ) ) {

	exit;

}

class Plugin {

	/**
	 * Plugin version
	 *
	 * @var string
	 */
	public static $version = '1.0.1';

	/**
	 * Plugin assets URL
	 *
	 * @var string
	 */
	public static $assets_url;

	/**
	 * Class constructor
	 */
	public static function init() {

		static::$assets_url = plugin_dir_url( __DIR__ ) . 'assets/';

		add_action( 'widgets_init', [ get_called_class(), 'register_widgets' ] );

	}

	/**
	 * Register our custom widget using the api
	 */
	public static function register_widgets() {

		register_widget( __NAMESPACE__ . '\Contact' );
		register_widget( __NAMESPACE__ . '\Hours' );
		register_widget( __NAMESPACE__ . '\Social' );

	}

}
