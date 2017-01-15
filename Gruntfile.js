module.exports = function(grunt) {

	var BUILD_DIR = 'build/';

	var pkg = grunt.file.readJSON( 'package.json' );

	var svn_username = false;

	if ( grunt.file.exists( 'svn-username' ) ) {

		svn_username = grunt.file.read( 'svn-username' ).trim();

	}

	grunt.initConfig({

		pkg: pkg,

		clean: {
			build: [ BUILD_DIR + '*' ],
			options: {
				force: true
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

		cssjanus: {
			theme: {
				options: {
					swapLtrRtlInUrl: false
				},
				files: [
					{
						expand: true,
						cwd: 'assets/css',
						src: [ '*.css', '!*-rtl.css', '!*.min.css', '!*-rtl.min.css' ],
						dest: 'assets/css',
						ext: '-rtl.css'
					}
				]
			}
		},

		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1,
				processImport: false
			},
			target: {
				files: [
					{
						expand: true,
						cwd: 'assets/css',
						src: [ '*.css', '!*.min.css' ],
						dest: 'assets/css',
						ext: '.min.css'
					}
				]
			}
		},

		devUpdate: {
			main: {
				options: {
					updateType: 'force',
					reportUpdated: false,
					semver: true,
					packages: {
						devDependencies: true,
						dependencies: false
					},
					packageJson: null,
					reportOnlyPkgs: []
				}
			}
		},

		jshint: {
			all: [ 'Gruntfile.js', 'assets/js/**/*.js', '!assets/js/**/*.min.js' ]
		},

		makepot: {
			target: {
				options: {
					domainPath: 'languages/',
					include: [ pkg.name + '.php', 'includes/.+\.php' ],
					potComments: 'Copyright (c) {year} GoDaddy Operating Company, LLC. All Rights Reserved.',
					potHeaders: {
						'x-poedit-keywordslist': true
					},
					processPot: function( pot, options ) {
						pot.headers['report-msgid-bugs-to'] = pkg.bugs.url;
						return pot;
					},
					type: 'wp-plugin',
					updatePoFiles: true
				}
			}
		},

		potomo: {
			files: {
				expand: true,
				cwd: 'languages',
				src: [ '*.po' ],
				dest: 'languages',
				ext: '.mo'
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

		uglify: {
			options: {
				ASCIIOnly: true
			},
			core: {
				expand: true,
				cwd: 'assets/js',
				dest: 'assets/js',
				ext: '.min.js',
				src: [ '*.js', '!*.min.js' ]
			}
		},

		watch: {
			css: {
				files: [ '*.css', '!*.min.css' ],
				options: {
					cwd: 'assets/css',
					nospawn: true
				},
				tasks: [ 'cssmin' ]
			},
			uglify: {
				files: [ '*.js', '!*.js.css' ],
				options: {
					cwd: 'assets/js',
					nospawn: true
				},
				tasks: [ 'uglify' ]
			}
		},

		wp_deploy: {
			deploy: {
				options: {
					plugin_slug: pkg.name,
					build_dir: BUILD_DIR,
					assets_dir: 'wp-org-assets',
					svn_user: svn_username
				}
			}
		}

	});

	require( 'matchdep' ).filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks );

	grunt.registerTask( 'default', [ 'cssjanus', 'cssmin', 'jshint', 'uglify' ] );
	grunt.registerTask( 'build', [ 'default', 'version', 'clean', 'copy' ] );
	grunt.registerTask( 'deploy', [ 'build', 'wp_deploy', 'clean' ] );
	grunt.registerTask( 'update-pot', [ 'makepot' ] );
	grunt.registerTask( 'update-mo', [ 'potomo' ] );
	grunt.registerTask( 'version', [ 'replace' ] );

};
