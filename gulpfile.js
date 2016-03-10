var gulp    = require('gulp');
var watch = require('gulp-watch');
var rename = require('gulp-rename');
var uglify  = require('gulp-uglify');
var jshint  = require('gulp-jshint');
var clean  = require('gulp-clean');
var notify = require("gulp-notify");
var batch = require("gulp-batch");

gulp.task('default', ['clean'], function() {
    return gulp.src('src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(uglify({
            // mangle: false
        }))
        .pipe(rename('veridu-angularjs-sdk.min.js'))
        .pipe(gulp.dest('./dist/'))
        .pipe(notify("Javascript minified! Thanks =]"));
});

gulp.task('clean', function() {
    return gulp.src('./dist/*.js')
        .pipe(clean({force: true}));
});

gulp.task('watch', function () {
    watch('./src/*.js', batch(function (events, done) {
        gulp.start('default', done);
    }));
});
