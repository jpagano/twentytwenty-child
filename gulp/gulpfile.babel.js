'use strict';

import info from './package';

import yargs from 'yargs';
import gulp from 'gulp';
import rimraf from 'rimraf';
import yaml from 'js-yaml';
import fs from 'fs';
import gulpif from 'gulp-if';
import sourcemaps from 'gulp-sourcemaps';
import browser from 'browser-sync';

import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssimport from 'postcss-import';
import cleanCss from 'gulp-clean-css';

import named from 'vinyl-named';
import webpackStream from 'webpack-stream';
import webpack2 from 'webpack';
import uglify from 'gulp-uglify';

import imagemin from 'gulp-imagemin';

import wpPot from 'gulp-wp-pot';

const PRODUCTION = !!(yargs.argv.production);

const {PROXY, PORT, PATHS} = loadConfig();

function loadConfig() {
	let ymlFile = fs.readFileSync('config.yml', 'utf8');
	return yaml.load(ymlFile);
}

const clean = done => {
	rimraf(PATHS.dist, done);
};

const copy = () => gulp.src(PATHS.assets)
	.pipe(gulp.dest(PATHS.dist + '/'));

const styles = () => {
	const postcssPlugins = [
		cssimport(),
		autoprefixer(),
	].filter(Boolean);

	const cleanCssConfig = {
		compatibility: 'ie9',
		// Strip comments
		level: {1: {specialComments: 0}}
	};

	return gulp.src([
		'src/scss/*.scss',
	])
		.pipe(sourcemaps.init())
		.pipe(sass({
			includePaths: PATHS.sass
		})
			.on('error', sass.logError))
		.pipe(postcss(postcssPlugins))
		.pipe(gulpif(PRODUCTION, cleanCss(cleanCssConfig)))
		.pipe(gulpif(!PRODUCTION, sourcemaps.write()))
		.pipe(gulp.dest(PATHS.dist + '/css'))
		.pipe(browser.reload({stream: true}));
};

let webpackConfig = {
	mode: PRODUCTION ? 'production' : 'development',
	module: {
		rules: [
			{
				test: /\.js$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ["@babel/preset-env"],
						compact: false
					}
				}
			}
		]
	},
	devtool: !PRODUCTION ? 'inline-source-map' : false,
	output: {
		filename: '[name].js'
	},
	// Use jQuery as an internal dependency of your bundle
	// plugins: [
	// 	new webpack2.ProvidePlugin({
	// 		'$': 'jQuery',
	// 		jquery: 'jQuery',
	// 		'window.jQuery': 'jQuery'
	// 	})
	// ],
	// Declare jQuery as an external dependency in webpack
	externals: {
		jquery: 'jQuery'
	}
};

const scripts = () => gulp.src(PATHS.entries)
	.pipe(named())
	.pipe(webpackStream(webpackConfig, webpack2))
	.pipe(gulpif(PRODUCTION, uglify()
		.on('error', e => {
			console.log(e);
		})
	))
	.pipe(gulp.dest(PATHS.dist + '/js'));

const images = () => gulp.src('src/img/**/*')
	.pipe(gulpif(PRODUCTION, imagemin([
		imagemin.mozjpeg({progressive: true})
	])))
	.pipe(gulp.dest(PATHS.dist + '/img'));

export const pot = () => gulp.src('../**/*.php')
	.pipe(wpPot({
		domain: "twentytwenty-child",
		package: info.name
	}))
	.pipe(gulp.dest(`../languages/${info.name}.pot`));

const server = done => {
	browser.init({
		proxy: PROXY,
		port: PORT,
		notify: false
	}, done);
};

const reload = done => {
	browser.reload();
	done();
};

const watch = () => {
	gulp.watch(PATHS.assets, copy);
	gulp.watch('src/scss/**/*.scss', styles);
	gulp.watch('src/js/**/*.js', gulp.series(scripts, reload));
	gulp.watch('src/img/**/*', gulp.series(images, reload));
	gulp.watch('../**/*.php', reload);
};

export const buildStyles = styles;
export const build = gulp.series(clean, gulp.parallel(copy, styles, scripts, images), pot);
export const dev = gulp.series(build, server, watch);
export default dev;
