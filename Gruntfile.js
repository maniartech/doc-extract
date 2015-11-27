'use strict';
var src = [
    //doc-extract
    'src/root.js',
    'src/doc-extractor.js',
    'src/handlers/doc-handler.js',

    //handler classes
    'src/handlers/extends/doc-class-handler.js',
    'src/handlers/extends/doc-field-handler.js',
    'src/handlers/extends/doc-function-handler.js'
];

console.log("Ready to process", src.length, "source files.\n");

module.exports = function (grunt) {

    //Projects Configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        // license: grunt.file.readJSON("src/license.js"),
        concat: {
            // options: {
            //     banner: '<%= license %>'
            // },
            main: {
                src: src,
                dest: 'lib/doc-extract.js'
            }
        },
        watch: {
            scripts: {
                files: ['src/**/*.js'],
                tasks: ['concat'],
                options: {
                    nospawn: true
                }
            }
        }
    });

    //load plugins
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');

    //default task
    grunt.registerTask('default', ['concat:main']);
}