var Log = exports;

var util = require('util');

Log.info = function(msg){
  util.print(msg);
};

Log.debug = function(msg){
  //util.log(msg);
};
Log.inspect = function(variable){
  util.log(util.inspect(variable));
};