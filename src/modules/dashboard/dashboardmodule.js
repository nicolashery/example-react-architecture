/** @jsx React.DOM */
var React = window.React;

var bindToApp = function(app) {
return {
  initialAppState: function() { return {}; },

  derivedAppState: function() { return {}; },

  routes: function(actions) {
    return [
      '/dashboard'
    ];
  },

  onRouteChange: function(route) {
    var path = route.path;

    if (path === '/dashboard') {
      return app.actions.showDashboard(route);
    }
  },

  actions: function() {
    return {
      showDashboard: function(route) {
        app.setState({
          route: route,
          itemsResource: {status: 'pending'}
        });

        app.actions.getItems({});
      }
    };
  },

  renderTitle: function() {
    var path = app.state.route.path;

    if (path === '/dashboard') {
      return 'Dashboard';
    }
  },

  renderNavLinks: function() {
    var path = app.state.route.path;

    if (!app.derivedState.isAuthenticated()) {
      return null;
    }

    if (path === '/dashboard') {
      return [<span>{'Dashboard'}</span>];
    }

    return [<a href={'#/dashboard'}>{'Dashboard'}</a>];
  },

  renderContent: function() {
    var path = app.state.route.path;

    if (path === '/dashboard') {
      return this.renderDashboard();
    }
  },

  renderDashboard: function() {
    var resource = app.state.itemsResource || {};

    if (resource.status === 'pending') {
      return <p>{'Loading summary...'}</p>;
    }

    if (resource.status === 'error') {
      return <p>{'Error loading summary'}</p>;
    }

    var items = resource.data;

    if (!(items && items.length)) {
      return <p>{'No items yet'}</p>;
    }

    var text = items.length + ' items';
    if (items.length === 1) {
      text = '1 item';
    }

    return <p><a href={'#/items'}>{text}</a></p>;
  }
};
};

module.exports = {
  name: 'dashboard',
  bindToApp: bindToApp
};
