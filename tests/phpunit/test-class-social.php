<?php

namespace WPCW;

final class TestSocial extends TestCase {

	function setUp() {

		parent::setUp();

		$this->plugin = new Social();

	}

	function test_construct() {

		$this->assertEquals( $this->plugin->widget_options['classname'], 'wpcw-widget-social' );

		$this->assertEquals( $this->plugin->id_base, 'wpcw_social' );

	}

	function test_form() {

		$this->expectOutputRegex( '/class="wpcw-widget wpcw-widget-social"/' );
		$this->expectOutputRegex( '/class="customizer_update"/' );
		$this->expectOutputRegex( '/class="default-fields"/' );

		$this->plugin->form( [] );

	}

	function test_widget() {

		$wp_styles = wp_styles();

		$instance = [
			'title'  => 'test',
			'labels' => [
				'value' => 'yes',
			],
		];
		$args = [
			'before_widget' => '<div class="widget wpcw-widget-social"><div class="widget-content">',
			'after_widget' => '</div><div class="clear"></div></div>',
			'before_title'  => '<h3 class="widget-title">',
			'after_title'   => '</h3>',
		];

		$this->expectOutputRegex( '/<div class="widget wpcw-widget-social"><div class="widget-content">/' );
		$this->expectOutputRegex( '/<h3 class="widget-title">/' );

		$this->plugin->widget( $args, $instance );

		// Make sure the JS file is enqueued
		$this->assertContains( 'font-awesome', $wp_styles->queue );
		$this->assertContains( 'wpcw', $wp_styles->queue );

	}

}

