/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
Daytrader.plugin("data", function(app) {
  var state = app.state,
    brokerIds = {
      "SQPATSIACFCDTR": "scottrade",
      "DTDQSPCANRSFD": "tdameritrade"
    },
    metaData = {
      "scottrade": {
        "display": {
          "All": {
            "keys": ['TradeDate','Symbol', 'ActionNameUS', 'Quantity', 'Price', 'Commission', 'Fees', 'Amount', 'Description']
          },
          "Dividend": {
            "keys": ['TradeDate','Symbol', 'Amount', 'Description']
          }
        },
        "calc": {
          "symbol": "Symbol",
          "action": "ActionNameUS",
          "amount": "Amount"
        }
      },
      "tdameritrade": {
        "display": {
          "All": {
            "keys": ['DATE','SYMBOL', 'QUANTITY', 'PRICE', 'COMMISSION', 'REG FEE', 'AMOUNT', 'DESCRIPTION']
          },
          "Dividend": {
            "keys": ['DATE','SYMBOL', 'AMOUNT', 'DESCRIPTION']
          }
        },
        "calc": {
          "symbol": "SYMBOL",
          "action": "DESCRIPTION",
          "amount": "AMOUNT"
        }
      }
    },
    addReal = function addReal(a, b) {
      return Math.round(((a-0) + (b-0)) * 1e12) / 1e12;
    },
    subtractReal = function subtractReal(a, b) {
      return Math.round(((a-0) - (b-0)) * 1e12) / 1e12;
    },
    multiplyReal = function multiplyReal(a, b) {
      return Math.round(((a-0) * (b-0)) * 1e12) / 1e12;
    },
    divideReal = function divideReal(a, b) {
      return Math.round(((a-0) / (b-0)) * 1e12) / 1e12;
    },
    add = function() {
      var args = [].slice.call(arguments),
        first = args.shift();
      //console.log("add", args, first);
      return args.reduce(addReal, first);
    },
    sub = function() {
      var args = [].slice.call(arguments),
        first = args.shift();
      //console.log("sub", args, first);
      return args.reduce(subtractReal, first);
    },
    mul = function() {
      var args = [].slice.call(arguments),
        first = args.shift();
      //console.log("mul", args, first);
      return args.reduce(multiplyReal, first);
    },
    div = function() {
      var args = [].slice.call(arguments),
        first = args.shift();
      //console.log("div", args, first);
      return args.reduce(divideReal, first);
    },
    money = function(num) {
      return accounting.formatMoney(
        accounting.toFixed(num, 2)
      );
    },
    cleanKeys = function cleanKeys(keys) {
      var result = keys.map(function(x) {
        return x.trim();
      });
      console.log('cleanKeys', keys, result);
      return result;
    },
    findTypeByKeys = function findTypeByKeys(keys) {
      var id = keys.map(function(key) {
          return key.slice(0,1);
        }).join(""),
        type = brokerIds[id];
      console.log("findTypeByKeys", keys, id, type);
      return type;
    },
    findMetaByType = function findMetaByType(type) {
      var meta = metaData[type];
      console.log("findMetaByType", type, meta);
      return meta;
    },
    indexData = function indexData(data) {

      console.log("indexData", data);

      var keys = cleanKeys(data[0]),
          type = findTypeByKeys(keys),
          meta = findMetaByType(type),
          numKeys = keys.length,
          numData = data.length,
          vals = [],
          objs = [],
          idx = {"keys":{},"calc":{}},
          v,w,x,y,z,
          result;

      // set-up index
      for (x=0; x<numKeys; x++) {
        idx.keys[keys[x]] = x;
      }

      // reverse data to get time-ordered
      for (x=0, y=numData-1; x<y; y--) {
        // data line
        z = data[y];
        if (z.length === numKeys) {
          // save copy
          vals.push(z);
          w = {};
          for (v=0; v<numKeys; v++) {
            w[keys[v]] = z[v];
          }
          if (type === "tdameritrade") {
            objs.unshift(w);
          } else {
            objs.push(w);
          }
        } else if (z.length === 1 && z[0] === '' || z[0] === '***END OF FILE***') {
          // noop, papa parse, end of data
        } else {
          console.error("!!! indexData BAD DATA LENGTH idx[", y, "] is ", z.length, " should be ", numKeys, "z[0]", z[0]);
        }
      }

      result = {
        "type": type,
        "meta": meta,
        "keys": keys,
        "vals": vals,
        "objs": objs,
        "idx": idx
      };
      
      console.log("indexData result", result);
      
      return result;
    },

    getCalc = function getCalc(type, data) {

      console.log("getCalc", type, data);
      
      var vals = data.vals,
          idx = data.idx,
          meta = data.meta,
          numVals = vals.length,
          idxKeys = idx.keys,
          calc = meta.calc,
          
          SYMBOL_IDX = idxKeys[calc["symbol"]],
          ACTION_IDX = idxKeys[calc["action"]],
          AMOUNT_IDX = idxKeys[calc["amount"]],

          idxs = [],
          symbols = {},
          actions = {}, 
          amounts = {},

          keys = (meta.display[type] || data).keys,

          total = 0,

          val, symbol, action, amount, x;

      for (x=0; x<numVals; x++) {
        // row
        val = vals[x];
        //console.log("val", val);
        action = val[ACTION_IDX];
        //console.log("type", type, "action", action, "ACTION_IDX", ACTION_IDX);
        if (type === "All" || action.toLowerCase().indexOf(type.toLowerCase()) !== -1) {
          // save idx
          idxs.push(x);
          // get col vals
          symbol = val[SYMBOL_IDX];
          amount = val[AMOUNT_IDX];
          if (type === "All") {
            // init if necessary
            actions[action] = actions[action] || {"idxs":[]};
            actions[action].idxs.push(x);

          }
          // symbol
          symbols[symbol] = symbols[symbol] || {"idxs":[]};
          symbols[symbol].idxs.push(x);
          // amount by symbol
          amounts[symbol] = amounts[symbol] || 0;
          amounts[symbol] = addReal(amounts[symbol], amount);
          // total
          total = addReal(total, amount);
        }
      }

      // modify data
      data.idx.calc[type] = {
        "idxs": idxs,
        "keys": keys,
        "symbols": symbols,
        "actions": actions,
        "amounts": amounts,
        "_total": total
      };

      return data;
    },
    formatDateString = function formatDateString(str) {
      var parts = str.split("/")
      return parts.reduce(function(acc, part) {
        var digits = part < 10 ? ["0", part].join(app.CONST_NO_SPACE) : part;
        acc.push(part);
        return acc;
      }, []).join("/");
    },
    TD_ACTIONS = {
      "Sold": "Sell",
      "Bought": "Buy",
      "REBATE": "Rebate",
      "MONEY MARKET PURCHASE": "Cash Adjustment",
      "MONEY MARKET REDEMPTION": "Cash Adjustment",
      "FREE BALANCE INTEREST": "Credit Interest",
      "MONEY MARKET INTEREST": "Credit Interest",
      "ORDINARY DIVIDEND": "Dividend",
      "QUALIFIED DIVIDEND": "Dividend",
      "PARTNERSHIP DISTRIBUTION": "Dividend",
      "LONG TERM GAIN DISTRIBUTION": "Dividend",
      "CASH MOVEMENT OF INCOMING ACCOUNT TRANSFER": "IRA Receipt"
    },
    formats = {
      "scottrade": {
        // ["Symbol", "Quantity", "Price", "ActionNameUS", "TradeDate", "SettledDate", "Interest", "Amount", "Commission", "Fees", "CUSIP", "Description", "TradeNumber", "RecordType"]
        "ActionNameUS": {
          "key": "action",
          "val": function(data) {
            return data["ActionNameUS"];
          }
        },
        "RecordType": {
          "key": "type",
          "val": function(data) {
            return data["RecordType"];
          }
        },
        "SettledDate": {
          "key": "settle",
          "val": function(data) {
            return data["SettledDate"];
          }
        },
        "TradeDate": {
          "key": "trade",
          "val": function(data) {
            return formatDateString(data["TradeDate"]);
          }
        },
        "Commission": {
          "key": "commission",
          "val": function(data) {
            return data["Commission"] - 0;
          }
        }
      },
      // "&id,action,symbol,type,trade,settle,commision,fees,interest,quantity,price,amount"
      "tdameritrade": {
        // ["DATE", "TRANSACTION ID", "DESCRIPTION", "QUANTITY", "SYMBOL", "PRICE", "COMMISSION", "AMOUNT", "NET CASH BALANCE", "REG FEE", "SHORT-TERM RDM FEE", "FUND REDEMPTION FEE", "DEFERRED SALES CHARGE"]
        "DATE": {
          "key": "trade",
          "val": function(data) {
            return formatDateString(data["DATE"]);
          }
        },
        "TRANSACTION ID": {
          "key": "tradenumber",
          "val": function(data) {
            return ["TD", data["TRANSACTION ID"]].join("-");
          }
        },
        // ["IRA Receipt", "Credit Interest", "Buy", "Dividend", "Stock Dividend", "Sell", "Cash Adjustment"]
        "NET CASH BALANCE": {
          "key": "action",
          "val": function(data) {
            var desc = data["DESCRIPTION"],
              parts = desc.split(" "),
              action = parts.reduce(function(acc, val, idx) {
                return acc ? acc : (val = TD_ACTIONS[parts.slice(0,idx+1).join(" ")]) ? val : null;
              }, null);
            if (!action) {
              throw new app.Err("data", "unknown.action", {data:data});
            }
            return action;
          }
        },
        "REG FEE": {
          "key": "fees",
          "val": function(data) {
            return add(
              data["REG FEE"],
              data["SHORT-TERM RDM FEE"],
              data["FUND REDEMPTION FEE"],
              data["DEFERRED SALES CHARGE"]
            );
          }
        },
        "DEFERRED SALES CHARGE": {
          "key": false
        },
        "FUND REDEMPTION FEE": {
          "key": false
        },
        "SHORT-TERM RDM FEE": {
          "key": false
        },
        "COMMISSION": {
          "key": "commission",
          "val": function(data) {
            return data["COMMISSION"] - 0;
          }
        }
      }
    },
    formatDate = function formatDate(d) {
      return moment(d, 'MM/DD/YYYY').format();
    },
    transform = function transform(type, data) {
      var result = {},
        keys = Object.keys(data),
        format = formats[type];
      keys.forEach(function(key) {
        var match = format[key];
        if (match) {
          if (match.key) {
            result[match.key] = match.val(data);
          } else {
            // skip it...
          }
        } else {
          result[key.toLowerCase()] = data[key];
        }
      });
      // set-up data extras:
      result.date = formatDate(result.trade);
      return result;
    },
    ids = [],
    rows = [],
    byId = {},
    bySymbol = {},
    addRec = function(row) {
      var id = row.id,
        symbol = row.symbol;
      ids.push(id);
      rows.push(row);
      byId[id] = row;
      if (bySymbol[symbol]) {
        bySymbol[symbol].push(row);
      } else {
        bySymbol[symbol] = [row];
      }
    },
    recs = app.db.getAll(function(all) {
      console.log("recs", all);
      var num = all.length,
        x,row,id,symbol;
      for (x=0; x<num; x++) {
        row = all[x];
        addRec(row);
      }
      recs = all;
      api.ready = true;
    }),
    keccak = app.keccak.mode("SHAKE-128"),
    api = {
      "math": {
        "add": add,
        "sub": sub,
        "mul": mul,
        "div": div,
        "money": money
      },
      "sort": {
        "objs": function sort_objs(options) {
          var 
            num = options.length,
            dat = options.map(function(obj) {
              var 
                k = obj.key,
                v = obj.val || function(any) {
                  return any;
                },
                g = obj.dir === "desc" ? -1 : 1,
                l = g * -1,
                d = {
                  "key": k,
                  "val": v,
                  "gt": g,
                  "lt": l
                };
              return d;
            }),
            f = function(a,b,c) {
              var 
                d = dat[c || 0],
                k = d.key,
                v = d.val,
                one = v(a[k]),
                two = v(b[k]);
              if (one === two) {
                if (++c < num) {
                  return f(a,b,c);
                } else {
                  return 0;
                }
              } else if (one > two) {
                return d.gt;
              } else {
                return d.lt;
              }
            };
          return f;
        }
      },
      "ready": false,
      "find": function(by, val) {
        var result;
        switch(by) {
          case "symbol":
            if (val) {
              result = bySymbol[val.toUpperCase()];
            }
            break;
          default:
            result = rows;
            break;
        }
        return result || rows;
      },
      "get": {
        "ids": function () {
          return ids;
        },
        "calc": getCalc
      },
      "save": function(data) {
        var indexed = indexData(data),
          type = indexed.type,
          results = {
            "success": [],
            "error": [],
            "actions": []
          };
        //console.log("save", data, indexed, type);
        indexed.objs.forEach(function(obj, idx) {
          var row = transform(type, obj),
            str = JSON.stringify(row),
            id = keccak.init().update(str).digest(8),
            prev = ids.indexOf(id),
            result = {
              "id": id,
              "prev": prev,
              "obj": obj,
              "row": row
            };
          if (results.actions.indexOf(row.action) === -1) {
            results.actions.push(row.action);
          }
          row.id = id;
          if (prev === -1) {
            addRec(row);
            app.db.add(row);
            results.success.push(result);
          } else {
            results.error.push(result);
          }
        });
        return results;
      }
    };
  console.log("data-plugin", [].slice.call(arguments));
  return api;
});
