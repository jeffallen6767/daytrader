/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
Daytrader.plugin("topNav", function(app) {
  var state = app.state,
    gui = $("#topNav"),
    nav = gui.find("#topNavLinks"),
    active = nav.find("#topNavLinkActive"),
    srOnly = active.find(".sr-only"),
    inactive = nav.find("#topNavLinkInactive"),
    searchForm = gui.find("#search-form"),
    searchBox = gui.find("#search-box"),
    searchButton = gui.find("#search-button");
  active.removeAttr("id");
  srOnly.remove();
  inactive.removeAttr("id");
  // search box
  searchForm.submit(function(e) {
    var term = searchBox.val();
    console.log("search.form", term);
    e.preventDefault();
    searchBox.val("");
    app.next.state({
      "page": "symbol",
      "term": term
    });
  });
  /*
  searchButton.on("click", function(e) {
    var term = searchBox.val();
    console.log("search.click", term);
    e.preventDefault();
    app.next.state({
      "page": "symbol",
      "term": term
    });
    searchBox.val("");
  });
  */
  console.log("topNav-plugin", [].slice.call(arguments));
  return function() {
    console.log("topNav-run", [].slice.call(arguments));
    var pages = app.pages,
      list = pages.keys,
      page = state.get("page"),
      links = [];
    // top nav links
    list.forEach(function(id) {
      var meta = pages.get(id),
        title = meta.title,
        selected = page === id,
        el = (selected ? active : inactive).clone(),
        link = el.find("a");
      link.text(title);
      if (selected) {
        link.append(srOnly.clone());
      } else {
        link.on("click", function(event) {
          app.next.state({
            page: id
          });
        });
      }
      el.removeClass("hidden");
      links.push(el);
    });
    nav.empty().append(links);
  };
});
