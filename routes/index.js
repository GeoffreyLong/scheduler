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
    isComplete: Boolean,
    isRunning: Boolean,
    timeSheet: [{
        startTime: Number,
        endTime: Number,
    }],
    tag: String,
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

/* GET home page. */
app.get('/', function(req, res) {
  res.render('index', { title: 'Scheduler' });
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
      isComplete: false,
      isRunning: false,
      tag: req.body.tag,
  }).save(function(err,saved){
    if (err) res.status(500).send(err);
    res.status(200).end();
  });
});

app.get('/events/eventForm', function(req,res) {
  res.render('newEvents', { script: '/javascripts/newEvents.js' });
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
      isComplete: response.isComplete,
      isRunning: response.isRunning,
      tag: response.tag,
      script: '/javascripts/newEvents.js',
    });
  });
});

app.get('/events/show', function(req,res) {
  Event.find({isComplete : {$in : [false, null]}}).sort({priority: -1}).exec(function(error, response){
    // will want to res.send the response back
    res.render('showEvents', { events: response, script: '/javascripts/showEvents.js' });
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
                  'isComplete' : true}},
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

      console.log(timeSpent);
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
  Event.find({eventType : 'activity'}).sort({priority: -1}).exec(function(error, response){
    // will want to res.send the response back
    res.render('showActivities', { activities: response, script: '/javascripts/showActivities.js' });
  });
});

module.exports = app;
