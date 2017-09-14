/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
Daytrader.plugin("symbol", function(app) {
  var state = app.state,
    gui = $("#symbol"),
    titleEl = gui.find("#symbol-title"),
    statsEl = gui.find("#symbol-stats"),
    contentEl = gui.find("#symbol-content"),
    math = app.data.math,
    getSymbolTitle = function(symbol, numIds) {
      return (symbol
        ? [numIds, "records for", symbol.toUpperCase()].join(app.CONST_ONE_SPACE)
        : ["ALL RECORDS (", numIds, ")"].join(app.CONST_NO_SPACE)
      );
    },
    display = function() {
      
      console.log("symbol", [].slice.call(arguments));
      
      titleEl.text("Loading records...");
      
      var symbol = state.get("term"),
        recs = app.data.find("symbol", symbol),
        symbolTitle = getSymbolTitle(symbol, recs.length),
        stats = app.stats.get(recs, symbol),
        total = stats.total,
        shares = stats.shares,
        positiveTotal = total >= 0,
        positiveShares = shares >= 0,
        totalLabel = positiveTotal ? "Gain" : "Loss",
        totalCss = positiveTotal ? "blackBold" : "redBold",
        sharesCss = positiveShares ? "blackBold" : "redBold",
        statsGui = $('<div class="symbol-stats-container">').append([
          $('<span class="' + sharesCss + '">Current Shares: ' + shares + '</span>'),
          $('<span class="horizontal-spacer">&nbsp;</span>'),
          $('<span class="' + totalCss + '">Total ' + totalLabel + ': ' + math.money(total) + '</span>')
        ]);
      
      console.log("symbol", symbol);
      console.log("recs", recs);
      
      titleEl.text(symbolTitle);
      
      app.display.dom.replace(statsEl, statsGui);

      app.display.show.table("All", recs, contentEl);
    };
    
  // register page:
  app.pages.set("symbol", {
    "title": "Symbol",
    "leftNav": false
  });
  
  return display;
});
