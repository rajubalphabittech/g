var gulp = require('gulp');
var browserify = require('gulp-browserify');
var reactify = require('reactify');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var rm = require('gulp-rimraf');

var deployDir = '../app/assets/javascripts/';

gulp.task('clean', function() {
    return gulp.src('dist/*').pipe(rm());
});

// TODO: add basic jshint check
gulp.task('js', ['clean'], function() {
    return gulp.src('./src/mount.jsx', { read: false })
        .pipe(browserify({
            transform: ['reactify'],
            extensions: ['.jsx']
        }))
        .pipe(rename('bundle.js'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('compress', ['js'], function() {
    return gulp.src('./dist/bundle.js')
        .pipe(uglify())
        .pipe(rename('bundle.min.js'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('deploy-dev', ['js'], function() {
    // would be needed when jquery and bootstrap are no longer included in each page
//    return gulp.src(['node_modules/jquery/dist/jquery.js', './node_modules/bootstrap/dist/js/bootstrap.js', './dist/bundle.js'])
    return gulp.src(['./dist/bundle.js'])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./dist/'))
        .pipe(gulp.dest(deployDir));
});

// TODO: Add revving (how do we update file name in play controlled app???)
gulp.task('deploy-release', ['compress'], function() {
    // would be needed when jquery and bootstrap are no longer included in each page
//    return gulp.src(['node_modules/jquery/dist/jquery.min.js', './node_modules/bootstrap/dist/js/bootstrap.min.js', './dist/bundle.min.js'])
    return gulp.src(['./dist/bundle.min.js'])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./dist/'))
        .pipe(gulp.dest(deployDir));
});

gulp.task('watch', ['deploy-dev'], function() {
    gulp.watch('./src/**/*.*', ['deploy-dev']);
});

gulp.task('default', ['watch']);