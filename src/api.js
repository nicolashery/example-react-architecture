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
