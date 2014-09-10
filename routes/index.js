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
    eventType: String,
    name: String,
    priority: Number,
    dateCreated: Date,
    description: String,
    dueDate: Date,
    expectedDuration: Number,
    startDate: Date,
    endDate: Date,
    recurranceInterval: String,
});

var Event = mongoose.model('events', EventSchema);

var express = require('express');
var app = express();

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded() ); // to support URL-encoded bodies

/* GET home page. */
app.get('/', function(req, res) {
  res.render('index', { title: 'Scheduler' });
});

app.get('/events/show', function(req,res) {
  Event.find().sort({priority: -1}).exec(function(error, response){
    // will want to res.send the response back
    res.render('showEvents', { events: response, script: '/javascripts/showEvents.js' });
  });
});

app.get('/event/:id', function(req,res){
  
});

app.post('/event/create', function(req,res) {
  console.log(req.body);
  new Event({
      eventType: req.body.eventType,
      name: req.body.name, 
      priority: req.body.priority,
      dateCreated: req.body.dateCreated,
      description: req.body.description,
      dueDate: req.body.dueDate,
      expectedDuration: req.body.expectedDuration,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      recurranceInterval: req.body.recurranceInterval,
  }).save(function(err,saved){
    if (err) res.status(500).send(err);
    res.status(200).end();
  });
});

app.get('/events/eventForm', function(req,res) {
  res.render('newEvents', { script: '/javascripts/newEvents.js' })
});

// Probably best to do this via post so that people
// can't delete things willy nilly
app.post('/event/delete', function(req,res){
  // The req comes in surrounded by quotes... have to watch for this
  Event.findByIdAndRemove(req.params.id, function(err, removed){
    if (err){
      console.log(err);
      res.status(500).send(err);
    }
    res.status(200).end();
  });
});

app.get('/event/update/:id', function(req,res){
  Event.findByIdAndRemove(req.params.id, function(err, response){
    if (err){
      console.log(err);
      res.status(500).send(err);
    }

    res.render('newEvents', {
      eventType: response.eventType,
      name: response.name,
      priority: response.priority,
      description: response.description,
      dueDate: response.dueDate,
      expectedDuration: response.expectedDuration,
      startDate: response.startDate,
      endDate: response.endDate,
      recurranceInterval: response.recurranceInterval,
      script: '/javascripts/newEvents.js',
    });
  });
});



app.get('/calendar/month', function(req, res){
  res.render('showMonth', { script: '/javascripts/showMonth.js' });
});

app.get('/calendar/week', function(req, res){
  res.render('showWeek', { script: '/javascripts/showWeek.js' });
});

app.get('/calendar/day', function(req, res){
  res.render('showDay', { script: '/javascripts/showDay.js' });
});


module.exports = app;
