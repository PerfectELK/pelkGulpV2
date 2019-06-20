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
const cheerio = require('gulp-cheerio');
const svgmin = require('gulp-svgmin');
const replace = require('gulp-replace');
const file__include = require('gulp-file-include');
const babel = require('gulp-babel');
const email__builder = require('gulp-email-builder');

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
        email: `./projects/${argv.root}/src/email/`
    },
    build:{
        root:`./projects/${argv.root}/build/`,
        css:`./projects/${argv.root}/build/css/`,
        js:`./projects/${argv.root}/build/js/`,
        img:`./projects/${argv.root}/build/img/`,
        temp:`./projects/${argv.root}/build/img/temp/`,
        svg:`./projects/${argv.root}/build/img/svg/`,
        html:`./projects/${argv.root}/build/`,
        email:`./projects/${argv.root}/build/email/`,
    }
};

browser__sync.init({
    server:`${__cfg.build.html}`,
    port:(argv.port) ? argv.root : 3000,
});


function inlineEmails(done){
    gulp.src(`${__cfg.src.email}**/*.html`)
        .pipe(email__builder().build())
        .pipe(gulp.dest(`${__cfg.build.email}`));
    browser__sync.reload();
    done();
}


function svgSprite(done){

    let config = {
        mode: {
            symbol: {
                render: {
                    scss: {
                        dest:'./../../scss/_sprite.scss',
                        template: `${__cfg.src.scss}sprite_template.scss`
                    }
                }
            }
        }
    };
    gulp.src(`${__cfg.src.svg}**/*.svg`)
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(sprite(config))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[style]').removeAttr('style');
                $('[x]').removeAttr('x');
                $('[y]').removeAttr('y');
            },
            parserOptions: { xmlMode: true }
        }))
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

    gulp.src(`${__cfg.src.site}*.html`)
        .pipe(file__include())
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
        // .pipe(babel({
        //     presets: ['@babel/env']
        // }))
        .pipe(rename({suffix:'.min'}))
        //.pipe(uglify())
        .pipe(gulp.dest(`${__cfg.build.js}`));
    browser__sync.reload();
    done();

}

function preloader(done){

    gulp.src(`${__cfg.src.src}preloaders/**/*.js`)
        .pipe(concat('preloader.js'))
        .pipe(rename({suffix:'.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(`${__cfg.build.js}`));

    gulp.src(`${__cfg.src.src}preloaders/**/*.scss`)
        .pipe(gulp__sass({
            errorLogToConsole:true,
            outputStyle:'compressed',
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 version'],
            cascade: false,
        }))
        .pipe(concat('preloader.css'))
        .pipe(rename({suffix:'.min'}))
        .pipe(gulp.dest(`${__cfg.build.css}`));
    browser__sync.reload();
    done();

}

function watching(done){

    gulp.watch(`${__cfg.src.root}**/*.scss`,css);
    gulp.watch(`${__cfg.src.site}**/*.js`,js);
    gulp.watch(`${__cfg.src.site}**/*.html`,html);
    gulp.watch(`${__cfg.src.src}preloaders/**/*.js`,preloader);
    gulp.watch(`${__cfg.src.email}**/*.html`,inlineEmails);

    done()
}


gulp.task('default',gulp.series(webpGen,svgSprite,html,css,js,preloader,watching,inlineEmails));