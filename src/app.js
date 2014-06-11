/** @jsx React.DOM */

var React = window.React;
var _ = window._;
var hljs = window.hljs;

var createRouter = require('./router');
var createActions = require('./actions');
var utils = require('./utils');
var AppModules = require('./appmodules');

// Shallow difference of two objects
// Returns all attributes and their values in `destination`
// that have different values from `source`
function objectDifference(destination, source) {
  var result = {};

  _.forEach(source, function(sourceValue, key) {
    var destinactionValue = destination[key];
    if (!_.isEqual(sourceValue, destinactionValue)) {
      result[key] = destinactionValue;
    }
  });

  return result;
}

var App = React.createClass({
  propTypes: {
    modules: React.PropTypes.array,
    defaultRoute: React.PropTypes.string,
    initialState: React.PropTypes.object,
    api: React.PropTypes.object,
    authToken: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      modules: [],
      initialState: {},
      authToken: null
    };
  },

  getInitialState: function() {
    return {
      authToken: this.props.authToken,
      route: {},
      isAuthenticating: false,
      itemsResource: null
    };
  },

  getDerivedState: function() {
    var self = this;

    return {
      isAuthenticated: function() {
        return Boolean(self.state.authToken);
      },

      isLoggingIn: function() {
        return !Boolean(self.state.authToken) && self.state.isAuthenticating;
      },

      isLoggingOut: function() {
        return Boolean(self.state.authToken) && self.state.isAuthenticating;
      }
    };
  },

  componentWillMount: function() {
    this.modules = this.setUpModules();
    this.defaultRoute = this.props.defaultRoute;
    this.setState(AppModules.initialState(this.modules));
    this.derivedState = this.setUpDerivedState();
    this.api = this.props.api;
    this.utils = utils;
    this.actions = this.setUpActions();
    this.router = this.setUpRouter();
    this.routeHandlers = AppModules.routeHandlers(this.modules);
    this.renderers = AppModules.renderers(this.modules);

    this.router.start();
  },

  setUpModules: function() {
    var self = this;
    var modules = this.props.modules;

    modules = _.map(modules, function(mod) {
      return _.assign(mod.bindToApp(self), {name: mod.name});
    });

    return modules;
  },

  hasModule: function(name) {
    var match = _.find(this.modules, {name: name});
    return Boolean(match);
  },

  setUpDerivedState: function() {
    var derivedState = this.getDerivedState();
    derivedState =
      _.assign(derivedState, AppModules.derivedState(this.modules));
    return derivedState;
  },

  setUpActions: function() {
    var actions = createActions(this);
    actions = _.assign(actions, AppModules.actions(this.modules));
    return actions;
  },

  setUpRouter: function() {
    var router = createRouter();
    var routes = ['/', '/login'];
    routes = routes.concat(AppModules.routes(this.modules));
    this.routes = routes;
    router.setRoutes(routes);
    router.setHandler(this.actions._updateRoute.bind(this.actions));
    return router;
  },

  componentWillUpdate: function(nextProps, nextState) {
    var stateDiff = objectDifference(nextState, this.state);
    console.log('State changed', stateDiff);
  },

  componentDidMount: function() {
    this.applySyntaxColoring();
  },

  componentDidUpdate: function() {
    this.applySyntaxColoring();
  },

  applySyntaxColoring: function() {
    var el = this.refs.state.getDOMNode();
    hljs.highlightBlock(el);
  },

  render: function() {
    var title = this.renderTitle();
    var nav = this.renderNav();
    var content = this.renderContent();
    var state = this.renderState();

    return (
      <div>
        {title}
        {nav}
        {content}
        {state}
      </div>
     );
  },

  renderTitle: function() {
    var path = this.state.route.path;

    if (path === '/404') {
      return <h1>{'Not Found'}</h1>;
    }

    if (path === '/login') {
      return <h1>{'Login'}</h1>;
    }

    var title = this.utils.firstTruthy(this.renderers.title);
    if (title) {
      return <h1>{title}</h1>;
    }

    return null;
  },

  renderNav: function() {
    var self = this;

    var links = this.utils.flatMap(this.renderers.navLinks,
    function(renderer) {
      return renderer();
    });
    links = _.filter(links);

    if (this.derivedState.isLoggingIn()) {
      links.push(<span>{'Logging in...'}</span>);
    }
    else if (this.derivedState.isLoggingOut()) {
      links.push(<span>{'Logging out...'}</span>);
    }
    else if (!this.derivedState.isAuthenticated()) {
      var login = function(e) {
        e.preventDefault();
        self.actions.login();
      };

      links.push(<a href={''} onClick={login}>{'Log in'}</a>);
    }
    else {
      var logout = function(e) {
        e.preventDefault();
        self.actions.logout();
      };

      links.push(<a href={''} onClick={logout}>{'Log out'}</a>);
    }

    links = this.utils.interpose(links, function() {
      return <span>{' · '}</span>;
    });

    return (
      <p>
        {links}
      </p>
    );
  },

  renderContent: function() {
    var path = this.state.route.path;

    if (path === '/404') {
      return this.renderNotFound();
    }

    if (path === '/login') {
      return null;
    }

    var content = this.utils.firstTruthy(this.renderers.content);
    if (content) {
      return content;
    }

    return null;
  },

  renderState: function() {
    return (
      <pre ref={'state'}><code>
        {this.prettyPrintState()}
      </code></pre>
    );
  },

  prettyPrintState: function() {
    var prettyState = _.cloneDeep(this.state);
    prettyState.derived = _.reduce(this.derivedState, function(acc, func, key) {
      acc[key] = func();
      return acc;
    }, {});
    return JSON.stringify(prettyState, null, 2);
  },

  renderNotFound: function() {
    return (
      <div>
        <p>{'Sorry! Could not find what you were looking for.'}</p>
        <p><a href={'#/'}>{'Go back to home page'}</a></p>
      </div>
    );
  }
});

module.exports = App;
