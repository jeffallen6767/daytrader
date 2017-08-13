/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
Daytrader.plugin("signin", function(app) {
  var signin = function(next) {
    var gui = $('#signin'),
      jForm = gui.find('#signin-form'),
      button = gui.find('button'),
      inputEmail = gui.find('#inputEmail'),
      inputRemember = gui.find('#remember-me'),
      form = jForm[0],
      session = app.storage.session,
      cookie = app.storage.cookie;
    button.on("click", function(event) {
      var email = inputEmail.val(),
        remember = inputRemember.val();
      if (form.checkValidity() === false) {
        console.error("form invalid!");
        form.classList.add("was-validated");
      } else {
        form.classList.remove("was-validated");
        session.set('user', email);
        //next();
        console.log("remember", remember); 
      }
    });
    app.show(gui);
  };
  return signin;
});
