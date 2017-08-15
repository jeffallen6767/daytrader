// transform keccak to Daytrader.plugin:
var fs = require('fs'),
  path = require('path'),
  ncp = require('ncp').ncp,
  file = fs.readFileSync("./node_modules/keccak-p-js/src/keccak.js", 'utf8'),
  wrapped = [
    "/*!",
     "* Daytrader v1.0.0",
     "* https://github.com/jeffallen6767/daytrader",
     "*",
     "* Copyright 2017 Jeffrey David Allen",
     "*/",
    "Daytrader.plugin('keccak', function(app) {",
    file.replace("module.exports = keccak;", "return keccak;"),
    "});",
    ""
  ].join("\n"),
  basePath = process.cwd(),
  
  what;

fs.writeFileSync("./public/js/keccak.js", wrapped);

// copy parts of font-awesome:
ncp("./node_modules/font-awesome", "./public/css/vendor", {
  rename: function(target) {
    var paths = [
      "public/css/vendor/css/font-awesome.min.css",
      "public/css/vendor/fonts/fontawesome-webfont.eot",
      "public/css/vendor/fonts/fontawesome-webfont.svg",
      "public/css/vendor/fonts/fontawesome-webfont.ttf",
      "public/css/vendor/fonts/fontawesome-webfont.woff",
      "public/css/vendor/fonts/fontawesome-webfont.woff2",
      "public/css/vendor/fonts/FontAwesome.otf"
    ].map(function(part) {
      return path.resolve(basePath, part);
    });
    return (paths.indexOf(target) !== -1) ? target : ":NO-MATCH:";
  }
}, function (err) {
  fs.rmdirSync("./public/css/vendor/less");
  fs.rmdirSync("./public/css/vendor/scss");
});