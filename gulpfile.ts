const $ = require('gulp-load-plugins')();

import { Gulpclass, Task, SequenceTask } from 'gulpclass/Decorators';
import * as gulp from 'gulp';
import * as ts from 'gulp-typescript';
import * as del from 'del';

@Gulpclass()
class Gulpfile {

    @SequenceTask()
    default() {
        return ['clean-dist', 'build', 'watch'];
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
            .on('error', function(err){
               console.error('ts_error');
               this.emit('end');
            })
            .pipe(gulp.dest('./dist'));
    }

    @Task('watch')
    watch() {
        return gulp.watch('./src/**/*', ['build']);
    }

    @Task('clean-dist')
    cleanDist(cb) {
        return del('./dist/**/*', cb);
    }

}
