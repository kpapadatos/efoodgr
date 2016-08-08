/// <reference path="../node/node.d.ts"/>

declare module 'gulp-jsvalidate' {
  interface GulpJsvalidate {
    (...any): NodeJS.ReadWriteStream;
  }
  var gulpJsvalidate: GulpJsvalidate;
  export = gulpJsvalidate;
}
