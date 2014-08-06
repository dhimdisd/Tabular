var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var concat = require('gulp-concat-sourcemap');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');

gulp.task('jquery', function() {
  gulp
    .src([
      './src/js/vendor/jquery-2.1.1.min.js',
      './src/js/lib/jquery.isOnScreen.js',
      './src/js/lib/jquery.goTo.js'
    ])
    .pipe(concat('jquery.js'))
    .pipe(gulp.dest('./src/js/lib/build'));
});

gulp.task('background', function() {
  gulp
    .src([ './src/js/background.js' ])
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('./build/js'));
});

gulp.task('default', ['jquery', 'background'], function() {
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
    rebundle(bundler);
  });

  bundler.on('log', function(msg) {
    gutil.log('Rebundle:', msg);
  });

  return rebundle(bundler);
});
