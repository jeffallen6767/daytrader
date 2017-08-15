/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
Daytrader.plugin("display", function(app) {
  var state = app.state,
    cssMods = {
      "quantity": "pad-right",
      "price": "pad-right",
      "commission": "pad-right",
      "fees": "pad-right",
      "reg fee": "pad-right",
      "amount": "pad-right"
    },
    getDataTableOptions = function getDataTableOptions(type, data) {
      console.log("getDataTableOptions", type, data);
      var result;
      switch (type) {
        case "Dividend":
          result = {
            "order": [[ 0, "desc" ]]
          };
          break;
        case "All":
        default:
          result = {
            "order": [[ 0, "desc" ]],
            "columnDefs": [ {
              targets: data.idx.calc[type].keys.length - 1,
              render: $.fn.dataTable.render.ellipsis( 60, true )
            } ]
          };
          break;
      }
      return result;
    },
    domReplace = function domReplace(jqEl, jqContent) {
      return jqEl.empty().append(jqContent);
    },
    showMenu = function showMenu(data) {
      var indexedData = data.idx ? data : indexData(data);
      $('div.container').css({
        'width': '100%'
      });
      domReplace(
        $('div#content'), [
          getMenu({
            "- Select View -": "",
            "Data View": "Data",
            "Chart View": "Chart"
          }, indexedData, viewSelected),
          $('<div class="vertical-spacer"></div>'),
          $('<div id="view-sub-menu"></div>')
        ]
      );
    },
    getMenu = function getMenu(meta, data, next) {

      console.log("getMenu", meta, data);

      var keys = Object.keys(meta),
        numKeys = keys.length,
        menu = $('<select id="menu"></select>'),
        key,
        x;

      for(x=0; x<numKeys; x++) {
        key = keys[x];
        menu.append(
          $('<option value="' + key + '">' + key + '</option>')
        )
      }

      menu.change(function(evt) {
        var val = menu.val(),
          type = meta[val];
        next(type, data);
      });

      return menu;
    },
    viewSelected = function viewSelected(type, data) {
      console.log("viewSelected", type, data);
      domReplace(
        $('div#data'),
        $('<div></div>')
      );
      switch (type) {
        case "":
          domReplace(
            $('div#view-sub-menu'),
            $('<div></div>')
          );
          break;
        case "Data":
          domReplace(
            $('div#view-sub-menu'), [
              getMenu({
                "- Select Data View -": "",
                "All Info": "All",
                "Dividends": "Dividend"
              }, data, showData)
            ]
          );
          break;
        case "Chart":
          domReplace(
            $('div#view-sub-menu'), [
              getMenu({
                "- Select Chart View -": "",
                "All Info": "All",
                "Dividends": "Dividend"
              }, data, showChart)
            ]
          );
          break;
        default:
          console.log("ERROR: Unknown view selected", type, data);
          break;
      }
    },
    showData = function showData(type, data) {
      console.log("showData", type, data);
      if (!data.idx.calc[type]) {
        data = getCalc(type, data);
      }
      var table = showDataTable(type, data);
      domReplace(
        $('div#data'),
        table
      );
      table.DataTable(
        getDataTableOptions(type, data)
      );
    },
    showChart = function showChart(type, data) {
      console.log("showChart", type, data);
      if (!data.idx.calc[type]) {
        data = getCalc(type, data);
      }
      //TODO: make a chart...
    },
    getCssMod = function getCssMod(key) {
      var mod = cssMods[key.toLowerCase()];
      return mod ? ' class="' + mod + '"' : '';
    },
    showDataTable = function showDataTable(type, data) {
      
      console.log("showDataTable", type, data);

      var table = '<table class="display compact" cellspacing="0" width="100%">',
        thead = '<thead><tr>',
        tfoot = '<tfoot><tr>',
        tbody = '<tbody>',
        
        vals = data.vals,
        div = data.idx.calc[type],
        idxs = div.idxs,
        keys = div.keys,
        numKeys = keys.length,
        idxKeys = data.idx.keys,
        numIdxs = idxs.length,

        val, idx, key, v, w, x, y, z;

      // head/foot
      for (x=0; x<numKeys; x++) {
        key = keys[x];
        thead += '<th>' + key + '</th>';
        tfoot += '<th>' + key + '</th>';
      }
      thead = $(thead + '</tr></thead>');
      tfoot = $(tfoot + '</tr></tfoot>');

      // body
      for (x=0; x<numIdxs; x++) {
        idx = idxs[x];
        val = vals[idx];
        tbody += '<tr>';
        for (y=0; y<numKeys; y++) {
          key = keys[y];
          w = getCssMod(key);
          z = idxKeys[key];
          v = val[z];
          tbody += '<td' + w + '>' + v + '</td>';
        }
        tbody += '</tr>';
      }
      tbody = $(tbody + '</tbody>');
      table = $(table).append(thead,tfoot,tbody);
      
      return table;
    },
    
    api = {
      
    };
  
  // initDatePlugin
  $.fn.dataTable.moment('M/D/YYYY');
  console.log("display-plugin", [].slice.call(arguments));
  return api;
});
