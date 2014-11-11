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
    isRunning: Boolean,
    timeSheet: [{
        startTime: Number,
        endTime: Number,
    }],
    tag: String,
    completedOn: Date,
});
var TagSchema = new Schema({
    name: String,
})

var Event = mongoose.model('events', EventSchema);
var Tag = mongoose.model('tags', TagSchema);

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded() ); // to support URL-encoded bodies


// Used in rendering the event layouts
// Currently either 'flat' or 'hierarchical'
// Default is flat
var eventView = 'flat';

/* GET home page. */
app.get('/', function(req, res) {
  res.render('index', { title: 'Scheduler' });
});

// Will eventually want to use this function
// Could pass in a req which would choose how it is sorted
app.get('/events', function(req, res){
  Event.find().sort({'timeSheet.startTime': -1}).exec(function(error, response){

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
      isRunning: false,
      tag: req.body.tag,
  }).save(function(err,saved){
    if (err) res.status(500).send(err);
    res.status(200).end();
  });
});


// Could wrap update and create into one with 
// a simple upsert = true in the params
// and a change to update instead of findByIdAndUpdate
app.post('/event/update', function(req,res) {
  console.log(req.body);
  Event.findByIdAndUpdate(req.body.id, 
                          {$set: {
                                    "eventType": req.body.eventType,
                                    "name": req.body.name, 
                                    "priority": req.body.priority,
                                    "description": req.body.description,
                                    "dueDate": req.body.dueDate,
                                    "expectedDuration": req.body.expectedDuration,
                                    "startDate": req.body.startDate,
                                    "endDate": req.body.endDate,
                                    "recurranceInterval": req.body.recurranceInterval,
                                    "tag": req.body.tag
                                 }},
                          function(error, response){
    if (error){
      console.log(error);
      res.status(500).send(error);
    }
    res.status(200).end();
  });
});

// Probably best to do this via post so that people
// can't delete things willy nilly
app.post('/event/delete', function(req,res){
  // The req comes in surrounded by quotes... have to watch for this
  Event.findByIdAndRemove(req.body.id, function(err, removed){
    if (err){
      console.log(err);
      res.status(500).send(err);
    }
    res.status(200).end();
  });
});

app.get('/events/eventForm/:id', function(req,res){
  if (req.params.id == "new"){
    res.render('newEvents', { script: '/javascripts/newEvents.js' });
  }
  else{
    Event.findById(req.params.id, function(err, response){
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
        isRunning: response.isRunning,
        tag: response.tag,
        completedOn: response.completedOn,
        script: '/javascripts/newEvents.js',
      });
    });
  }
});

app.get('/events/show', function(req,res) {
  Event.find({completedOn: {$in : [null]}, eventType: {$ne : 'activity'}}).sort({priority: -1}).exec(function(error, response){
    // will want to res.send the response back
    console.log(error);
    res.render('showEvents', { events: response, viewType: eventView, script: '/javascripts/showEvents.js' });
  });
});

