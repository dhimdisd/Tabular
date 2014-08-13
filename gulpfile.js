var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var concat = require('gulp-concat-sourcemap');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var react = require('gulp-react');

var jshintOptions = {
  laxbreak: true,
  laxcomma: true
};

gulp.task('concat-jquery', function() {
  gulp
    .src([
      './src/js/vendor/jquery-2.1.1.min.js',
      './src/js/lib/jquery.isOnScreen.js',
      './src/js/lib/jquery.goTo.js'
    ])
    .pipe(concat('jquery.js'))
    .pipe(gulp.dest('./src/js/lib/build'));
});

gulp.task('uglify-background', function() {
  gulp
    .src([ './src/js/background.js' ])
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('./build/js'));
});

gulp.task('lint', function() {
  gulp
    .src([ './src/js/lib/*.js', './src/js/*.js' ])
    .pipe(react())
    .pipe(jshint(jshintOptions))
    .pipe(jshint.reporter(stylish));
});

gulp.task('default', ['lint', 'concat-jquery', 'uglify-background'], function() {
  function rebundle(bundler) {
    return bundler
      .bundle()
      .pipe(source('popup.js'))
      .pipe(streamify(uglify()))
      .pipe(gulp.dest('./build/js'));
  }

  var bundler = browserify('./src/js/popup.js', {
    cache: {},
    packageCache: {},
    fullPaths: true
  });
  bundler = watchify(bundler);
  bundler.transform(reactify);

  bundler.on('update', function() {
    gulp
      .src([ './src/js/lib/*.js', './src/js/*.js' ])
      .pipe(react())
      .pipe(jshint(jshintOptions))
      .pipe(jshint.reporter(stylish));

    rebundle(bundler);
  });

  bundler.on('log', function(msg) {
    gutil.log('Rebundle:', msg);
  });

  return rebundle(bundler);
});
