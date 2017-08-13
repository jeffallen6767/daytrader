var fs = require('fs'),
  
  what;

// pkg keccak for web:
var file = fs.readFileSync("./node_modules/keccak-p-js/src/keccak.js", 'utf8');
//console.log("file", file);

var wrapped = [
"/*!",
 "* Daytrader v1.0.0",
 "* https://github.com/jeffallen6767/daytrader",
 "*",
 "* Copyright 2017 Jeffrey David Allen",
 "*/",
"Daytrader.plugin('keccak', function(app) {",
file.replace("module.exports = keccak;", "return keccak;"),
"});"
].join("\n");

fs.writeFileSync("./public/js/keccak.js", wrapped);
