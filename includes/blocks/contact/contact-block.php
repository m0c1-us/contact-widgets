<?php

namespace WPCW;

if ( ! defined( 'ABSPATH' ) ) {

	exit;

}

class Contact_Block {

	public function __construct() {

		add_action( 'enqueue_block_editor_assets', array( $this, 'gutenberg_scripts' ) );

		add_action( 'enqueue_block_assets', array( $this, 'contact_block_styles' ) );

	}


	/**
	 * Enqueue admin block scripts and styles.
	 */
	function gutenberg_scripts() {

		wp_enqueue_script( 'contact-block', plugins_url( 'contact-block.js', __FILE__ ), array( 'wp-blocks', 'wp-i18n', 'wp-element' ), Plugin::$version );

		wp_enqueue_style( 'contact-block-frontend', plugins_url( 'contact-block.css', __FILE__ ), array( 'wp-edit-blocks' ), Plugin::$version );

	}

	/**
	 * Enqueue frontend styles.
	 */
	public function contact_block_styles() {

		wp_enqueue_style( 'contact-block-frontend', plugins_url( 'contact-block.css', __FILE__ ), array( 'wp-edit-blocks' ), Plugin::$version );

	}

}

new Contact_Block();
