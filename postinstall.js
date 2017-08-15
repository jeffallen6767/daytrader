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
  paths = [
    "public/vendor/css/font-awesome.min.css",
    "public/vendor/fonts/fontawesome-webfont.eot",
    "public/vendor/fonts/fontawesome-webfont.svg",
    "public/vendor/fonts/fontawesome-webfont.ttf",
    "public/vendor/fonts/fontawesome-webfont.woff",
    "public/vendor/fonts/fontawesome-webfont.woff2",
    "public/vendor/fonts/FontAwesome.otf"
  ].map(function(part) {
    return path.resolve(basePath, part);
  });

// write the wrapped keccak plugin:
fs.writeFileSync("./public/vendor/js/keccak-plugin.js", wrapped);

// copy parts of font-awesome:
ncp("./node_modules/font-awesome", "./public/vendor", {
  rename: function(target) {
    return (paths.indexOf(target) !== -1) ? target : ":NO-MATCH:";
  }
}, function (err) {
  fs.rmdirSync("./public/vendor/less");
  fs.rmdirSync("./public/vendor/scss");
});