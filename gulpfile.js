'use strict';

const gulp = require('gulp');
const argv = require('yargs').argv;
const gulp__sass = require('gulp-sass');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const browser__sync = require('browser-sync');
const sprite = require('gulp-svg-sprite');
const webp = require('gulp-webp');
const rigger = require('gulp-rigger');

const __cfg = {
    src: {
        root:`./projects/${argv.root}/`,
        src:`./projects/${argv.root}/src/`,
        js:`./projects/${argv.root}/src/js/`,
        scss:`./projects/${argv.root}/src/scss/`,
        img:`./projects/${argv.root}/src/img/`,
        site:`./projects/${argv.root}/src/site/`,
        svg:`./projects/${argv.root}/src/img/svg/`,
        temp:`./projects/${argv.root}/src/img/temp/`,
    },
    build:{
        root:`./projects/${argv.root}/build/`,
        css:`./projects/${argv.root}/build/css/`,
        js:`./projects/${argv.root}/build/js/`,
        img:`./projects/${argv.root}/build/img/`,
        temp:`./projects/${argv.root}/build/img/temp/`,
        svg:`./projects/${argv.root}/build/img/svg/`,
        html:`./projects/${argv.root}/build/html/`,
    }
};

browser__sync.init({
    server:`${__cfg.build.html}`,
    port:(argv.port) ? argv.root : 3000,
});


function svgSprite(done){

    let config = {
        mode: {
            css: {
                render: {
                    css: false
                }
            }
        }
    };
    gulp.src(`${__cfg.src.svg}**/*.svg`)
        .pipe(sprite(config))
        .pipe(rename('sprite.svg'))
        .pipe(gulp.dest(`${__cfg.build.svg}`));
    browser__sync.reload();
    done()

}


function webpGen(done){

    gulp.src([`${__cfg.src.img}**/*.jpg`,`${__cfg.src.img}**/*.png`])
        .pipe(webp())
        .pipe(rename({dirname: ''}))
        .pipe(gulp.dest(`${__cfg.build.temp}`));
    browser__sync.reload();
    done();

}


function html(done){
    console.log(`${__cfg.src.site}`);
    gulp.src(`${__cfg.src.site}*.html`)
        .pipe(rigger())
        .pipe(gulp.dest(`${__cfg.build.html}`));
    browser__sync.reload();
    done()
}


function css(done){

    gulp.src(`${__cfg.src.root}**/*.scss`)
        .pipe(gulp__sass({
        errorLogToConsole:true,
        outputStyle:'compressed',
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 version'],
            cascade: false,
        }))
        .pipe(concat('style.css'))
        .pipe(rename({suffix:'.min'}))
        .pipe(gulp.dest(`${__cfg.build.css}`));
    browser__sync.reload();
    done();

}

function js(done){

    gulp.src([`${__cfg.src.js}**/*.js`,`${__cfg.src.site}**/*.js`])
        .pipe(concat('bundle.js'))
        .pipe(rename({suffix:'.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(`${__cfg.build.js}`));
    browser__sync.reload();
    done();

}

function watching(done){

    gulp.watch(`${__cfg.src.root}**/*.scss`,css);
    gulp.watch(`${__cfg.src.site}**/*.js`,js);
    gulp.watch(`${__cfg.src.site}**/*.html`,html);

    done()
}


gulp.task('default',gulp.series(webpGen,svgSprite,html,css,js,watching));