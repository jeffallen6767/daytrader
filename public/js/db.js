/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
Daytrader.plugin("db", function(app) {
  var state = app.state,
    db = new Dexie("daytrader_database"),
    schema = "id,action,symbol,type,trade,settle,commision,fees,interest,quantity,price,amount",
    api = {
      "schema": schema,
      "add": function(row) {
        db.events.add(row);
      },
      "bulkAdd": function(rows) {
        db.events.bulkAdd(rows);
      },
      "get": function(query, next) {
        return db.events.get(query).then(next);
      },
      "getIds": function(next) {
        return db.events.toCollection().keys(next);
      }
    };
  db.version(1).stores({
      // "&id,action,symbol,type,trade,settle,commision,fees,interest,quantity,price,amount"
      events: "&" + schema
  });
  console.log("db", [].slice.call(arguments));
  return api;
});
