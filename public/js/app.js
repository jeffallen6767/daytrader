/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
;(function (factory) {
	var registeredInModuleLoader = false;
	if (typeof define === "function" && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if (typeof exports === "object") {
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
  var ns, cookie, local, session, current, appState,
    plugins = [],
    Err = function(type, msg, data) {
      this.type = type;
      this.message = msg;
      this.data = data;
    },
    state = {
      "get": function(key) {
        return appState[key];
      },
      "set": function(key, val) {
        appState[key] = val;
        session.set("state", appState);
      }
    },
    storage = {
      "cookie": cookie,
      "local": local,
      "session": session
    },
    app = {
      "init": function() {
        ns = Storages.initNamespaceStorage("daytrader.jdallen.net");
        cookie = storage.cookie = ns.cookieStorage;
        local = storage.local = ns.localStorage;
        session = storage.session = ns.sessionStorage;
        current = $("#loading");
        appState = session.get("state") || {};
        // init plugins:
        plugins.forEach(function(id) {
          app[id] = methods[id](app);
          methods[id] = true;
        });
        app.run();
      },
      "state": state,
      "storage": storage,
      "show": function(el) {
        console.log("show", el, app);
        if (el && el.length) {
          if (el !== current) {
            current.hide();
            current = el;
            el.show();
          } else {
            console.log("show el is same as current");
          }
        } else {
          throw new Err("show", "el is not an element", el);
        }
      },
      "plugin": function(id, method) {
        var isString = typeof id,
          isFunction = typeof method;
        if (isString !== "string") {
          throw new Err("plugin", "id must be a string:", isString, id);
        }
        if (isFunction !== "function") {
          throw new Err("plugin", "method must be a function:", isFunction, method);
        }
        if (methods[id] || plugins.indexOf(id) !== -1) {
          throw new Err("plugin", "Method exists", id);
        }
        plugins.push(id);
        methods[id] = method;
      },
      "run": function() {
        var next = app.dashboard,
          user = state.get("user");
        if (user) {
          next();
        } else {
          user = cookie.get("user");
          if (user) {
            state.set("user", user);
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
  return app;
}));
