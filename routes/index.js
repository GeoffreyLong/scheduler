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
  priority: Number,
});

var Event = mongoose.model('events', EventSchema);

var express = require('express');
var app = express();

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded() ); // to support URL-encoded bodies

/* GET home page. */
app.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

app.get('/events/show', function(req,res) {
  Event.find().sort({priority: -1}).exec(function(error, response){
    // will want to res.send the response back
    res.render('showEvents', { events: response, script: '/javascripts/showEvents.js' });
  });
});

app.get('/event/:id', function(req,res){
  
});

app.post('/event/add', function(req,res) {
  console.log(req.body);
  new Event({name: req.body.name, priority: req.body.priority}).save(function(err,saved){
    if (err) res.status(500).send(err);
    res.status(200).end();
  });
});

app.get('/events/create', function(req,res) {
  res.render('newEvents', { title: 'Express', script: '/javascripts/newEvents.js' })
});

// Probably best to do this via post so that people
// can't delete things willy nilly
app.post('/event/remove', function(req,res){
  // The req comes in surrounded by quotes... have to watch for this
  var id = req.body.id.replace(/['"]+/g, '');
  Event.findByIdAndRemove(id, function(err, removed){
    if (err){
      console.log(err);
      res.status(500).send(err);
    }
    res.status(200).end();
  });
});

module.exports = app;
