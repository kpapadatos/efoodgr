const $ = require('gulp-load-plugins')();

import { Gulpclass, Task, SequenceTask } from 'gulpclass/Decorators';
import * as gulp from 'gulp';
import * as ts from 'gulp-typescript';

@Gulpclass()
class Gulpfile {

    @SequenceTask()
    default() {
        return ['build', 'watch'];
    }

    @Task('build')
    build() {
        return gulp.src([
           './src/**/*',
           './typings/**/*.d.ts'
        ])
            .pipe($.if(/\.ts$/, ts({
                target: 'es6',
                noExternalResolve: false,
                module: 'commonjs',
                moduleResolution: 'node',
                experimentalDecorators: true
            })))
            .pipe(gulp.dest('./dist'));
    }

    @Task('watch')
    watch() {
        return gulp.watch('./src/**/*', ['build']);
    }

}
