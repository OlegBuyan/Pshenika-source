let project_folder=require("path").basename(__dirname);
let source_folder="#src";

let fs = require('fs');

let path={
    build:{
        html: project_folder+"/",
        css: project_folder+"/css/",
        js: project_folder+"/js/",
        img: project_folder+"/img/",
        fonts: project_folder+"/fonts",
    },
    src:{
        html: [source_folder+"/*.html", "!" + source_folder+"/_*.html"],
        css: source_folder+"/scss/style.scss",
        // css: source_folder+"/css/*.css",
        js: source_folder+"/js/*.js",
        img: source_folder+"/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: source_folder+"/fonts/*.ttf",
    },
    watch:{
        html: source_folder+"/**/*.html",
        css: source_folder+"/scss/**/*.scss",
        js: source_folder+"/js/**/*.js",
        img: source_folder+"/img/**/*.{jpg,png,svg,gif,ico,webp}",
    },
    clean: "./" + project_folder + "/" 
}
let { src, dest } = require ('gulp'),
    gulp = require('gulp'),
    browsersync = require ("browser-sync").create(),
    fileinclude = require("gulp-file-include"),
    del = require("del"),
    scss = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    gcmq = require("gulp-group-css-media-queries"),
    cleanCSS = require('gulp-clean-css'),
    rename = require("gulp-rename"),
    imagemin = require("gulp-imagemin"),
    uglify = require("gulp-uglify-es").default,
    ttf2woff = require("gulp-ttf2woff"),
    ttf2woff2 = require("gulp-ttf2woff2"),
    // concat = require("gulp-concat"),
    fonter = require('gulp-fonter');


function browserSync(params) {
    browsersync.init({
        server:{
            baseDir: "./" + project_folder + "/" 
        },
        port:3000,
        notify:false
    })
}
function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(
            scss ({
                outputStyle: "expanded"
            })
        )
        .pipe(
            autoprefixer({
                browsers: ['last 2 version', 'safari 5','ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
                overrideBrowserlist: ["last 5 version"],
                cascade: true
            })
        )
        .pipe (
            gcmq()
        )
        .pipe(dest(path.build.css))
        .pipe(cleanCSS())
        .pipe(
            rename({
                extname: ".min.css"
            })
            )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function js() {
    return src(path.src.js)
        // .pipe(concat("app.js"))
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(
            uglify()
        )
        .pipe(
            rename({
                extname: ".min.js"
            })
            )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}
function images() {
    return src(path.src.img)
    .pipe(
        imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            interlaced: true,
            optimizationLevel: 3
        })
    )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}
function fonts(params){
    src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts));
}
// gulp.task('sass', function() {
//     return gulp.src('scss/*.scss')
//         .pipe(sass({errLogToConsole: true}))
//         .pipe(postcss([autoprefixer()]))
//         .pipe(minifycss())
//         .pipe(gulp.dest(''))
//         .pipe(plumber({
//             errorHandler: onError
//         }))
//         .pipe(livereload(server));
// });
gulp.task('otf2ttf', function (){
    return src ([source_folder + '/fonts/*.otf'])
        .pipe(fonter({
            formats:['ttf']
        }))
        .pipe(dest(source_folder + '/fonts/'));
})
// function fontsStyle(params) {
//     let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
//     if (file_content == '') {
//         fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
//         return fs.readdir(path.build.fonts, function (err, items) {
//             if (items) {
//                 let c_fontname;
//                 for (var i = 0; i < items.length; i++) {
//                     let fontname = items[i].split('.');
//                     fontname = fontname[0];
//                     if (c_fontname != fontname) {
//                         fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + 
//                         fontname + '", "400", "normal");\r\n', cb);
//                     }
//                     c_fontname = fontname;
//                 }
//             }
//         })
//         }
//     }
    
    function cb() {

     }

function watchFiles(params) {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

function clean(params){
    return del(path.clean);
}
    let build = gulp.series(clean,gulp.parallel(js, css, html, images, fonts));
    let watch = gulp.parallel(build, watchFiles, browserSync);

    // exports.fontsStyle = fontsStyle;
    exports.images = images;
    exports.fonts = fonts;
    exports.js = js;
    exports.css = css;
    exports.html = html;
    exports.build = build;
    exports.watch = watch;
    exports.default = watch;