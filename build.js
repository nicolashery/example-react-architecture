/* global rm, mkdir, cp, exec */
require('shelljs/global');
var _ = require('lodash');

var files = require('./files');

console.log('rm -rf build');
rm('-rf', 'build');
console.log('mkdir -p build');
mkdir('-p', 'build');

_.forEach(files.vendor, function(filePath, fileName) {
  console.log('cp ' + filePath + ' build/' + fileName);
  cp(filePath, 'build/' + fileName);
});

console.log('webpack --progress --colors');
exec('webpack --progress --colors');
