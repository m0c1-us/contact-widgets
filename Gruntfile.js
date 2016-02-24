module.exports = function(grunt) {

	var BUILD_DIR = 'build',
			SOURCE_DIR = '.',
			SLUG = 'contact-widgets';

	require('matchdep').filterDev('grunt-*').forEach( grunt.loadNpmTasks );

	// Project configuration.
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

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

		clean: [ BUILD_DIR ],

		copy: {
			files: {
				cwd: SOURCE_DIR,
				expand: true,
				src: [
					SLUG + '.php',
					'readme.txt',
					'languages/**',
					'includes/**',
					'assets/**',
					'!assets/*.png'
				],
				dest: BUILD_DIR
			}
		},

		wp_deploy: {
			deploy: {
				options: {
					plugin_slug: SLUG,
					build_dir: BUILD_DIR,
					assets_dir: 'wp-assets'
				},
			}
		}

	});

	// Default task(s).
	grunt.registerTask('default', ['cssmin', 'uglify']);
	grunt.registerTask('build', ['default', 'clean', 'copy']);
	grunt.registerTask('deploy', ['build','wp_deploy']);

};
