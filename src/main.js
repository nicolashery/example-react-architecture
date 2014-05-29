var React = window.React;

var App = require('./app.js');

App.init(function(err, props) {
  window.app = React.renderComponent(
    App(props), document.getElementById('app')
  );
});
