module.exports = function(grunt) {

	var BUILD_DIR = 'build/';

	var pkg = grunt.file.readJSON( 'package.json' );

	var svn_username = false;

	if ( grunt.file.exists( 'svn-username' ) ) {

		svn_username = grunt.file.read( 'svn-username' ).trim();

	}

	require('matchdep').filterDev('grunt-*').forEach( grunt.loadNpmTasks );

	// Project configuration.
	grunt.initConfig({

		pkg: pkg,

		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1,
				processImport: false
			},
			target: {
				files: [{
					expand: true,
					cwd: 'assets/css',
					src: ['*.css', '!*.min.css'],
					dest: 'assets/css',
					ext: '.min.css'
				}]
			}
		},

		uglify: {
			options: {
				ASCIIOnly: true
			},
			core: {
				expand: true,
				cwd: 'assets/js',
				dest: 'assets/js',
				ext: '.min.js',
				src: ['*.js', '!*.min.js']
			}
		},

		watch: {
			css: {
				files: ['*.css', '!*.min.css'],
				options: {
					cwd: 'assets/css',
					nospawn: true
				},
				tasks: ['cssmin']
			},
			uglify: {
				files: ['*.js', '!*.js.css'],
				options: {
					cwd: 'assets/js',
					nospawn: true
				},
				tasks: ['uglify']
			}
		},

		clean: {
			build: [ BUILD_DIR + '*' ],
			options: {
				force: true
			}
		},


		replace: {
			version_php: {
				src: [
					'**/*.php',
					'!vendor/**',
					'!dev-lib/*'
				],
				overwrite: true,
				replacements: [ {
					from: /Version:(\s*?)[a-zA-Z0-9\.\-\+]+$/m,
					to: 'Version:$1' + pkg.version
				}, {
					from: /@version(\s*?)[a-zA-Z0-9\.\-\+]+$/m,
					to: '@version$1' + pkg.version
				}, {
					from: /@since(.*?)NEXT/mg,
					to: '@since$1' + pkg.version
				}, {
					from: /VERSION(\s*?)=(\s*?['"])[a-zA-Z0-9\.\-\+]+/mg,
					to: 'VERSION$1=$2' + pkg.version
				} ]
			},
			version_readme: {
				src: 'readme.*',
				overwrite: true,
				replacements: [ {
					from: /^(\*\*|)Stable tag:(\*\*|)(\s*?)[a-zA-Z0-9.-]+(\s*?)$/mi,
					to: '$1Stable tag:$2$3<%= pkg.version %>$4'
				} ]
			}
		},

		copy: {
			files: {
				cwd: '.',
				expand: true,
				src: [
					pkg.name + '.php',
					'readme.txt',
					'languages/*.mo',
					'includes/**',
					'assets/**'
				],
				dest: BUILD_DIR
			}
		},

		wp_deploy: {
			deploy: {
				options: {
					plugin_slug: pkg.name,
					build_dir: BUILD_DIR,
					assets_dir: 'wp-org-assets',
					svn_user: svn_username
				},
			}
		},

		pot: {
			options: {
				omit_header: false,
				text_domain: pkg.name,
				encoding: 'UTF-8',
				dest: 'languages/',
				keywords: [ '__', '_e', '__ngettext:1,2', '_n:1,2', '__ngettext_noop:1,2', '_n_noop:1,2', '_c', '_nc:4c,1,2', '_x:1,2c', '_nx:4c,1,2', '_nx_noop:4c,1,2', '_ex:1,2c', 'esc_attr__', 'esc_attr_e', 'esc_attr_x:1,2c', 'esc_html__', 'esc_html_e', 'esc_html_x:1,2c' ],
				msgmerge: true
			},
			files: {
				src: [ 'includes/*.php', pkg.name + '.php' ],
				expand: true
			}
		},

		po2mo: {
			files: {
				src: 'languages/*.po',
				expand: true
			}
		}

	});

	// Default task(s).
	grunt.registerTask('default', ['cssmin', 'uglify']);
	grunt.registerTask('version', ['replace'] );
	grunt.registerTask('build', ['default', 'version', 'clean', 'copy']);
	grunt.registerTask('deploy', ['build', 'wp_deploy', 'clean']);
	grunt.registerTask('update_translation', ['pot','po2mo']);

};
