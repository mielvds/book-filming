/* 
 * Feature extraction of chunks
 */

var AlchemyAPI = require('alchemy-api'), nerd = require('nerd4node');

exports.annotate = function(text, callback, service) {
  
  switch(service){
    case 'alchemy':
      exec_alchemy();
      break;
    case 'nerd':
    default:
      exec_nerd();
  }
  
  
  function exec_alchemy(){
    var alchemy = new AlchemyAPI('44b52273898606eb9e2a5d5c7674f77088cebec3');
    console.log(text);
    alchemy.entities(text, {}, function(err, response) {
      if (err) throw err;

      // See http://www.alchemyapi.com/api/entity/htmlc.html for format of returned object
      var entities = response.entities || [];
      console.log("Found "+entities.length + "entitities for " + text)
      process.nextTick(function(){
        callback(entities);
      });
    });
  }
  
  function exec_nerd(){
    nerd.annotate(
      'http://nerd.eurecom.fr/api/', 
      'avqd35l9pqdt0o0jg29olkfm34n96q7g', 
      'combined', 
      'text', 
      text, 
      'oen', 
      50*1000, 
      function(err, contents){
        if (err) throw err;
                  
        console.log(contents);
        process.nextTick(function(){
          callback(contents);
        });
      }
      );
  }

}

