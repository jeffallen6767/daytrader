/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
Daytrader.plugin("topNav", function(app) {
  var state = app.state,
    gui = $("#topNav"),
    active = gui.find("#topNavLinkActive"),
    srOnly = active.find(".sr-only"),
    inactive = gui.find("#topNavLinkInactive");
  active.removeAttr("id");
  srOnly.remove();
  inactive.removeAttr("id");
  return function() {
    console.log("topNav", [].slice.call(arguments));
    var pages = app.pages,
      list = pages.keys,
      page = state.get("page"),
      links = [];
    console.log("list", list);
    console.log("page", page);
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
          state.set('page', id);
          app.run();
        });
      }
      el.removeClass("hidden");
      links.push(el);
    });
    gui.empty().append(links);
  };
});
