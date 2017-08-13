/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
Daytrader.plugin("dashboard", function(app) {
  var state = app.state,
    gui = $("#dashboard"),
    keys = [],
    pages = {};
  app.pages = {
    "get": function(key) {
      return pages[key];
    },
    "set": function(key, val) {
      keys.push(key);
      pages[key] = val;
    },
    "keys": keys
  };
  return function() {
    console.log("dashboard", [].slice.call(arguments));
    var page = state.get("page");
    if (!page) {
      page = "home";
      state.set("page", page);
    }
    app.topNav();
    app.leftNav();
    app.content();
    app.show(gui);
  };
});
