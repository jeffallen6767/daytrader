/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
Daytrader.plugin("leftNav", function(app) {
  var state = app.state,
    gui = $("#leftNav");
  console.log("leftNav-plugin", [].slice.call(arguments));
  return function() {
    console.log("leftNav-run", [].slice.call(arguments));
    var page = state.get("page");
    


    
  };
});
