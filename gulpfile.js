const gulp = require('gulp');
// const babel = require('gulp-babel');
//const gulpif = require('gulp-if');
// const sass = require('gulp-sass')(require('sass'));
// const ts = require('gulp-typescript');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const cssimport = require('gulp-cssimport')
const fileinclude = require('gulp-file-include');
const fonter = require('gulp-fonter-unx');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const notify = require("gulp-notify");
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const size = require('gulp-size');
const sourcemaps = require('gulp-sourcemaps');
const ttf2woff2 = require('gulp-ttf2woff2');
const uglify = require('gulp-uglify');
const webp = require('gulp-webp');
const webpCSS = require('gulp-webp-css');
const webpHTML = require('gulp-webp-html');
const del = require('del');



const paths = {
  html: {
    src: 'src/*.html',
    dest: 'dist'
  },
  styles: {
    src: ['src/styles/**/*.css'],
    dest: 'dist/css/'
  },
  scripts: {
    src: ['src/scripts/**/*.js'],
    dest: 'dist/js/'
  },
  images: {
    src: 'src/img/**',
    dest: 'dist/img/'
  },
  fonts: {
    src: 'src/fonts/*',
    dest: 'dist/fonts/'
  }
}

function clean() {
  return del(['dist/*', '!dist/img'])
}

function html() {
  return gulp.src(paths.html.src)
    .pipe(plumber({
      errorHandler: notify.onError(function (err) {
        return {
          title: '❌ HTML Error',
          message: err.message
        }
      })
    }))
    .pipe(size({
      showFiles: true
    }))
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(webpHTML())
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream());
}

function styles() {
  return gulp.src(paths.styles.src)
    .pipe(plumber({
      errorHandler: notify.onError({
        title: '❌ CSS Error'
      })
    }))
    .pipe(sourcemaps.init())
    // .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(webpCSS())
    .pipe(cleanCSS(
      {
        level: 2
      }
    ))
    .pipe(cssimport())
    .pipe(rename({
      basename: 'main',
      suffix: '.min'
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

function img() {
  return gulp.src(paths.images.src)
    .pipe(plumber({
      errorHandler: notify.onError({
        title: '❌ Image Error'
      })
    }))
    .pipe(newer(paths.images.dest))
    .pipe(size({
      showFiles: true,
      title: 'До сжатия: '
    }))
    .pipe(webp())
    .pipe(gulp.dest(paths.images.dest))
    .pipe(gulp.src(paths.images.src))
    .pipe(newer(paths.images.dest))
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(size({
      showFiles: true,
      title: 'После сжатия: '
    }))
    .pipe(gulp.dest(paths.images.dest))
}

function font() {
  return gulp.src(paths.images.src)
    .pipe(plumber({
      errorHandler: notify.onError({
        title: '❌ Font conversion Error'
      })
    }))
    .pipe(fonter({
      formats: ['woff', 'ttf', 'eot']
    }))
    .pipe(gulp.dest(paths.images.dest))
    .pipe(ttf2woff2())
    .pipe(gulp.dest(paths.images.dest))
}

function scripts() {
  return gulp.src(paths.scripts.src, {
    sourcemaps: true
  })
    .pipe(plumber({
      errorHandler: notify.onError({
        title: '❌ JS Error'
      })
    }))
    .pipe(sourcemaps.init())
    // .pipe(ts({
    //   noImplicitAny: true,
    //   outFile: 'main.min.js'
    // }))
    // .pipe(babel({
    //   presets: ['@babel/env']
    // }))
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

function watch() {
  browserSync.init({
    server: {
      baseDir: "./dist/"
    }
  });
  gulp.watch(paths.html.src).on('change', browserSync.reload);
  gulp.watch(paths.html.src, html).on('all', browserSync.reload);
  gulp.watch(paths.styles.src, styles).on('all', browserSync.reload);
  gulp.watch(paths.scripts.src, scripts).on('all', browserSync.reload);
  gulp.watch(paths.images.src, img).on('all', browserSync.reload);
  gulp.watch(paths.fonts.src, font).on('all', browserSync.reload);
}

const build = gulp.series(
  clean,
  html,
  gulp.parallel(
    styles,
    scripts,
    img, font),
  watch
);

exports.clean = clean;
exports.img = img;
exports.font = font;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;
exports.build = build;
exports.html = html;
exports.default = build;