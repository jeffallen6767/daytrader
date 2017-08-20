/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
Daytrader.plugin("home", function(app) {
  var state = app.state,
    gui = $("#home"),
    title = $("#home-title"),
    display = function() {
      console.log("home", [].slice.call(arguments));
      title.text("Loading records...");
      var ids = app.data.get.ids(),
        numIds = ids.length;
      console.log("home.ids", ids);
      title.text(numIds + " records");
    };
    
  // register page:
  app.pages.set("home", {
    "title": "Home"
  });
  
  return display;
});
