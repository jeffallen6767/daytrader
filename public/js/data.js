// Daytrader data.js - (c) 2017 Jeffrey David Allen

// avoid problems like: 0.01 + 0.06  //0.06999999999999999
function addReal(a, b) {
  return Math.round((a + b) * 1e12) / 1e12;
}

function parseCsv(text) {
  console.log('text');
  console.log(text);
  var results = Papa.parse(text, {
    dynamicTyping: true
  });
  console.log('results of Papa.parse');
  console.log(results);
  return results;
}

function cleanKeys(keys) {
  var result = keys.map(function(x) {
    return x.trim();
  });
  console.log('cleanKeys', keys, result);
  return result;
}

var brokerIds = {
  "SQPATSIACFCDTR": "scottrade",
  "DTDQSPCANRSFD": "tdameritrade"
};

var metaData = {
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
};

function findTypeByKeys(keys) {
  var id = keys.map(function(key) {
      return key.slice(0,1);
    }).join(""),
    type = brokerIds[id];
  console.log("findTypeByKeys", keys, id, type);
  return type;
}

function findMetaByType(type) {
  var meta = metaData[type];
  console.log("findMetaByType", type, meta);
  return meta;
}

function indexData(data) {

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
      objs.push(w);
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
}

function getCalc(type, data) {

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
}

