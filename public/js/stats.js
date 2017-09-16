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
            action = rec.action,
            amt = Math.abs(rec.amount), 
            qty = Math.abs(rec.quantity),
            fee = Math.abs(rec.commission) + Math.abs(rec.fees),
            dat, 
            temp,
            trans,
            item,
            cost,
            num,
            cash,
            combo;
          if (!data[key]) {
            data[key] = {
              "in": 0,
              "out": 0,
              "fee": 0,
              "total": 0,
              "shares": 0,
              "cost": 0,
              "acc": [],
              "transactions": [],
              "trans-stats": {},
              "dividends": []
            };
          }
          dat = data[key];
          switch (action) {
            case "Buy":
              dat.out = math.sub(dat.out, amt);
              dat.fee = math.sub(dat.fee, fee);
              dat.total = math.sub(dat.total, amt, fee);
              dat.shares = math.add(dat.shares, qty);
              cash = amt + fee;
              dat.acc.push({
                "more": symbol,
                "num": qty,
                "cost": cash,
                "each": cash / qty
              });
              combo = dat.acc.reduce(function(acc, obj) {
                var 
                  newNum = acc.num + obj.num,
                  newCost = acc.cost + obj.cost,
                  newEach = newCost / newNum,
                  result = {
                    "more": symbol,
                    "num": newNum,
                    "cost": newCost,
                    "each": newEach
                  };
                return result;
              });
              console.log("+buy=acc.combo", JSON.stringify(combo));
              dat.acc = [combo];
              break;
            case "Sell":
              dat.in = math.add(dat.in, amt);
              dat.fee = math.sub(dat.fee, fee);
              dat.total = math.add(dat.total, amt, -1 * fee);
              dat.shares = math.sub(dat.shares, qty);
              cash = amt - fee;
              temp = qty;
              trans = {
                "num": 0,
                "buy": 0,
                "sell": cash
              };
              console.log("start sale...", temp, JSON.stringify(dat.acc));
              while (temp > 0 && dat.acc.length) {
                item = dat.acc[0];
                num = item.num;
                cost = item.cost;
                console.log("selling...", temp, num, cost, " @ ", item.each);
                if (num <= temp) {
                  // equal or less
                  temp -= num;
                  cash -= cost;
                  dat.acc.shift();
                  trans.num += num;
                  trans.buy += cost;
                } else {
                  // more
                  item.num -= temp;
                  item.cost = item.num * item.each;
                  trans.num += temp;
                  trans.buy += temp * item.each;
                  temp = 0;
                }
              }
              trans.diff = trans.sell - trans.buy;
              console.log("sold...", JSON.stringify(trans));
              console.log("dat.acc...", JSON.stringify(dat.acc));
              dat.transactions.push(trans);
              break;
            case "Dividend":
              dat.total = math.add(dat.total, amt);
              dat.dividends.push(rec);
              break;
            case "Stock Dividend":
              dat.shares = math.add(dat.shares, qty);
              dat.acc.push({
                "more": symbol,
                "num": qty,
                "cost": 0,
                "each": 0
              });
              combo = dat.acc.reduce(function(acc, obj) {
                var 
                  newNum = acc.num + obj.num,
                  newCost = acc.cost + obj.cost,
                  newEach = newCost / newNum,
                  result = {
                    "more": symbol,
                    "num": newNum,
                    "cost": newCost,
                    "each": newEach
                  };
                return result;
              });
              console.log("+stock_div=acc.combo", JSON.stringify(combo));
              dat.acc = [combo];
              break;
            case "IRA Receipt":
            case "Credit Interest":
            case "Rebate":
            case "Cash Adjustment":
              // TODO?
              break;
            default:
              throw new app.Err("stats", ["Unknown rec.action[", idx, "]: ", action].join(app.CONST_NO_SPACE), rec);
              break;
          }
        });
        console.log("data", data);
        result = upperSymbol ? data[upperSymbol] : data;
        if (result.acc && result.acc.length) {
          result.cost = result.acc.reduce(function(num, item) {
            num += item.cost;
            return num;
          }, 0);
          result.each = result.cost / result.shares;
          result.total += result.cost;
        }
        // "trans-stats"
        if (result.transactions && result.transactions.length) {
          temp = result["trans-stats"] = {
            "gain": 0,
            "loss": 0,
            "total": 0
          };
          result.transactions.forEach(function(transaction) {
            var diff = transaction.diff;
            if (diff > 0) {
              temp.gain += diff;
            } else {
              temp.loss += diff;
            }
            temp.total += diff;
          });
        }
        
        
        console.log("result", result);
        return result;
      }
    };
  return api;
});
