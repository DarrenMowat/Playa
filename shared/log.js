var util = require('util');

exports.info = function(msg){
  util.log(msg);
};

exports.debug = function(msg){
  //util.log(msg);
};
exports.inspect = function(variable){
  util.log(util.inspect(variable));
};