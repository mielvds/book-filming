/* 
 * Functions to parse SRT and HTML files into digestable chunks
 */
var fs = require('fs'), 
epub = require('epub'),
htmlparser = require("htmlparser2"),
S = require('string');

var SECOND = 1000, MINUTE = 60 * SECOND, HOUR = 60 * MINUTE;             
var SRT_STATE_SUBNUMBER = 0, SRT_STATE_TIME = 1, SRT_STATE_TEXT= 2, SRT_STATE_BLANK =3;
 
exports.parseSRT = function(file, onSub, onEnd){
  function readLines(input, onSub, onEnd) {
    var remaining = '';
    var state   = SRT_STATE_SUBNUMBER,
    subNum  = 0,
    subText = '',
    subTime = '';

    input.on('data', function(data) {
      remaining += data;
      var index = remaining.indexOf('\n');
      var last  = 0;

      while (index > -1) {
        var line = remaining.substring(last, index);
        last = index + 1;

        switch(state) {
          case SRT_STATE_SUBNUMBER:
            if (line.trim() == '')
              break;
              
            subNum = line.trim();
            state  = SRT_STATE_TIME;
            break;

          case SRT_STATE_TIME:
            subTime = line.trim();
            state   = SRT_STATE_TEXT;
            console.log('t: ' + subTime)
            break;

          case SRT_STATE_TEXT:
            if (line.trim() == '') {
              var times = subTime.split(' --> ');
              
              function parseTime(timeString) {
                var chunks = timeString.split(":")
                , secondChunks = chunks[2].split(",")
                , hours = parseInt(chunks[0], 10)
                , minutes = parseInt(chunks[1], 10)
                , seconds = parseInt(secondChunks[0], 10)
                , milliSeconds = parseInt(secondChunks[1], 10)

                return HOUR * hours +
                MINUTE * minutes +
                SECOND * seconds +
                milliSeconds;
              }
              
              var sub = {
                number: subNum,
                startTime:parseTime(times[0]),
                stopTime:parseTime(times[1]),
                text:S(subText).stripTags().s
              };

              subText     = '';
              state       = SRT_STATE_SUBNUMBER;
              console.log(sub);
              onSub(sub);
            } else {
              subText += line;
              console.log('txt: '+subText);
            }
            break;
        }
        
        index = remaining.indexOf('\n', last);
      }

      remaining = remaining.substring(last);
    });

    input.on('end', function() {
      //      if (remaining.length > 0) {
      //        onSub(remaining);
      //      }
      onEnd();
    });
  }

  var input = fs.createReadStream(file);
  readLines(input, onSub, onEnd);
}

exports.parseEPUB = function(fileName, onChapter, onParagraph, onEnd){
  var imagewebroot = '/images/', chapterwebroot = '/chapters/';
  
  
  var parser = new epub(fileName, imagewebroot, chapterwebroot);
  //unzip
  parser.on('end', function(){
    // epub is now usable
    console.log(parser.metadata.title);

    parser.flow.forEach(function(chapter){
      console.log(chapter.id);
      parser.getChapter(chapter.id, function(err, text){
        console.log(chapter);
        //parse the object
        if (err) throw err;
        
        var paragraph = {}, index = 0;
        
        var parser = new htmlparser.Parser({
          onopentag: function(name, attribs){
            if(name === "p"){
              paragraph = {
                number: index++,
                chapter: chapter,
                text: ''
              };
            }
          },
          ontext: function(text){
            paragraph.text = S(text).stripTags().s;
            var pattern = /[“"].*?[”"]/gm;
            var matches = paragraph.text.match(pattern);

            if (matches){
                paragraph.quotes = matches;
            }
          },
          onclosetag: function(tagname){
            if(tagname === "p"){
              onParagraph(paragraph);
            }
          }
        });
        parser.write(text);
        parser.end();

        process.nextTick(function(){
          onChapter(chapter)
        });
        
      });
    });
    onEnd(parser.metadata);
  });
  parser.parse();
}