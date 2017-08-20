/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
Daytrader.plugin("symbol", function(app) {
  var state = app.state,
    gui = $("#symbol"),
    title = gui.find("#symbol-title"),
    content = gui.find("#symbol-content"),
    display = function() {
      console.log("symbol", [].slice.call(arguments));
      title.text("Loading records...");
      var symbol = state.get("term"),
        recs = app.data.find("symbol", symbol);
        console.log("symbol", symbol);
        console.log("recs", recs);
        var numIds = recs.length;
        title.text(numIds + " records for " + symbol.toUpperCase());
        app.display.show.table("All", recs, content);
    };
    
  // register page:
  app.pages.set("symbol", {
    "title": "Symbol"
  });
  
  return display;
});
