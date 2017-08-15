/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
Daytrader.plugin("signin", function(app) {
  console.log("signin-plugin", [].slice.call(arguments));
  return function(next) {
    var gui = $("#signin"),
      jForm = gui.find("#signin-form"),
      button = gui.find("button"),
      inputEmail = gui.find("#inputEmail"),
      inputRemember = gui.find("#remember-me"),
      form = jForm[0],
      state = app.state,
      storage = app.storage,
      cookie = storage.cookie;
    button.on("click", function(event) {
      var email = inputEmail.val(),
        remember = inputRemember.prop("checked");
      if (form.checkValidity() === false) {
        console.error("form invalid!");
        form.classList.add("was-validated");
      } else {
        form.classList.remove("was-validated");
        state.set("user", email);
        if (remember) {
          cookie.set("user", email);
        }
        next();
      }
    });
    console.log("signin-run", [].slice.call(arguments));
    app.show(gui);
  };
});
