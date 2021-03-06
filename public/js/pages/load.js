/*!
 * Daytrader v1.0.0
 * https://github.com/jeffallen6767/daytrader
 *
 * Copyright 2017 Jeffrey David Allen
 */
Daytrader.plugin("load", function(app) {
  var state = app.state,
    gui = $("#load"),
    progressBar = gui.find(".progress-bar"),
    uploadButton = gui.find(".upload-btn"),
    uploadInput = gui.find("#upload-input"),
    parseCsv = function parseCsv(text) {
      //console.log('text');
      //console.log(text);
      var results = Papa.parse(text, {
        dynamicTyping: true
      });
      //console.log('results of Papa.parse');
      //console.log(results);
      return results;
    },
    updateProgress = function updateProgress(evt) {
      if (evt.lengthComputable) {
        // calculate the percentage of upload completed
        var percentComplete = evt.loaded / evt.total;
        percentComplete = parseInt(percentComplete * 100);
        // update the Bootstrap progress bar with the new percentage
        progressBar.text(percentComplete + "%");
        progressBar.width(percentComplete + "%");
        // once the upload reaches 100%, set the progress bar text to done
        if (percentComplete === 100) {
          progressBar.html("Done");
        }
      }
    },
    resetProgress = function() {
      progressBar.text("0%");
      progressBar.width("0%");
    },
    ServerSideFileUpload = function ServerSideFileUpload(files) {
      // create a FormData object which will be sent as the data payload in the
      // AJAX request
      var formData = new FormData();
      // loop through all the selected files and add them to the formData object
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        // add the files to formData object for the data payload
        formData.append("uploads[]", file, file.name);
      }
      $.ajax({
        url: "/upload",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function(data){
          //console.log("upload successful!");
          //console.log(data);
          var files = data.files;
          var keys = Object.keys(files);
          keys.forEach(function(key) {
            var result = files[key];
            handleData(result);
          });
        },
        xhr: function() {
          // create an XMLHttpRequest
          var xhr = new XMLHttpRequest();
          // listen to the 'progress' event
          xhr.upload.addEventListener("progress", updateProgress, false);
          return xhr;
        }
      });
    },
    ClientSideFileUpload = function ClientSideFileUpload(files) {
      //console.log("clientsidefileupload", files);
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var reader = new FileReader();
        reader.onProgress = function(evt) {
          //console.log("reader.onprogress");
          //console.log(evt);
          updateProgress(evt);
        };
        reader.onload = function(evt) {
          //console.log("reader.onload");
          //console.log(evt);
          updateProgress(evt);
          var result = evt.currentTarget.result;
          handleData(result);
        };
        reader.readAsText(file);
      }
    },
    handleData = function handleData(text) {
      //console.log("load.handleData", text);
      var result = parseCsv(text),
        meta = result.meta,
        errs = result.errors,
        data = result.data;

      if (meta.aborted) {
        throw new app.Err("load", "parseCsv.meta.aborted", {text:text,result:result});
      } else if (errs.length) {
        throw new app.Err("load", "parseCsv.meta.errors", {text:text,result:result});
      } else {
        var results = app.data.save(data);
        //console.log("app.data.save.results", results);
        resetProgress();
        app.next.state({
          page: "home"
        });
      }
    },
    // Check for the various File API support.
    doItAllClientSide = (window.File && window.FileReader && window.FileList && window.Blob) ? true : false,
    uploader = doItAllClientSide ? ClientSideFileUpload : ServerSideFileUpload;
  
  uploadButton.on("click", function () {
    uploadInput.click();
  });

  uploadInput.on("change", function() {
    var files = this.files;
    //console.log("uploadInput.change", files);
    if (files.length > 0) {
      uploader(files);
    }
    this.value = "";
  });
  
  // register this page:
  app.pages.set("load", {
    "title": "Load"
  });

  return function() {
    //console.log("load", [].slice.call(arguments));
    resetProgress();
  };
});
