/******/ (function(modules) { // webpackBootstrap
/******/ 	
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/ 		
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/ 		
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 		
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 		
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/ 	
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/ 	
/******/ 	
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var React = window.React;

	var App = __webpack_require__(1);
	var api = __webpack_require__(2);

	var modules = [
	  __webpack_require__(3),
	  __webpack_require__(4)
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


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */

	var React = window.React;
	var _ = window._;
	var hljs = window.hljs;

	var createRouter = __webpack_require__(5);
	var createActions = __webpack_require__(6);
	var utils = __webpack_require__(7);
	var AppModules = __webpack_require__(8);

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

	var App = React.createClass({displayName: 'App',
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
	      React.DOM.div(null, 
	        title,
	        nav,
	        content,
	        state
	      )
	     );
	  },

	  renderTitle: function() {
	    var path = this.state.route.path;

	    if (path === '/404') {
	      return React.DOM.h1(null, 'Not Found');
	    }

	    if (path === '/login') {
	      return React.DOM.h1(null, 'Login');
	    }

	    var title = this.utils.firstTruthy(this.renderers.title);
	    if (title) {
	      return React.DOM.h1(null, title);
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
	      links.push(React.DOM.span(null, 'Logging in...'));
	    }
	    else if (this.derivedState.isLoggingOut()) {
	      links.push(React.DOM.span(null, 'Logging out...'));
	    }
	    else if (!this.derivedState.isAuthenticated()) {
	      var login = function(e) {
	        e.preventDefault();
	        self.actions.login();
	      };

	      links.push(React.DOM.a( {href:'', onClick:login}, 'Log in'));
	    }
	    else {
	      var logout = function(e) {
	        e.preventDefault();
	        self.actions.logout();
	      };

	      links.push(React.DOM.a( {href:'', onClick:logout}, 'Log out'));
	    }

	    links = this.utils.interpose(links, function() {
	      return React.DOM.span(null, ' · ');
	    });

	    return (
	      React.DOM.p(null, 
	        links
	      )
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
	      React.DOM.pre( {ref:'state'}, React.DOM.code(null, 
	        this.prettyPrintState()
	      ))
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
	      React.DOM.div(null, 
	        React.DOM.p(null, 'Sorry! Could not find what you were looking for.'),
	        React.DOM.p(null, React.DOM.a( {href:'#/'}, 'Go back to home page'))
	      )
	    );
	  }
	});

	module.exports = App;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var _ = window._;

	var api = {};

	api._authToken = null;

	api.loadSession = function(cb) {
	  var authToken = window.localStorage.getItem('authToken');
	  // Can check here against backend that this is a valid token
	  api._authToken = authToken;
	  setTimeout(function() {
	    cb(null, authToken);
	  }, 0);
	};

	api.destroySession = function() {
	  window.localStorage.removeItem('authToken');
	  api._authToken = null;
	};

	api.saveSession = function(authToken) {
	  window.localStorage.setItem('authToken', authToken);
	  api._authToken = authToken;
	};

	api.login = function(cb) {
	  var authToken = 'abc123';
	  api.saveSession(authToken);
	  setTimeout(function() {
	    cb(null, authToken);
	  }, 1000);
	};

	api.logout = function(cb) {
	  api.destroySession();
	  setTimeout(function() {
	    cb();
	  }, 1000);
	};

	api._items = [
	  {id: '1', name: 'Saphire'},
	  {id: '2', name: 'Ruby'},
	  {id: '3', name: 'Opal'}
	];

	api.getItems = function(options, cb) {
	  var items = _.clone(api._items);
	  if (options.sort === 'descending') {
	    items = items.reverse();
	  }
	  setTimeout(function() {
	    cb(null, items);
	  }, 1000);
	};

	api.getItem = function(id, cb) {
	  var item = _.find(api._items, {id: id});
	  var err;
	  if (!item) {
	    err = {status: 404, message: 'Not found'};
	  }
	  setTimeout(function() {
	    cb(err, item);
	  }, 1000);
	};

	module.exports = api;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(9);


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(10);


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var _ = window._;
	var Aviator = window.Aviator;

	var createRouter = function() {

	  // Helper functions to translate an array of routes
	  // ex: ['/items', '/items/:id']
	  // to an Aviator routing table
	  // ex: {'/items': {target: app.actions, '/': '_updateRoute', '/:id': '_updateRoute'}}
	  function slugsFromRoute(route) {
	    if (route === '/') {
	      return [route];
	    }

	    var slugs = route.split('/');
	    slugs = _.filter(slugs);
	    slugs = _.map(slugs, function(slug) { return '/' + slug; });
	    return slugs;
	  }

	  function addSlugsToRoutingTable(table, slugs, options) {
	    var target = options.target;
	    var method = options.method;

	    var child = table;
	    _.forEach(slugs, function(slug, index) {
	      var existingChild = child[slug];

	      if (index === 0 && !existingChild) {
	        child = child[slug] = {
	           target: target,
	           '/': method
	        };
	        return;
	      }

	      if (index === slugs.length - 1) {
	        child[slug] = method;
	        return;
	      }

	      if (typeof existingChild === 'object') {
	        child = child[slug];
	        return;
	      }

	      child = child[slug] = {
	        target: target,
	        '/': method
	      };
	      return;
	    });

	    return table;
	  }

	  function routingTableFromRoutes(routes, options) {
	    return _.reduce(routes, function(acc, route) {
	      var slugs = slugsFromRoute(route);
	        return addSlugsToRoutingTable(acc, slugs, options);
	      }, {});
	  }

	  // Helper functions to translate Aviator Request objects
	  // to simpler "Express-like" route objects

	  /* FROM:
	  {
	    "namedParams": {"id": "123"},
	    "queryParams": {"sort": "descending"},
	    "params": {"id": "123", "sort": "descending"},
	    "uri": "/data/123",
	    "queryString": "?sort=descending",
	    "matchedRoute": "/data/:id"
	  }*/

	  /*TO:
	  {
	    "path": "/data/:id",
	    "params": {"id": "123"},
	    "query": {"sort": "descending"}
	  }
	  */
	  function routeFromAviatorRequest(req) {
	    var path = req.matchedRoute;
	    if (path === '') {
	      if (req.uri === '/' || req.uri === '') {
	        path = '/';
	      }
	      else {
	        path = '/404';
	      }
	    }

	    return {
	      path: path,
	      params: req.namedParams,
	      query: req.queryParams
	    };
	  }

	  // Actual router object
	  var router = {
	    setRoutes: function(routes) {
	      var self = this;

	      Aviator.pushStateEnabled = false;

	      var routingTable = routingTableFromRoutes(['/404'].concat(routes), {
	        target: self,
	        method: 'onUriChange'
	      });
	      Aviator.setRoutes(routingTable);
	    },

	    setHandler: function(handler) {
	      if (typeof handler !== 'function') {
	        throw new Error('onRouteChange handler must be a function');
	      }
	      this.onRouteChange = handler;
	    },

	    onRouteChange: _.noop,

	    onUriChange: function(req) {
	      var route = routeFromAviatorRequest(req);
	      this.onRouteChange(route);
	    },

	    start: function() {
	      this._patchAviator();
	      Aviator.dispatch();
	    },

	    _patchAviator: function() {
	      var self = this;

	      var _navigator = Aviator._navigator;
	      var orignalInvokeActions = _navigator._invokeActions;
	      Aviator._navigator._invokeActions = function(request, options) {
	        // Always call uri change handler, even if not matched route
	        // (handler will take care of "not found" case)
	        if (this._actions.length === 0) {
	          this._actions.push({
	            target: self,
	            method: 'onUriChange'
	          });
	        }

	        orignalInvokeActions.call(_navigator, request, options);
	      };
	    },

	    // Usage:
	    // buildUri('/data/:id', {params: {id: '123'}, query: {sort: 'descending'}})
	    // or
	    // buildUri('/data/123?sort=descending')
	    buildUri: function(pattern, options) {
	      var _navigator = Aviator._navigator;
	      options = options || {};
	      var uri = pattern;

	      var params = options.params;
	      var query = options.query;

	      if (params) {
	        for (var p in params) {
	          if (params.hasOwnProperty(p)) {
	            uri = uri.replace(':' + p, encodeURIComponent(params[p]));
	          }
	        }
	      }

	      if (query) {
	        uri += _navigator.serializeQueryParams(query);
	      }

	      return uri;
	    },

	    getRouteForUri: function(uri) {
	      var _navigator = Aviator._navigator;

	      var queryString = uri.split('?')[1];
	      if (queryString) {
	        queryString = '?' + queryString;
	        uri = uri.replace(queryString, '');
	      }
	      else {
	        queryString = null;
	      }

	      var route = _navigator.createRouteForURI(uri);
	      route = _navigator.createRequest(uri, queryString, route.matchedRoute);

	      route = routeFromAviatorRequest(route);

	      return route;
	    },

	    updateBrowserUri: function(uri) {
	      Aviator.navigate(uri, {silent: true});
	    },

	    getUriForRoute: function(route) {
	      var uri = router.buildUri(route.path, {
	        params: route.params,
	        query: route.query
	      });
	      return uri;
	    },

	    updateRouteQuery: function(route, query) {
	      route = _.cloneDeep(route);
	      route.query = _.assign(route.query, query);
	      return route;
	    }
	  };

	  return router;
	};

	module.exports = createRouter;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var _ = window._;

	var createActions = function(app) {
	  var actions = {
	    _updateRoute: function(route) {
	      var path = route.path;

	      if (path === '/404') {
	        console.log('route not found');
	        app.setState({route: route});
	        return;
	      }

	      if (!app.derivedState.isAuthenticated() && path !== '/login') {
	        console.log('not authenticated, redirecting to login');
	        actions.navigateTo('/login');
	        return;
	      }

	      if (app.derivedState.isAuthenticated() &&
	          (path === '/' || path === '/login')) {
	        console.log('authenticated, redirecting to home');
	        actions.navigateTo(app.defaultRoute);
	        return;
	      }

	      var routeWasHandled = app.utils.firstTruthy(app.routeHandlers, route);
	      if (routeWasHandled) {
	        return;
	      }

	      app.setState({route: route});
	    },

	    navigateTo: function(pattern, options) {
	      var uri = app.router.buildUri(pattern, options);
	      var route = app.router.getRouteForUri(uri);
	      app.router.updateBrowserUri(uri);
	      actions._updateRoute(route);
	    },

	    login: function() {
	      app.setState({isAuthenticating: true});
	      app.api.login(function(err, authToken) {
	        app.setState({
	          isAuthenticating: false,
	          authToken: authToken
	        });
	        actions.navigateTo('/dashboard');
	      });
	    },

	    logout: function() {
	      app.setState({isAuthenticating: true});
	      app.api.logout(function() {
	        app.setState({
	          isAuthenticating: false,
	          authToken: null
	        });
	        actions.navigateTo('/login');
	      });
	    },

	    handleResourceError: function(resourceKey, err) {
	      var resource = _.clone(app.state[resourceKey]);
	      var stateUpdate = {};
	      stateUpdate[resourceKey] = _.assign(resource, {
	        status: 'error',
	        data: err
	      });
	      app.setState(stateUpdate);
	    },

	    getItems: function(options) {
	      app.api.getItems(options, function(err, items) {
	        if (err) {
	          return actions.handleResourceError('itemsResource', err);
	        }

	        app.setState({
	          itemsResource: {status: 'success', data: items}
	        });
	      });
	    }
	  };

	  return actions;
	};

	module.exports = createActions;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var _ = window._;

	var slice = [].slice;

	var utils = {
	  firstTruthy: function(coll) {
	    var args = slice.call(arguments, 1);

	    return _.reduce(coll, function(result, val) {
	      if (result) {
	        return result;
	      }
	      if (typeof val === 'function') {
	        val = val.apply(null, args);
	      }
	      if (!val) {
	        return result;
	      }
	      return val;
	    }, null);
	  },

	  flatMap: function(coll, func) {
	    return _.reduce(coll, function(acc) {
	      var args = slice.call(arguments, 1);
	      return acc.concat(func.apply(null, args));
	    }, []);
	  },

	  interpose: function(coll, f) {
	    if (typeof f !== 'function') {
	      f = _.identity.bind(null, f);
	    }

	    return _.reduce(coll, function(acc, item, index) {
	      if (index !== 0) {
	        acc.push(f(index - 1));
	      }
	      acc.push(item);
	      return acc;
	    }, []);
	  }
	};

	module.exports = utils;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var _ = window._;

	var utils = __webpack_require__(7);

	var AppModules = {
	  initialState: function(modules) {
	    return this.mergeObjectsFromAttribute('initialAppState', modules);
	  },

	  derivedState: function(modules) {
	    return this.mergeObjectsFromAttribute('derivedAppState', modules);
	  },

	  actions: function(modules) {
	    return this.mergeObjectsFromAttribute('actions', modules);
	  },

	  routes: function(modules) {
	    return utils.flatMap(modules, function(mod) {
	      if (mod.routes) {
	        return mod.routes();
	      }
	      else {
	        return [];
	      }
	    });
	  },

	  routeHandlers: function(modules) {
	    return this.collectValuesFromAttribute('onRouteChange', modules);
	  },

	  renderers: function(modules) {
	    var self = this;
	    return {
	      title: self.collectValuesFromAttribute('renderTitle', modules),
	      navLinks: self.collectValuesFromAttribute('renderNavLinks', modules),
	      content: self.collectValuesFromAttribute('renderContent', modules)
	    };
	  },

	  mergeObjectsFromAttribute: function(attribute, modules) {
	    return _.reduce(modules, function(acc, mod) {
	      var obj = mod[attribute] || {};
	      if (_.isFunction(obj)) {
	        obj = obj();
	      }
	      return _.assign(acc, obj);
	    }, {});
	  },

	  collectValuesFromAttribute: function(attribute, modules) {
	    return _.reduce(modules, function(acc, mod) {
	      var value = mod[attribute];
	      if (typeof value === 'function') {
	        value = value.bind(mod);
	      }
	      if (value) {
	        acc.push(value);
	      }
	      return acc;
	    }, []);
	  }
	};

	module.exports = AppModules;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

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
	      return [React.DOM.span(null, 'Dashboard')];
	    }

	    return [React.DOM.a( {href:'#/dashboard'}, 'Dashboard')];
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
	      return React.DOM.p(null, 'Loading summary...');
	    }

	    if (resource.status === 'error') {
	      return React.DOM.p(null, 'Error loading summary');
	    }

	    var items = resource.data;

	    if (!(items && items.length)) {
	      return React.DOM.p(null, 'No items yet');
	    }

	    var text = items.length + ' items';
	    if (items.length === 1) {
	      text = '1 item';
	    }

	    return React.DOM.p(null, React.DOM.a( {href:'#/items'}, text));
	  }
	};
	};

	module.exports = {
	  name: 'dashboard',
	  bindToApp: bindToApp
	};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/** @jsx React.DOM */
	var React = window.React;
	var _ = window._;

	var utils = {
	  itemsOrderFromRoute: function(route) {
	    var query = (route && route.query) || {};
	    if (query.sort === 'descending') {
	      return query.sort;
	    }
	    return 'ascending';
	  }
	};

	var bindToApp = function(app) {
	return {
	  initialAppState: function() {
	    return {
	      itemsOrder: 'ascending',
	      itemDetailsResource: null
	    };
	  },

	  derivedAppState: function() { return {}; },

	  routes: function() {
	    return [
	      '/items',
	      '/items/:id'
	    ];
	  },

	  onRouteChange: function(route) {
	    var path = route.path;

	    if (path === '/items') {
	      return app.actions.showItems(route);
	    }

	    if (path === '/items/:id') {
	      return app.actions.showItemDetails(route);
	    }
	  },

	  actions: function() {
	    return {
	      showItems: function(route) {
	        var sort = utils.itemsOrderFromRoute(route);

	        app.setState({
	          route: route,
	          itemsResource: {status: 'pending'},
	          itemsOrder: sort
	        });

	        app.actions.getItems({sort: sort});
	      },

	      sortItems: function(order) {
	        var route = app.state.route;
	        var path = route.path;

	        if (path !== '/items') {
	          return;
	        }

	        route = app.router.updateRouteQuery(route, {sort: order});
	        app.actions.showItems(route);

	        var uri = app.router.getUriForRoute(route);
	        app.router.updateBrowserUri(uri);
	      },

	      showItemDetails: function(route) {
	        var id = route.params.id;

	        app.setState({
	          route: route,
	          itemDetailsResource: {status: 'pending', request: {id: id}}
	        });

	        app.api.getItem(id, function(err, item) {
	          if (err) {
	            return app.actions.handleResourceError(
	              'itemDetailsResource', err
	            );
	          }

	          app.setState({
	            itemDetailsResource: {
	              status: 'success',
	              data: item,
	              request: {id: id}
	            }
	          });
	        });
	      }
	    };
	  },

	  renderTitle: function() {
	    var path = app.state.route.path;

	    if (path === '/items') {
	      return 'Items';
	    }

	    if (path === '/items/:id') {
	      return 'Item Details';
	    }
	  },

	  renderNavLinks: function() {
	    var path = app.state.route.path;

	    if (!app.derivedState.isAuthenticated()) {
	      return null;
	    }

	    if (path === '/items') {
	      return [React.DOM.span(null, 'Items')];
	    }

	    var href = '#/items';
	    if (app.state.itemsOrder === 'descending') {
	      href = href + '?sort=descending';
	    }

	    return [React.DOM.a( {href:href}, 'Items')];
	  },

	  renderContent: function() {
	    var path = app.state.route.path;

	    if (path === '/items') {
	      return this.renderItems();
	    }

	    if (path === '/items/:id') {
	      return this.renderItemDetails();
	    }
	  },

	  renderItems: function() {
	    var resource = app.state.itemsResource || {};

	    if (resource.status === 'pending') {
	      return React.DOM.p(null, 'Loading items...');
	    }

	    if (resource.status === 'error') {
	      return React.DOM.p(null, 'Error loading items');
	    }

	    var items = resource.data;

	    if (!(items && items.length)) {
	      return React.DOM.p(null, 'No items yet');
	    }

	    var sort = function(order, e) {
	      e.preventDefault();
	      app.actions.sortItems(order);
	    };
	    var sortActions;
	    if (app.state.itemsOrder === 'descending') {
	      sortActions = (
	        React.DOM.p(null, 
	          'Sort: ',
	          React.DOM.a( {href:'', onClick:sort.bind(null, 'ascending')}, 
	            'Ascending'
	          ),
	          ' | Descending'
	        )
	      );
	    }
	    else {
	      sortActions = (
	        React.DOM.p(null, 
	          'Sort: ',
	          'Ascending | ',
	          React.DOM.a( {href:'', onClick:sort.bind(null, 'descending')}, 
	            'Descending'
	          )
	        )
	      );
	    }

	    var itemNodes = _.map(items, function(item) {
	      return (
	        React.DOM.li(null, 
	          React.DOM.a( {key:item.id, href:'#/items/' + item.id}, item.name)
	        )
	      );
	    });

	    return (
	      React.DOM.div(null, 
	        sortActions,
	        React.DOM.ul(null, itemNodes)
	      )
	    );
	  },

	  renderItemDetails: function() {
	    var resource = app.state.itemDetailsResource || {};

	    if (resource.status === 'pending') {
	      return React.DOM.p(null, 'Loading item details...');
	    }

	    var item = resource.data;

	    if (resource.status === 'error') {
	      if (resource.data && resource.data.status === 404) {
	        var requestedId = resource.request && resource.request.id;
	        return React.DOM.p(null, 'Could not find item with id ' + requestedId);
	      }

	      return React.DOM.p(null, 'Error loading item details');
	    }

	    return (
	      React.DOM.div(null, 
	        React.DOM.p(null, React.DOM.strong(null, 'id: '),item.id),
	        React.DOM.p(null, React.DOM.strong(null, 'name: '),item.name)
	      )
	    );
	  },

	  utils: utils
	};
	};

	module.exports = {
	  name: 'items',
	  bindToApp: bindToApp
	};


/***/ }
/******/ ])