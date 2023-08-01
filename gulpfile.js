"use strict"

const { src, dest } = require("gulp")
const gulp = require("gulp")
const ejs = require("gulp-ejs")
const autoprefixer = require("gulp-autoprefixer")
const cssbeautify = require("gulp-cssbeautify")
const removeComments = require("gulp-strip-css-comments")
const rename = require("gulp-rename")
const sass = require("gulp-sass")(require("sass"))
const cssnano = require("gulp-cssnano")
const uglify = require("gulp-uglify")
const plumber = require("gulp-plumber")
const panini = require("panini")
const imagemin = require("gulp-imagemin")
const rigger = require("gulp-rigger")
const notify = require("gulp-notify")
const del = require("del")
const browserSync = require("browser-sync").create()
const data = require("./src/data/index.json")

/* Paths */
const srcPath = "src/"
const distPath = "dist/"

const path = {
    build: {
        html: distPath,
        ejs: distPath,
        css: distPath + "assets/css/",
        js: distPath + "assets/js/",
        images: distPath + "assets/images/",
        fonts: distPath + "assets/fonts/"
    },
    src: {
        html: srcPath + "*.html",
        ejs: srcPath + "*.ejs",
        css: srcPath + "assets/scss/*.scss",
        js: srcPath + "assets/js/*.js",
        images: srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    watch: {
        html: srcPath + "**/*.html",
        ejs: srcPath + "**/*.ejs",
        css: srcPath + "assets/scss/**/*.scss",
        js: srcPath + "assets/js/**/*.js",
        images: srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    clean: "./" + distPath
}

function serve() {
    browserSync.init({
        server: {
            baseDir: "./" + distPath
        }
    })
}

function clean() {
    return del(path.clean)
}

function compileEjs() {
    return src(path.src.ejs, { base: srcPath })
        .pipe(plumber())
        .pipe(ejs(data))
        .pipe(rename({ extname: ".html" }))
        .pipe(dest(path.build.ejs))
        .pipe(browserSync.reload(({ stream: true })))
}

function html() {
    panini.refresh()
    return src(path.src.html, { base: srcPath })
        .pipe(plumber())
        .pipe(panini({
            root: srcPath,
            layouts: srcPath + "templates/layouts/",
            partials: srcPath + "templates/partials"
        }))
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({ stream: true }))
}

function css() {
    return src(path.src.css, { base: srcPath + "assets/scss" })
        .pipe(plumber({
            errorHandler: function(error) {
                notify.onError({
                    title: "SCSS Error",
                    message: "Error: <%= error.message %>"
                })(error)
                this.emit('end')
            }
        }))
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(cssbeautify())
        .pipe(dest(path.build.css))
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(removeComments())
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({ stream: true }))
}

function js() {
    return src(path.src.js, { base: srcPath + "assets/js" })
        .pipe(plumber({
            errorHandler: function(error) {
                notify.onError({
                    title: "JavaScript Error",
                    message: "Error: <%= error.message %>"
                })(error)
                this.emit('end')
            }
        }))
        .pipe(rigger())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({ stream: true }))
}

function images() {
    return src(path.src.images, { base: srcPath + "assets/images" })
        .pipe(imagemin())
        .pipe(dest(path.build.images))
        .pipe(browserSync.reload({ stream: true }))
}

function fonts() {
    return src(path.src.fonts, { base: srcPath + "assets/fonts" })
        .pipe(dest(path.build.fonts))
        .pipe(browserSync.reload({ stream: true }))
}

function watchFiles() {
    gulp.watch([path.watch.ejs], compileEjs)
    // gulp.watch([path.watch.html], html)
    // gulp.watch([path.watch.css], css)
    // gulp.watch([path.watch.js], js)
    // gulp.watch([path.watch.images], images)
    // gulp.watch([path.watch.fonts], fonts)
}

const build = gulp.series(clean, compileEjs)
const watch = gulp.parallel(build, watchFiles, serve)

exports.default = watch
