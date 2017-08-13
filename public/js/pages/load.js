/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
Daytrader.plugin("load", function(app) {
  var state = app.state,
    gui = $("#load");
  app.pages.set("load", {
    "title": "Load"
  });
  return function() {
    console.log("load", [].slice.call(arguments));
    var page = state.get("page");
    


    
  };
});
