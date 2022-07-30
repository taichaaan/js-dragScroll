/**
 * gulpfile.js
 * @creation: 20018.??.??
 * @update  : 2020.10.24
 * @version : 5.0.0
 *
 * @license Copyright (C) 2020 Taichi Matsutaka
 */
///////////////////////////////////////////////////////////////
// variable
///////////////////////////////////////////////////////////////

/* Project path.
------------------ */
const devRoot  = '../dev/'; // Path to dev webroot.
const distRoot = '../dist/'; // Path to project webroot.


/* gulp
------------------ */
// Gulp.
const gulp = require('gulp');

// common
const sourcemaps = require('gulp-sourcemaps');
const plumber    = require('gulp-plumber'); // Do not stop watch even if an error occurs.
const notify     = require('gulp-notify'); // Display notification on desktop.
const rename     = require('gulp-rename'); // File rename.
const concat     = require('gulp-concat'); // Combine multiple file.
const header     = require('gulp-header'); // header comment


// Sass plugin.
const sass         = require('gulp-sass'); // Sass compile.
const autoprefixer = require('gulp-autoprefixer'); // Autoprefixer.
const bulkSass     = require('gulp-sass-bulk-import'); // Import at a stretch.
const gcmq         = require('gulp-group-css-media-queries');
const cleanCSS     = require("gulp-clean-css");

// Minify javaScript plugin.
const uglify = require('gulp-uglify-es').default; // Compress javascript file.




///////////////////////////////////////////////////////////////
// sass
///////////////////////////////////////////////////////////////
const sassTask = () => {
	return gulp
		.src( devRoot + '**/*.scss')
		// .pipe( sourcemaps.init() )
		.pipe( plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }) )
		.pipe( bulkSass() )
		.pipe( sass({
			// outputStyle: 'compressed',
			// outputStyle: 'expanded',
			// indentWidth: 1,
			// indentType : 'tab',
		}) )
		// .pipe( header('@charset "UTF-8";\n\n') )
		.pipe( cleanCSS() )
		.pipe( autoprefixer({
			grid: true,
			cascade: false,
			remove: true,
			overrideBrowserslist: [
				'> 1% in JP',
				'last 1 version',
				'Firefox ESR'
			]
		}) )
		.pipe( rename({suffix: '.min'}) )
		// .pipe( sourcemaps.write('./') )
		.pipe( gulp.dest( distRoot ) );
}
exports.sass = sassTask;




///////////////////////////////////////////////////////////////
// javascriptMin
///////////////////////////////////////////////////////////////
/* ----- basic ----- */
const jsBasicTask = () => {
	return gulp
		.src([
			devRoot + '**.js',
			'!' + devRoot + '**/_*.js',
		])
		.pipe( plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }) )
		.pipe( uglify({ output: {comments: 'some'} }) )
		.pipe( rename({extname: '.min.js'}) )
		.pipe( gulp.dest( distRoot ));
}

exports.js = gulp.series(
	gulp.parallel( jsBasicTask )
);




///////////////////////////////////////////////////////////////
// watch
///////////////////////////////////////////////////////////////
const watchTask = () => {
	console.log(
		''
		+ "\n" + '-- Now Watching ------------------------------------------------'
		+ "\n"
		+ "\n" + '   @name    : gulp watch'
		+ "\n" + '   @task    : sass,js'
		+ "\n" + '   @version : 5.0.0'
		+ "\n" + '   @gulp    : 4.0.2'
		+ "\n" + '   @node    : 14.14.0'
		+ "\n"
		+ "\n" + '   Copyright (C) 2020 Taichi Matsutaka'
		+ "\n"
		+ "\n" + '------------------------------------------------- Now Watching --'
		+ "\n"
	);

	gulp.watch( devRoot + '**/*.scss' , gulp.parallel( sassTask ) );
	gulp.watch( devRoot + '**/*.js' , gulp.parallel( jsBasicTask ) );
}
exports.watch = watchTask;



///////////////////////////////////////////////////////////////
// default
///////////////////////////////////////////////////////////////
exports.default = gulp.series(
	gulp.series(
		sassTask,
		jsBasicTask,
		watchTask,
	)
);





