var mongo = require('mongodb');
 
var Server = mongo.Server,
Db = mongo.Db,
BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {
  auto_reconnect: true
});
db = new Db('booksyncdb', server);
 
db.open(function(err, db) {
  if(!err) {
    console.log('Connected to "booksyncdb" database');
  }
});
 
exports.findById = function(collection, callback, id) {
  //var id = req.params.id;
  console.log('Retrieving from '+collection+': ' + id);
  db.collection(collection, function(err, collection) {
    collection.findOne({
      '_id':new BSON.ObjectID(id)
    }, function(err, item) {
      if (err) throw err;
      callback(item);
    });
  });
};
 
exports.findAll = function(collection,callback) {
  db.collection(collection, function(err, collection) {
    collection.find().toArray(function(err, items) {
      if (err) throw err;
      callback(items);
    });
  });
};

 
exports.addDocument = function(collection, callback, document) {
  //var document = req.body;
  console.log('Adding to '+collection+': ' + JSON.stringify(document));
  db.collection(collection, function(err, collection) {
    collection.insert(document, {
      safe:true
    }, function(err, result) {
      if (err)  throw err;
      callback(result[0]);
    });
  });
}

exports.updateDocument = function(collection, callback, id, document) {
  //var id = req.params.id;
  //var document = req.body;
  console.log('Updating in ' + collection + ': ' + id);
  db.collection(collection, function(err, collection) {
    collection.update({
      '_id':new BSON.ObjectID(id)
    }, document, {
      safe:true
    }, function(err, result) {
      if (err) throw err; 
      console.log('' + result + ' document(s) updated');
      callback(result, document);
      
    });
  });
}

 
exports.deleteDocument = function(collection, callback, id) {
  //var id = req.params.id;
  console.log('Deleting from '+collection+': ' + id);
  db.collection(collection, function(err, collection) {
    collection.remove({
      '_id':new BSON.ObjectID(id)
    }, {
      safe:true
    }, function(err, result) {
      if (err) throw err;
      
      console.log('' + result + ' document(s) deleted');
      callback(result, document);
      
    });
  });
}
