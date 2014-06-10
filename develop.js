var http = require('http');

var _ = require('lodash');
var connect = require('connect');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpack = require('webpack');
var sendStatic = require('send');

var webpackConfig = require('./webpack.config.js');
webpackConfig.devtool = 'inline-source-map';
var webpackCompiler = webpack(webpackConfig);
var files = require('./files');

var app = connect();

app.use(webpackDevMiddleware(webpackCompiler, {
  publicPath: '/build/',
  stats: {
    colors: true
  }
}));

_.forEach(files.vendor, function(filePath, fileName) {
  app.use('/build/' + fileName, function(req, res) {
    sendStatic(req, filePath).pipe(res);
  });
});

app.use('/', function(req, res, next) {
  if (!(req.url === '/' || req.url.match(/^\/\?/))) {
    return next();
  }

  sendStatic(req, 'index.html').pipe(res);
});

app.use(function(req, res) {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('Not found');
});

app.use(connect.errorHandler());

var port = process.env.PORT || 3000;
http.createServer(app).listen(port);
console.log('Development server started on port', port);
