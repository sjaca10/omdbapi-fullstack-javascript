var gulp = require('gulp');
var connect = require('gulp-connect');
var watch = require('gulp-watch');
var less = require('gulp-less')

gulp.task('webserver', function() {
    connect.server({
        root: 'src',
        livereload: true,
    });
});

gulp.task('default', ['webserver']);
