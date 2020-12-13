const {src, dest, task, series, watch} = require("gulp");
const rm = require( 'gulp-rm' );
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const gcmq = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify-es').default;
const pug = require('gulp-pug');
const svgo = require('gulp-svgo');
const svgSprite = require('gulp-svg-sprite');

sass.compiler = require('node-sass');

task('clean', () => {
  return src( 'dist/**/*', { read: false }).pipe( rm() )
});

task('pug', () => {
	return src('src/*.pug')
		.pipe(pug({pretty:	true}))
		.pipe(dest('dist'))
		.pipe(reload({stream: true}));
});

task('copy:img', () => {
    return src('src/img/**/*.{jpg,jpeg,png,gif,svg}')
        .pipe(dest("dist/img"))
        .pipe(reload({ stream: true }));
});

// task("copy:html", () => {
// 	return src("src/*.html")
// 		.pipe(dest('dist'))
// 		.pipe(reload({stream: true}));
// });

task('copy:video', () => {
    return src('src/video/*')
        .pipe(dest(`dist/video`))
        .pipe(reload({ stream: true }));
});

const styles = [
	"node_modules/normalize.css/normalize.css",
	"src/scss/main.scss"
]

task("styles", () => {
	return src(styles)
		.pipe(concat('main.scss'))
		.pipe(sassGlob())
		.pipe(sass().on('error', sass.logError))
		.pipe(gcmq())
		.pipe(
			autoprefixer({
				// browsers: ['last 2 versions'],
				cascade: false
			})
		)
		// .pipe(cleanCSS())
		.pipe(dest('dist'))
		.pipe(reload({stream: true}));
});

const libs = [
	"node_modules/jquery/dist/jquery.js",
	"src/scripts/*.js",
    "node_modules/rellax/rellax.js",
]

task("scripts", () => {
	return src(libs)
		.pipe(sourcemaps.init())
		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write())
		.pipe(dest('dist'))
		.pipe(reload({stream: true}))
});

task('icons', () => {
    return src('src/img/icons/*.svg')
        .pipe(svgo({
            plugins: [
                {
                    removeAttrs: {
                        attrs: '(fill|stroke|style)'
                    }
                }
            ]
        }))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: '../sprite.svg'
                }
            }
        }))
        .pipe(dest('dist/img/icons'));
});

task('server', () => {
  browserSync.init({
    server: {
      baseDir: "./dist"
    },
    open: false
  });
});

watch("./src/scss/**/*.scss", series('styles'));
// watch("./src/*.html", series('copy:html'));
watch("./src/img/*.{jpg,jpeg,png,gif,svg}", series('copy:img'));
watch("./src/*.pug", series('pug'));
watch("./src/scripts/*.js", series('scripts'));
watch('./src/img/icons/*.svg', series('icons'));

task("default", series("clean", "pug", "copy:video", "styles", "copy:img", "scripts", "icons", "server"));