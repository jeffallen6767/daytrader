/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
;(function (factory) {
	var registeredInModuleLoader = false;
	if (typeof define === 'function' && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if (typeof exports === 'object') {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldDaytrader = window.Daytrader;
		var api = window.Daytrader = factory();
		api.noConflict = function () {
			window.Daytrader = OldDaytrader;
			return api;
		};
	}
}(function () {
  
  var ns = Storages.initNamespaceStorage('daytrader-jdallen.net'),
    storage = {
      "cookie": ns.cookieStorage,
      "local": ns.localStorage,
      "session": ns.sessionStorage
    },
    err = function(type, msg) {
      this.type = type;
      this.message = msg;
    },
    root = $('#root'),
    loading = $('#loading'),
    current = loading,
    app = {
      "storage": storage,
      "show": function(el) {
        current.hide();
        current = el;
        el.show();
      },
      "plugin": function(id, method) {
        if (methods[id]) {
          throw new Err("plugin", "Method Exists: " + id);
        }
        methods[id] = true;
        app[id] = method(app);
      },
      "run": function() {
        var session = storage.session.get(),
          user = session.user,
          next = app.layout,
          cookie;
        console.log("session", session, user);
        if (user) {
          next();
        } else {
          cookie = storage.cookie.get();
          user = cookie.user;
          console.log("cookie", cookie, user);
          if (user) {
            session.set('user', user);
            next();
          } else {
            app.signin(app.run);
          }
        }
      }
    },
    methods = Object.keys(app).reduce(function(obj, method) {
      obj[method] = true;
      return obj;
    }, {});
  console.log("methods", methods);
  /*
  console.log("ns", ns);
  console.log("cs", cs);
  console.log("ls", ls);
  console.log("ss", ss);
  */
  return app;
}));
