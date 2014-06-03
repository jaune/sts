module.exports = function (grunt) {

//    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-browserify');
//    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
//
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            source_js: {
                files: [
                    'source/*.js',
                    'source/**/*.js'
                ],
                tasks: ['browserify']
            }
        },
        browserify: {
            jetpack_index_js: {
                files: {
                    'build/jetpack.js': ['source/jetpack/index.js']
                },
                bundleOptions: {
                    debug: true
                }
            },
            ship_index_js: {
                files: {
                    'build/ship.js': ['source/ship/index.js']
                },
                bundleOptions: {
                    debug: true
                }
            },
            peer_index_js: {
                files: {
                    'build/peer.js': ['source/peer/index.js']
                },
                bundleOptions: {
                    debug: true
                }
            },
            pathfinder_index_js: {
                files: {
                    'build/pathfinder.js': ['source/pathfinder/index.js']
                },
                bundleOptions: {
                    debug: true
                }
            }
        },
        bower: {
            install: {
                options: {
                    targetDir: './bower_components'
                }
            }
        }
    });



    grunt.registerTask('default', ['run-server', 'browserify', 'watch']);

    grunt.registerTask('run-server', 'Start a custom web server', function() {
        require('./server.js');
    });


//    grunt.registerTask('default', ['uglify']);
//    grunt.registerTask('install', ['bower:install']);

    grunt.registerTask('npm-after-install', ['bower:install']);


};