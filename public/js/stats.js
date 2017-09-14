/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
Daytrader.plugin("stats", function(app) {
  console.log("stats-plugin", [].slice.call(arguments));
  var
    data = app.data,
    math = data.math,
    dateSort = data.sort.obj({
      "key": "date", 
      "dir": "asc"
    }),
    api = {
      "get": function(recs, symbol) {
        
        console.log("stats.api.get", recs, symbol);
        
        var sorted = recs.sort(dateSort),
          upperSymbol = symbol ? symbol.toUpperCase() : null,
          data = {},
          result;
        
        sorted.forEach(function(rec, idx) {
          console.log(idx, rec);
          var key = rec.symbol,
            dat;
          if (!data[key]) {
            data[key] = {
              "total": 0,
              "shares": 0
            };
          }
          dat = data[key];
          dat.total = math.add(dat.total, rec.amount);
          switch (rec.action) {
            case "Buy":
            case "Sell":
            case "Stock Dividend":
              dat.shares = math.add(dat.shares, rec.quantity);
              break;
          }
        });
        console.log("data", data);
        result = upperSymbol ? data[upperSymbol] : data;
        console.log("result", result);
        return result;
      }
    };
  return api;
});
