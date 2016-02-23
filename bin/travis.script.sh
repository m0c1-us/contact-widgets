#!/usr/bin/env bash

set -e

function run_wp_codeception {

	if [ ! -f "/tmp/wp-cli.phar" ];  then
		download https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar /tmp/wp-cli.phar
	fi

	INSTALL_PATH="$WP_CORE_DIR/src/wp-content/plugins/$PROJECT_SLUG"

	php /tmp/wp-cli.phar codeception run --debug --path="$INSTALL_PATH"

}

run_wp_codeception
