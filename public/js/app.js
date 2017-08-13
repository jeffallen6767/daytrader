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
  var ns = Storages.initNamespaceStorage("daytrader.jdallen.net"),
    cookie = ns.cookieStorage,
    local = ns.localStorage,
    session = ns.sessionStorage,
    Err = function(type, msg, data) {
      this.type = type;
      this.message = msg;
      this.data = data;
    },
    current = $("#loading"),
    appState = session.get("state") || {},
    state = {
      "get": function(key) {
        return appState[key];
      },
      "set": function(key, val) {
        appState[key] = val;
        session.set("state", appState);
      }
    },
    app = {
      "state": state,
      "storage": {
        "cookie": cookie,
        "local": local,
        "session": session
      },
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
        if (methods[id]) {
          throw new Err("plugin", "Method exists", id);
        }
        methods[id] = true;
        app[id] = method(app);
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
