/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
Daytrader.plugin("home", function(app) {
  var state = app.state,
    gui = $("#home");
  app.pages.set("home", {
    "title": "Home"
  });
  return function() {
    console.log("home", [].slice.call(arguments));
    var page = state.get("page");
    


    
  };
});
