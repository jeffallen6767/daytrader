/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
Daytrader.plugin("layout", function(app) {
  var layout = function(next) {
    console.log("layout", [].slice.call(arguments));
    var gui = $('#layout');
    // TODO: dashboard stuff...
    
    app.show(gui);
  };
  return layout;
});
