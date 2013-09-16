/* 
 * Sync SRT and ePub chunks
 */

var dataAccess = require('./dataAccess.js'), 
natural = require('natural'), 
annotator = require('./annotator.js'),
jaccard = require('jaccard'),
async = require('async');

exports.synchronize = function(req, res) {
  console.log(req.params);
  var book_id = req.params.book;
  var subtitle_id = req.params.subtitle;
  
  

  dataAccess.findById('subtitles',function(subtitle){
    dataAccess.findById('books',function(book){
      //quote matches
      //      matchQuotes(book, subtitle, function(result){
      //        res.send(result);
      //      });
      if (!book || !subtitle) {
        res.send(404,"Does not exist");
      }else {
        matchEntities(book, subtitle, function(){
          res.send(result);
        });
      }
    },book_id);
  },subtitle_id);
  
  function matchQuotes(book, subtitle, callback){
    var result = [];
    
    var paragraphs = book.paragraphs;
    
    paragraphs.forEach(function(paragraph){
      if (paragraph.quotes){
        paragraph.quotes.forEach(function(quote){
          subtitle.entries.forEach(function(subtitle){
            var dist = natural.JaroWinklerDistance(quote,subtitle.text);
            if (dist > 0.9){
              
              var match = {
                distance: dist,
                paragraph: paragraph,
                entry: subtitle
                
              };
              result.push(match);
              console.log(match);
            }
          });
        });
      }
    });
      
    process.nextTick(function(){
      callback(result);
    });
  }
  
}

function matchEntities(book, subtitle, callback){
  var result = [];
    
  var subs = subtitle.entries;
  var paragraphs = book.paragraphs;
    
    
  /*
   * Using sliding window for this
   * 
   */
  var pWindow = 1;
  var sWindow = 3;
  
  function tag(i, entries, window,callback){
    var text = '';
    window = (entries.length - 1 - i) < window ? entries.length - 1 - i : window;
          
    for (var cursor = i; cursor < window;cursor++){
      text += entries[cursor].text;
      console.log(cursor);
    }
    
    
    console.log('text: '+text);
    
    console.log('Annotating...');
    annotator.annotate(text,function(entities){
      console.log('entry annotated');
      callback(entities);
    });
  }

  for (var i = 0; i < subs.length; i++){
    for (var j = 0; j < paragraphs.length; j++){
      console.log("i: " + i);
      tag(i, subs, sWindow, function(sEntities){
        console.log("j: "+ j);
        tag(j, paragraphs, pWindow, function(pEntities){
          var index = jaccard.index(sEntities, pEntities);
          
          var match = {
            distance: index,
            paragraph: paragraphs[j],
            entry: subs[i]
          };
          result.push(match);
          console.log("Similarity: "+index);
          
        });
      });
    }
  }

  process.nextTick(function(){
    callback(result);
  });

}
