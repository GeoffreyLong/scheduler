var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/scheduler', function (error) {
  if (error) {
      console.log(error);
  }
  else{
    console.log('Successfully Connected');
  }
});

var Schema = mongoose.Schema;
var EventSchema = new Schema({
  name: String,
});

var Event = mongoose.model('events', EventSchema);

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

var addEvent = function(name){
  new Event({name: name}).save();
}

var getAllEvents = function(){
  return Event.find(function(error, response){
    // will want to res.send the response back
    console.log(response);
  });
}

module.exports = router;