// Sort not working properly
app.get('/events/completed', function(req,res) {
  Event.find({completedOn : {$nin: [null]}}).sort({'completedOn': -1}).exec(function(error, response){
    // will want to res.send the response back
    res.render('showEvents', { events: response, viewType: eventView, script: '/javascripts/showEvents.js' });
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

app.get('/events/running', function(req, res){
  Event.find({isRunning: true}, function(error, response){
    if (error){
      console.log(error);
      res.status(500).send(error);
    }
    res.status(200).send(response);
  });
});

app.post('/event/action/start', function(req, res){
  Event.findByIdAndUpdate(req.body.id, 
                          {$push:{"timeSheet":{startTime:req.body.time, 
                                                endTime:-1}}},
                          {safe: true, upsert: true},
                          function(error, response){
    if (error){
      console.log(error);
      res.status(500).send(error);
    }
    response.isRunning = true;
    response.save();
    res.status(200).end();
  });
});

app.post('/event/action/pause', function(req, res){
  Event.update({'_id' : req.body.id,'timeSheet.endTime' : -1}, 
                {'$set': {'timeSheet.$.endTime': req.body.time}, 'isRunning' : false},
                function(error, response){
    if (error){
      console.log(error);
      res.status(500).send(error);
    }
    res.status(200).end();
  });
});


// See if I can do this in one query
app.post('/event/action/complete', function(req, res){
  Event.update({'_id' : req.body.id,'timeSheet.endTime' : -1}, 
                {'$set': {'timeSheet.$.endTime': req.body.time}, 
                  'isRunning' : false},
                function(error, response){
    if (error){
      console.log(error);
      res.status(500).send(error);
    }
  });
  Event.findByIdAndUpdate(req.body.id,
                  {'$set': {'isRunning' : false,
                  'completedOn' : req.body.time}},
                function(error, response){
    if (error){
      console.log(error);
      res.status(500).send(error);
    }
    res.status(200).end();
  });
});

app.post('/event/action/uncomplete', function(req, res){
  Event.findByIdAndUpdate(req.body.id,
                  {'$set': {'completedOn' : null}},
                function(error, response){
    if (error){
      console.log(error);
      res.status(500).send(error);
    }
    res.status(200).end();
  });
});


//Extend to things like tag aggregation
app.post('/event/metric/timespent', function(req, res){
  // TODO change this to an aggregate
  /*
  Event.aggregate({$match : {_id : req.body.id}},
                  {total : {$sum : {$cond : {if : {$gte: ["$endTime",1]},
                                            then: "$endTime" - "$startTime",
                                            else: 0}}}},
  */
  Event.findById(req.body.id, function(error, response){
      if (error){
        console.log(error);
        res.status(500).send(error);
      }
      var total = 0;

      if (response.timeSheet){
        response.timeSheet.forEach(function(time){
          if (time.endTime == -1) time.endTime = req.body.time;
          var difference = time.endTime - time.startTime;
          console.log(difference);
          total += difference;
        });
      }
      data = {};
      data.total = total;
      // returns total time spent in milliseconds
      res.status(200).send(data);
    });
});

app.post('/event/metric/eventTime', function(req, res){
  // TODO change this to an aggregate
  Event.find({$or: [{'timeSheet.endTime' : {$gte : req.body.time}}, 
                    {'timeSheet.endTime' : -1}]}, function(error, response){
      if (error){
        console.log(error);
        res.status(500).send(error);
      }
      var timeSpent = [];

      response.forEach(function(elm){
        var curElm = {};
        curElm.tags = elm.tags;
        curElm.name = elm.name;
        var curTime = 0;
        elm.timeSheet.forEach(function(times){
          var endTime = times.endTime;
          var startTime = times.startTime;
          if (endTime == -1) endTime = req.body.curTime;
          if (startTime < req.body.time) startTime = req.body.time;
          if (endTime >= req.body.time){
            curTime += (endTime - startTime);
          }
        });
        curElm.time = curTime;
        timeSpent.push(curElm);
      });

      res.status(200).send(timeSpent);
    });
});

app.post('/event/tags', function(req, res){
  Tag.find().exec(function(error, response){
    if (error){
      console.log(error);
      res.status(500).send(error);
    }
    res.status(200).send(response);
  });
});

app.post('/event/tag/create', function(req, res){
  console.log(req.body);
  new Tag({
    name : req.body.name,
  }).save(function(err,saved){
    if (err) res.status(500).send(err);
    res.status(200).end();
  });  
});

app.get('/activities/show', function(req, res){
  //TODO change the sorting
  Event.find({eventType : 'activity'}).sort({'timeSheet.startTime': -1}).exec(function(error, response){
    // will want to res.send the response back
    res.render('showEvents', { events: response, viewType: eventView, script: '/javascripts/showEvents.js' });
  });
});

// TODO fix all this event vs activity logic
app.get('/events/recent', function(req, res){
  Event.find({'timeSheet.startTime':{$gte:0}}).sort({'timeSheet.startTime': -1}).limit(10).exec(function(error, response){
    // will want to res.send the response back
    console.log(response);
    response.forEach(function(elm){
      elm.priority = 0;
    });
    res.render('showEvents', { events: response, viewType: eventView, script: '/javascripts/showEvents.js' });
  });
});

// TODO put into user schema when we have one
app.post('/events/viewType', function(req,res){
  eventView = req.body.viewType;
});

module.exports = app;
