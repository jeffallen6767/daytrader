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
        transactions = stats.transactions || [],
        dividends = stats.dividends || [],
        positiveTotal = total >= 0,
        positiveShares = shares >= 0,
        totalLabel = positiveTotal ? "Gain" : "Loss",
        totalCss = positiveTotal ? "blackBold" : "redBold",
        sharesCss = positiveShares ? "blackBold" : "redBold",
        rows = [],
        statsGui = $('<div class="symbol-stats-container">'),
        temp;
      
      // shares
      if (shares > 0) {
        rows.push(
          $([
            '<span class="',
            sharesCss,
            '">Current Shares: ',
            shares,
            ' @ ',
            math.money(stats.each),
            ' = ',
            math.money(stats.cost),
            '</span>'
          ].join(app.CONST_NO_SPACE))
        );
        rows.push(
          $('<div></div>')
        );
      }
      
      // transactions
      if (transactions.length) {
        rows.push(
            $('<div>History:</div>')
        );
        transactions.forEach(function(trans, index) {
          var 
            idx = index + 1,
            num = trans.num,
            buy = trans.buy,
            sell = trans.sell,
            diff = trans.diff,
            css = diff >= 0 ? "transaction blackBold" : "transaction redBold";
          rows.push(
            $([
              '<span class="',
              css,
              '">',
              idx,
              ': ',
              num,
              ' buy @ ',
              math.money(buy / num),
              ' sell @ ',
              math.money(sell / num),
              ' = ',
              math.money(diff),
              '</span>'
             ].join(app.CONST_NO_SPACE))
          );
          rows.push(
            $('<div></div>')
          );
        });
        temp = stats["trans-stats"];
        rows.push(
          $([
            '<span class="blackBold">Transaction Gains:',
            math.money(temp.gain),
            ', <span class="redBold">Losses:',
            math.money(temp.loss),
            '</span>, Total:',
            math.money(temp.total),
            '</span>'
           ].join(app.CONST_NO_SPACE))
        );
        rows.push(
          $('<div></div>')
        );
      }
      
      // dividends
      if (dividends.length) {
        temp = dividends.reduce(function(total, dividend) {
          total += dividend.amount;
          return total;
        }, 0);
        rows.push(
          $([
            '<span class="blackBold">Dividend Gains:',
            math.money(temp),
            '</span>'
           ].join(app.CONST_NO_SPACE))
        );
        rows.push(
          $('<div></div>')
        );
      }
      
      if (total) {
        rows.push(
          $('<span class="' + totalCss + '">Total ' + totalLabel + ': ' + math.money(total) + '</span>')
        );
      }
      
      console.log("symbol", symbol);
      console.log("recs", recs);
      
      titleEl.text(symbolTitle);
      
      app.display.dom.replace(statsEl, statsGui.append(rows));

      app.display.show.table("All", recs, contentEl);
    };
    
  // register page:
  app.pages.set("symbol", {
    "title": "Symbol",
    "leftNav": false
  });
  
  return display;
});
