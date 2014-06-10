var React = window.React;

var App = require('./app');
var api = require('./api');

var modules = [
  require('./modules/dashboard'),
  require('./modules/items')
];

var initialState = window.initialState || {};

function init(props, cb) {
  props.api = api;

  api.loadSession(function(err, authToken) {
    props.authToken = authToken;
    cb(err, props);
  });
}

init({
  modules: modules,
  defaultRoute: '/dashboard',
  initialState: initialState
}, function(err, props) {
  window.app = React.renderComponent(
    App(props), document.getElementById('app')
  );
});
