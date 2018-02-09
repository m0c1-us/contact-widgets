<?php

namespace WPCW;

if ( ! defined( 'ABSPATH' ) ) {

	exit;

}

class Gutenberg {

	public function __construct() {

		include_once( __DIR__ . '/blocks/contact/contact-block.php' );

	}

}
