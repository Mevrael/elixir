/*
 |----------------------------------------------------------------
 | Rollup bundling task
 |----------------------------------------------------------------
 |
 | This task will bundle your JavaScript or ECMAScript 6 app
 | using rollup.js - a next-generation ES6 module bundler.
 | Rollup.js is a module bundler to concatenate everything into a single file.
 | Rollup statically analyses your code, and your dependencies,
 | and includes the bare minimum in your bundle.
 */

var gulp = require('gulp');
var Elixir = require('laravel-elixir');

var $ = Elixir.Plugins;
var config = Elixir.config;


// TODO: remove/fix this in repo
config.js.rollup = {
    options: {}
};

$.rollup = require('gulp-rollup');
// end of todo

Elixir.extend('rollup', function(scripts, output, baseDir, options) {
    var paths = prepGulpPaths(scripts, baseDir, output);

    new Elixir.Task('rollup', function() {
        var rollupOptions = options || config.js.rollup.options;

        return gulpTask.call(this, paths, rollupOptions);
    })
        .watch(paths.src.path)
        .ignore(paths.output.path);
});

/**
 * Trigger the Gulp task logic.
 *
 * @param {GulpPaths}   paths
 * @param {object|null} rollup
 */
var gulpTask = function(paths, rollup) {
    this.log(paths.src, paths.output);

    return (
        gulp
            .src(paths.src.path)
            .pipe($.if(config.sourcemaps, $.sourcemaps.init()))
            .pipe($.if(rollup, $.rollup(rollup)))
            .on('error', function(e) {
                new Elixir.Notification().error(e, 'Rollup Compilation Failed!');
                this.emit('end');
            })
            .pipe($.if(config.production, $.uglify({compress: { drop_console: true }})))
            .pipe($.if(config.sourcemaps, $.sourcemaps.write('.')))
            .pipe(gulp.dest(paths.output.baseDir))
            .pipe(new Elixir.Notification('Rollup bundle compiled!'))
    );
};

/**
 * Prep the Gulp src and output paths.
 *
 * @param  {string|Array} src
 * @param  {string|null}  baseDir
 * @param  {string|null}  output
 * @return {GulpPaths}
 */
var prepGulpPaths = function(src, baseDir, output) {
    return new Elixir.GulpPaths()
        .src(src, baseDir || config.get('assets.js.folder'))
        .output(output || config.get('public.js.outputFolder'));
};
