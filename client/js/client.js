$(function(){
  
  var mf_base_uri = 'http://ninsuna-test.elis.ugent.be:8080/Media/Booksync/GOTE01.mp4?track=2;4&';
  
  $('#player .contents').jPlayer({
    ready: function () {},
    errorAlerts: true,
    swfPath: "",
    supplied: "m4v"
  });
  
  getBooks();
  getSubtitles();
  
  $('#subtitle .subject select').on('change', getSubtitle);
  $('#book .subject select').on('change', getBook);
  
  
  $('#srt_submit').on('click', function(){
    sendFile('/subtitles', $(this).parent())
  });
  
  $('#epub_submit').on('click', function(){
    sendFile('/books', $(this).parent())
  });

  var OSX = {
    container: null,
    init: function () {
      $("input.files").click(function (e) {
        e.preventDefault();	

        $("#osx-modal-content").modal({
          overlayId: 'osx-overlay',
          containerId: 'osx-container',
          closeHTML: null,
          minHeight: 80,
          opacity: 65, 
          position: ['0',],
          overlayClose: true,
          onOpen: OSX.open,
          onClose: OSX.close
        });
      });
    },
    open: function (d) {
      var self = this;
      self.container = d.container[0];
      d.overlay.fadeIn('slow', function () {
        $("#osx-modal-content", self.container).show();
        var title = $("#osx-modal-title", self.container);
        title.show();
        d.container.slideDown('slow', function () {
          setTimeout(function () {
            var h = $("#osx-modal-data", self.container).height()
            + title.height()
            + 20; // padding
            d.container.animate(
            {
              height: h
            }, 
            200,
            function () {
              $("div.close", self.container).show();
              $("#osx-modal-data", self.container).show();
            }
            );
          }, 300);
        });
      })
    },
    close: function (d) {
      var self = this; // this = SimpleModal object
      d.container.animate(
      {
        top:"-" + (d.container.height() + 20)
      },
      500,
      function () {
        self.close(); // or $.modal.close();
      }
      );
    }
  };

  OSX.init();
  
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

  function getBooks(){
    $.ajax({
      url: '/books',
      type:'GET',
      success: function(result){
        var options = $('#book .subject select');
        var selected = true;
        $.each(result, function() {
          options.append($("<option />").val(this._id).attr('selected',selected).text(this.name));
          selected = false;  
        });
        getBook();
        
      }
    });
  }
  
  function getSubtitles(){
    $.ajax({
      url: '/subtitles',
      type:'GET',
      success: function(result){
        var options = $('#subtitle .subject select')
        $.each(result, function() {
          options.append($("<option />").val(this._id).text(this.name));
        });
        getSubtitle();
      }
    });
  }
  
  function getSubtitle(){
    $.ajax({
      url: '/subtitles/' + $('#subtitle .subject select option').filter(":selected").val(),
      type:'GET',
      success: function(result){
        if (result.entries){
          var $contents = $('#subtitle .contents');
          $.each(result.entries, function() {
            var mf_url = mf_base_uri + 't=' + this.startTime/1000 + ','+this.stopTime/1000 ;
          
            var $entry = $('<div />').addClass('entry').data('mf',mf_url).html(this.text);
            $entry.on('click',function(){
              $('#player .contents').jPlayer("setMedia", {
                m4v: $(this).data('mf')
              }).jPlayer("play");
            
            });
          
            $contents.append($entry);
          });
        }
      }
    });
  }
  
  function getBook(){
    $.ajax({
      url: '/books/' + $('#book .subject select option').filter(':selected').val(),
      type:'GET',
      success: function(result){
        if (result.paragraphs){
          var $contents = $('#book .contents');
          $.each(result.paragraphs, function() {
            var $entry = $('<div />').addClass('entry').html(this.text);
            $contents.append($entry);
          });
        }
      }
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