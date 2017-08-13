/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
Daytrader.plugin("content", function(app) {
  var state = app.state,
    gui = $("#content");
  return function() {
    console.log("content", [].slice.call(arguments));
    var page = state.get("page");
    


    
  };
});
