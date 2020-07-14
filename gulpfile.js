let preprocessor = 'less'; /*выбор препроцессора. если надо работать с сасс то просто заменяем less на sass */

const {src,dest,parallel,series,watch} = require('gulp');
const less = require('gulp-less');
const sass = require('gulp-sass');
const imagemin = require('gulp-imagemin')
const newer = require('gulp-newer')
const del = require('del')
// create-создаем новое подключение
const browserSync = require('browser-sync').create(); 
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const autopref = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');

function sync (){
    browserSync.init({
        server:{baseDir: 'app/'},
        notify:false,
        // если хотим без сети проект править 
        // online:false
        // если хотим на мобилке открыть к примеру, вбиваем адресс из консоли http/192.---.---.--- какой покажется при выполнении gulp sync
    })
}
// eval() - переведет переменную в функцию
function styles(){
    return src('app/'+preprocessor+'/main.'+preprocessor+'')
    .pipe(eval(preprocessor)())
    .pipe(concat('app.min.css'))
    .pipe(autopref({overrideBrowserslist:['last 10 versions'],grid:true}))
    .pipe(cleanCss(({level: { 1: {specialComments: 0 } }/*,format: 'beautify' */} )))
    .pipe(dest('app/css/'))
    .pipe(browserSync.stream())
}
function scripts(){
    return src([
        'node_modules/jquery/dist/jquery.min.js',
        'app/js/app.js'
    ])
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js/'))
    .pipe(browserSync.stream())
}
function images(){
    return src('app/img/src/**/*')
    .pipe(newer('app/img/dest/'))
    .pipe(imagemin())
    .pipe(dest('app/img/dest/'))
}
function cleanimg(){
    return del('app/img/dest/**/*')
}
function cleandist(){
    return del('dist/**/*')
}
function buildcopy(){
    return src([
        'app/css/**/*.min.css',
        'app/js/**/*.min.js',
        'app/img/dest/**/*',
        'app/**/*.html'
    ],
    {base:'app'}/*чтобы выгрузилось все по папкам а не просто файлы без структуры */)
    .pipe(dest('dist'))
}
function startWatch(){
    watch('app/'+preprocessor+'/**/*',styles);
    watch(['app/js/*.js','app/js/*.min.js'],scripts);
    watch('app/**/*.html').on('change',browserSync.reload);
    watch('app/img/src/**/*',images);
}
exports.sync = sync;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.cleanimg = cleanimg;
exports.cleandist = cleandist;
exports.build = series(cleandist,scripts,styles,images,buildcopy);
exports.default = parallel(scripts,styles,images,sync,startWatch);