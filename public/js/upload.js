// Daytrader upload.js - (c) 2017 Jeffrey David Allen

// Check for the various File API support.
var doItAllClientSide = (window.File && window.FileReader && window.FileList && window.Blob) ? true : false;

// to test server side on modern browser:
//doItAllClientSide = false;

console.log("doItAllClientSide");
console.log(doItAllClientSide);

var uploader = doItAllClientSide ? ClientSideFileUpload : ServerSideFileUpload;

$('.upload-btn').on('click', function () {
    $('#upload-input').click();
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
});

$('#upload-input').on('change', function() {
  var files = $(this).get(0).files;
  console.log(files);
  if (files.length > 0) {
    uploader(files);
  }
});

function updateProgress(evt) {
  if (evt.lengthComputable) {
    // calculate the percentage of upload completed
    var percentComplete = evt.loaded / evt.total;
    percentComplete = parseInt(percentComplete * 100);

    // update the Bootstrap progress bar with the new percentage
    $('.progress-bar').text(percentComplete + '%');
    $('.progress-bar').width(percentComplete + '%');

    // once the upload reaches 100%, set the progress bar text to done
    if (percentComplete === 100) {
      $('.progress-bar').html('Done');
    }
  }
}

function ServerSideFileUpload(files) {

    // create a FormData object which will be sent as the data payload in the
    // AJAX request
    var formData = new FormData();

    // loop through all the selected files and add them to the formData object
    for (var i = 0; i < files.length; i++) {
      var file = files[i];

      // add the files to formData object for the data payload
      formData.append('uploads[]', file, file.name);
    }

    $.ajax({
      url: '/upload',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(data){
          console.log('upload successful!');
          console.log(data);
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
        xhr.upload.addEventListener('progress', updateProgress, false);

        return xhr;
      }
    });
  
}

function ClientSideFileUpload(files) {
  for (var i = 0; i < files.length; i++) {
    var file = files[i];

    var reader = new FileReader();
    reader.onProgress = function(evt) {
      console.log('reader.onprogress');
      console.log(evt);
      updateProgress(evt);
    };
    reader.onload = function(evt) {
      console.log('reader.onload');
      console.log(evt);
      updateProgress(evt);
      var result = evt.currentTarget.result;
      handleData(result);
    };
    reader.readAsText(file);
  }
}

function handleData(text) {
  var result = parseCsv(text),
    meta = result.meta,
    errs = result.errors,
    data = result.data;

  if (meta.aborted) {
    console.log("parseCsv aborted...");
    console.log(result);
  } else if (errs.length) {
    console.log("parseCsv errors...");
    console.log(result);
  } else {
    initDisplay(data);
  }
}