<?php

namespace WPCW;

if ( ! defined( 'ABSPATH' ) ) {

	exit;

}

class Content_Blocks {

	public function __construct() {

		include_once( __DIR__ . '/blocks/contact/contact-block.php' );
		include_once( __DIR__ . '/blocks/social/social-block.php' );

	}

}
