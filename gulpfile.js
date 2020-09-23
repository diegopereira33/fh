//https://css-tricks.com/gulp-for-beginners/

const gulp = require('gulp');
const sass = require('gulp-sass');
const pump = require('pump');
const uglify = require('gulp-uglify');
const runSequence = require('run-sequence');
const del = require('del');
const jshint = require('gulp-jshint');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const fs = require('fs');
const notifier = require('node-notifier');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync');

const pathInCss = ['src/sass/**/*.scss', 'src/assets/**/*.scss'];
const pathOutCss = 'dist/css';
const pathInJs = 'src/**/*.js';
const pathOutJs = 'dist/';
const pathInImgs = 'src/images/**/*.';
const pathOutImgs = 'dist/img';

gulp.task('sass', function(){
	return pump([
		gulp.src(pathInCss),
		sourcemaps.init(),
		// sass({outputStyle: 'compressed'}).on('error', function(error){
		sass().on('error', function(error){
			notifier.notify({
				title: 'ERROR - SASS',
				message: error.message
			});
		}),
		autoprefixer('last 10 versions'),
		sourcemaps.write(),
		gulp.dest(pathOutCss)
		])
});

gulp.task('compressJs', function(cb){
	var teste = pump([
		gulp.src(pathInJs),
		uglify().on('error', function(error){
			notifier.notify({
				title: 'ERROR - JS',
				message: error.message
			});
		}),
		gulp.dest(pathOutJs)
		], cb);
});

gulp.task('moveJs', function(cb){
	var teste = pump([
		gulp.src(pathInJs),
		gulp.dest(pathOutJs)
		], cb);
});

gulp.task('lint', function() {
	var aki =  pump([
		gulp.src(pathInJs),
		jshint( { esversion : 6 } ),
		jshint.reporter('default', { verbose: true })
		]);
});

gulp.task('clean', function() {
	return del.sync(['dist']);
});

gulp.task('images', function(){
	return pump([
		gulp.src(pathInImgs + '+(png|jpg|gif|svg)'),
		imagemin(),
		gulp.dest(pathOutImgs)
		]);
});

gulp.task('watchCSS', function(callback){
	console.log('Starting watchCSS.....');
	runSequence('sass', callback);
});

gulp.task('watchJS', function(callback){
	console.log('Starting watchJS.....');
	runSequence('lint', 'moveJs', callback);
});

gulp.task('copyAssets', function(){
	pump([
		gulp.src('assets/**/*'),
		gulp.dest('dist/assets')
		]);
});

gulp.task('copyFonts', function(){
	pump([
		gulp.src(['src/fonts/**/*']),
		gulp.dest('dist/fonts')
		]);
});

gulp.task('build:local',  function(callback){
	runSequence('clean', 'images', 'copyAssets', 'copyFonts', 'lint', 'moveJs', 'sass', callback);
});

gulp.task('build:production',  function(callback){
	runSequence('clean', 'images', 'copyAssets', 'copyFonts', 'lint', 'compressJs', 'sass', callback);
});

gulp.task('watch', function(){
	gulp.watch(pathInCss, ['watchCSS']);
	gulp.watch(pathInJs, ['watchJS']);
});

gulp.task('liveReload', function(){
	browserSync.init({
		server: {
			baseDir: './'
		}
		// proxy: {
		// 	target: "https://marisa.local:9002/",
		// 	proxyRes: [
		// 	function(proxyRes, req, res) {
		// 		console.log(proxyRes.headers);
		// 	}
		// 	]
		// }
	});
	gulp.watch(['src/**/*', 'index.html']).on('change', browserSync.reload);
});