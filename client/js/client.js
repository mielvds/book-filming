$(function(){
  
  $('#srt_submit').on('click', function(){
    sendFile('/subtitles', $(this).parent())
  });
  
  $('#epub_submit').on('click', function(){
    sendFile('/books', $(this).parent())
  });
  
  function sendFile(url, $elem) {
    var fd = new FormData();
    
    var file = $elem.children('.inputFile').get(0).files[0];
    fd.append('uploadingFile', file);
    fd.append('date', (new Date()).toString()); // req.body.date
    fd.append('comment', 'This is a test.'); // req.body.comment
    
    $.ajax({
      url: url,  //server script to process data
      type: 'POST',
      xhr: function() {  // custom xhr
        var myXhr = $.ajaxSettings.xhr();
        if(myXhr.upload){ // check if upload property exists
          myXhr.upload.addEventListener('progress',uploadProgress, false); // for handling the progress of the upload
          myXhr.addEventListener('abort', uploadCanceled, false);
        }
        return myXhr;
      },
      //Ajax events
      //beforeSend: beforeSendHandler,
      success: function (evt, textStatus, jqXHR) {
        uploadProgress(evt);
        var location = jqXHR.getResponseHeader('Location');
        var $link = $('<a class="file"/>').attr('href',location).html(file.name);
        var $close = $('<a />').attr('href', '#').html('x').on('click',function(){
          $elem.children('.file').remove();
          $elem.show();
        });
        
        var $div = $('<div class="file" />').append($link).append($close);
        
        $elem.hide();
        $elem.parent().prepend($div);
      },
      error: uploadFailed,
      // Form data
      data: fd,
      //Options to tell JQuery not to process data or worry about content-type
      cache: false,
      contentType: false,
      processData: false
    });
  }

  
  function createJob(name){
    var data = {
      name : name,
      subtitle : '',
      book : ''
    }
    $.ajax({
      url: '/jobs',
      type:'POST',
      success: function(evt, textStatus, jqXHR){
        var location = jqXHR.getResponseHeader('Location');
      }
    })
  }
 
  function uploadProgress(evt) {
    if(evt.lengthComputable) {
      var percentComplete = Math.round(evt.loaded * 100 / evt.total);
      $('#progress').text(percentComplete.toString() + '%');
    } 
  /*else {
      $('#progress').text('unable to compute');
    }*/
  }
 
  function uploadFailed(evt) {
    alert('There was an error attempting to upload the file.');
  }
 
  function uploadCanceled(evt) {
    alert('The upload has been canceled by the user or the browser dropped the connection.');
  }
  
});