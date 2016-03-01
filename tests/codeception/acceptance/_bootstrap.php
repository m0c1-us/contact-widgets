<?php
// Here you can initialize variables that will be available to your tests

WP_CLI::launch_self( 'selenium start', [], [], false );

// Activate twenty_sixteen for our test purpose
$current_theme = get_stylesheet();

switch_theme( 'twentysixteen' );

$contact_widgets = get_option( 'widget_wpcw_contact' );
$social_widgets = get_option( 'widget_wpcw_social' );

// Let's delete any present widget
delete_option( 'widget_wpcw_contact' );
delete_option( 'widget_wpcw_social' );

add_action( 'shutdown', function() use( $current_theme, $contact_widgets, $social_widgets ) {

	// No need to waste unnecessary ressources
	WP_CLI::launch_self( 'selenium stop', [], [], false );

	switch_theme( $current_theme );

	update_option( 'widget_wpcw_contact', $contact_widgets );
	update_option( 'widget_wpcw_social', $social_widgets );

} );

// Apply filters for browserstack credentials since we don't want to version it
self::$config['modules'] = [
	'config' => [
		'WebDriver' => [
			'url' => apply_filters( 'webdriver_url', site_url() ),
		],
		'BrowserStack' => [
			'url'        => apply_filters( 'browserstack_url', site_url() ),
			'username'   => apply_filters( 'browserstack_username', '' ),
			'access_key' => apply_filters( 'browserstack_accesskey', '' ),
		],
	],
];
