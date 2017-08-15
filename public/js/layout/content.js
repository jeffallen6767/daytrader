/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
Daytrader.plugin("content", function(app) {
  var state = app.state,
    gui = $("#content"),
    getPage = function(page) {
      return gui.find("#" + page);
    },
    last;
  console.log("content-plugin", [].slice.call(arguments));
  return function() {
    console.log("content-run", [].slice.call(arguments));
    var page = state.get("page"),
      nextPage = getPage(page);
    if (last && last !== page) {
      getPage(last).hide();
    }
    nextPage.show();
    last = page;
    app[page]();
  };
});
