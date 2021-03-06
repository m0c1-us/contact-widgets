<?php
/**
 * TestSocial class.
 *
 * @package ContactWidgets
 */

namespace WPCW;

/**
 * Contact Widgets TestSocial class.
 */
final class TestSocial extends TestCase {
	/**
	 * TestSocial class setUp function.
	 */
	public function setUp() {

		global $_wp_sidebars_widgets;

		parent::setUp();

		$this->plugin = new Social();

		if ( ! isset( $_wp_sidebars_widgets['sidebar-1']['wpcw_social'] ) ) {

			array_push( $_wp_sidebars_widgets['sidebar-1'], 'wpcw_social-1' );

		}

	}

	/**
	 * Function test_construct .
	 */
	public function test_construct() {

		$this->assertEquals( $this->plugin->widget_options['classname'], 'wpcw-widgets wpcw-widget-social' );

		$this->assertEquals( $this->plugin->id_base, 'wpcw_social' );

	}

	/**
	 * Function test_form tests form markup.
	 */
	public function test_form() {

		$this->expectOutputRegex( '/class="wpcw-widget wpcw-widget-social"/' );
		$this->expectOutputRegex( '/class="customizer_update"/' );
		$this->expectOutputRegex( '/class="default-fields"/' );

		$this->plugin->form( array() );

	}

	/**
	 * Function test_widget tests widget markup.
	 */
	public function test_widget() {

		$instance = array(
			'title'  => 'test',
			'labels' => array(
				'value' => 'yes',
			),
		);

		$args = array(
			'before_widget' => '<div class="widget wpcw-widget-social"><div class="widget-content">',
			'after_widget'  => '</div><div class="clear"></div></div>',
			'before_title'  => '<h3 class="widget-title">',
			'after_title'   => '</h3>',
		);

		$this->expectOutputRegex( '/<div class="widget wpcw-widget-social"><div class="widget-content">/' );
		$this->expectOutputRegex( '/<h3 class="widget-title">/' );

		$this->plugin->widget( $args, $instance );

		// Tests that script & styles are enqueued enqueued.
		do_action( 'wp_enqueue_scripts' ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- Used only in unit tests.

		$wp_styles  = wp_styles();
		$wp_scripts = wp_scripts();

		// Make sure the CSS files are enqueued.
		$this->assertContains( 'wpcw', $wp_styles->queue );
		$this->assertContains( 'font-awesome', $wp_styles->queue );

	}

}
