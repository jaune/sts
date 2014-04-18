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
            main_js: {
                files: [
                    'source/*.js'
                ],
                tasks: ['browserify:main_js']
            }
        },
        browserify: {
            main_js: {
                debug: true,
                files: {
                    'build/main.js': ['source/main.js']
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



    grunt.registerTask('default', ['run-server', 'browserify:main_js', 'watch:main_js']);

    grunt.registerTask('run-server', 'Start a custom web server', function() {
        require('./server.js');
    });


//    grunt.registerTask('default', ['uglify']);
//    grunt.registerTask('install', ['bower:install']);

    grunt.registerTask('npm-after-install', ['bower:install']);


};