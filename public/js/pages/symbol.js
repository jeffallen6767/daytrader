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
    stats = gui.find("#symbol-stats"),
    content = gui.find("#symbol-content"),
    math = app.data.math,
    dateSort = app.data.sort.obj({
      "key": "trade", 
      "dir": "asc"
    }),
    getSymbolTitle = function(symbol, numIds) {
      return (symbol
        ? [numIds, "records for", symbol.toUpperCase()].join(app.CONST_ONE_SPACE)
        : ["ALL RECORDS (", numIds, ")"].join(app.CONST_NO_SPACE)
      );
    },
    display = function() {
      console.log("symbol", [].slice.call(arguments));
      title.text("Loading records...");
      var symbol = state.get("term"),
        recs = app.data.find("symbol", symbol).sort(dateSort),
        numIds = recs.length,
        symbolTitle = getSymbolTitle(symbol, numIds),
        statsGui,
        gain = {
          shares: 0,
          total: 0,
          totalLabel: null,
          totalCss: null,
          sharesCss: null
        };
      
      console.log("symbol", symbol);
      console.log("recs", recs);
      
      title.text(symbolTitle);
      
      recs.forEach(function(rec, idx) {
        gain.total = math.add(gain.total, rec.amount);
        switch (rec.action) {
          case "Buy":
            gain.shares = math.add(gain.shares, rec.quantity);
            break;
          case "Sell":
            gain.shares = math.sub(gain.shares, rec.quantity);
            break;
        }
      });
      
      gain.totalLabel = gain.total > 0 ? "Gain" : "Loss";
      gain.totalCss = gain.total > 0 ? "blackBold" : "redBold";
      gain.sharesCss = gain.shares > 0 ? "blackBold" : "redBold";
      
      statsGui = $('<div class="symbol-stats-container">').append([
        $('<span class="' + gain.sharesCss + '">Shares: ' + gain.shares + '</span>'),
        $('<span class="horizontal-spacer">&nbsp;</span>'),
        $('<span class="' + gain.totalCss + '">Total ' + gain.totalLabel + ': ' + math.money(gain.total) + '</span>')
      ]);
      
      app.display.dom.replace(stats, statsGui);
      /*
      app.display.show.template(`
          <div>
            <span class="{{gainLossClass}}">Gain/Loss: {{gainLoss}}</span>
          </div>
        `
      
      app.display.show.stats({
        "data": recs, 
        "el": stats,
        "layout": [
          {
            "id": "gainLoss",
            "val": function(vars) {
              var total = 0;
              recs.forEach(function(rec, idx) {
                total = math.add(total, rec.amount);
              });
              return total;
            }
          },
          {
            "id": "gainLossClass",
            "val": function(vars) {
              return vars.gainLoss > 0 ? "blackBold" : "redBold";
            }
          }
        ],
        "template": `
          <div>
            <span class="{{gainLossClass}}">Gain/Loss: {{gainLoss}}</span>
          </div>
        `
      });
      */
      app.display.show.table("All", recs, content);
    };
    
  // register page:
  app.pages.set("symbol", {
    "title": "Symbol",
    "leftNav": false
  });
  
  return display;
});
