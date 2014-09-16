$(document).ready(function(){
  $('.event').click(function(){
    // Hacky workaround
    var curHeight = $(this).height();
    if (!$(this).hasClass("expand")){
      $(this).toggleClass("expand");
      var autoHeight = $(this).css('height', 'auto').height();
      $(this).height(curHeight).animate({height: autoHeight}, 200);
    }
    else{
      // This is the height we want it to be eventually
      $(this).toggleClass("expand");
      var endHeight = $(this).css('height', 'auto').height();
      $(this).toggleClass("expand");
      $(this).height(curHeight).animate({height: endHeight}, 200, function(){
        $(this).toggleClass("expand");
      });
    }
  });

  var allTags = [];
  $.ajax({
    type: 'POST',
    contentType: 'application/json',
    url: 'http://localhost:3000/event/tags',
    statusCode: {
      200: function(data) {
        data.forEach(function(elm){
          allTags.push(elm.name);
        });
      },
      400: function() {
        alert("Didn't work");
      }
    }
  });

  // Will return the time spent on all events
  var todaysMetrics = function(){
    var data = {};
    
    var date = new Date();
    date.setMinutes(0);
    date.setHours(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    data.time = Date.parse(date);
    data.curTime = Date.now();

    console.log(data.time);
    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: 'http://localhost:3000/event/metric/eventTime',
      statusCode: {
        200: function(data) {
          var date = new Date();
          date.setHours(0);
          date.setMinutes(0);
          date.setSeconds(0);
          date.setMilliseconds(0);
          var hoursSoFar = Date.now() - Date.parse(date);
          
          var table = $('#todayMetricsTable');
          var appendString = '';
          data.forEach(function(dataPt){
            var timeSpentToday = (100*dataPt.time / hoursSoFar);
            
            
            appendString += '<tr><td style="width:200px">';
            appendString += dataPt.name;
            appendString += '</td><td><div style="background: #000000; height:12px; width:';
            appendString += timeSpentToday;
            appendString += '%"></div></td><td style="width:30px">';
            appendString += parseInt(timeSpentToday*10) / 10 + '%';
            appendString += '</td></tr>';
          });
          table.append(appendString);
        },
        400: function() {
          alert("Didn't work");
        }
      }
    });
  }; todaysMetrics();

  var tagBreakDown = function(){
    allTags.forEach(function(elm){
      var tagPieces = elm.split('.');
      var fullTag = "";
      var ul = $('#tempTagBreakdown');
      tagPieces.forEach(function(inner){
        fullTag += inner;
        console.log(fullTag);
        var newUl = $(ul).find('ul[data-tag="' + fullTag + '"]');
        if (newUl.length !== 0){
          console.log(newUl);
          ul = newUl;
        }
        else{
          ul.append('<li>' + inner + '</li>');
          ul.append('<ul data-tag="' + fullTag +'">');
        }
      });
    });
  };


  $('.deleteEvent').click(function(e){
    e.stopPropagation();
    var event = $(this).parent().parent();
    var id = event.attr("data-id");
    console.log('Remove clicked, event_id = ' + id);      
    var data = {};
    data.id = id;

    if (window.confirm("Delete this event?")){
      $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: 'http://localhost:3000/event/delete',
        statusCode: {
          200: function() {
            /*alert("Successfully added").delay(1000).fadeOut(function() {
                $(this).remove();
            }); */         
            var ul = $('#runningEvents');
            ul.find('li[data-id="' + id + '"]').remove();
            if (ul.find("li").length == 0){
              $('#runningLabel').addClass("hide");
            }
            else{
              $('#runningLabel').removeClass("hide");
            }            
            event.removeClass("expand");
            event.fadeOut(1000, function(){ 
              $(this).remove();
            });
          },
          500: function() {
            alert("Didn't work");
          }
        }
      });
    }
  });

  $('.updateEvent').click(function(e){
    e.stopPropagation();
    var event = $(this).parent().parent();
    var id = event.attr("data-id");
    console.log('update clicked, event_id = ' + id);      
    window.location.replace("http://localhost:3000/event/update/" + id);
  });

  $('.startEvent').click(function(e){
    e.stopPropagation();
    var event = $(this).parent().parent();
    if (!event.hasClass('running')){
      var id = event.attr("data-id");
      console.log('Starting event, event_id = ' + id);      
      var data = {};
      data.id = id;

      // Mongoose or express might be overriding the Date package
      // At any rate it is not putting back UTC timestamps
      // So it is easier to pass it back (and possibly better insofar as accuracy)
      data.time = Date.now();
      $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: 'http://localhost:3000/event/action/start',
        statusCode: {
          200: function() {
            event.addClass('running');
            event.find('.pauseEvent').removeClass('disabledButton');
            event.find('.startEvent').addClass('disabledButton');
            event.prepend('<span class="fa fa-bolt"></span>');
            $('#runningLabel').removeClass("hide");

            // Prepopulating this with 0s doesn't fix the timeElapsed bug
            // It initialized with 0s, then it dissapears and reinitializes
            var li = "<li class='runningEvent' data-id='"
              + id + "' data-startTime = " + data.time + ">" + event.find('.name').text() 
              + "<span style='font-weight:bold'> Time Elapsed: </span>"
              + "<span class='timeElapsed'>  </span>"
              + "<span class='topPause fa fa-pause' style='margin:0; padding:0'> </span></li>";
            $('#runningEvents').append(li);
          },
          500: function() {
            alert("Didn't work");
          }
        }
      });
    }
  });

  $('.pauseEvent').click(function(e){
    e.stopPropagation();
    var event = $(this).parent().parent();
    if (event.hasClass('running')){
      var id = event.attr("data-id");
      console.log('Pausing event, event_id = ' + id);      
      var data = {};
      data.id = id;

      // Mongoose or express might be overriding the Date package
      // At any rate it is not putting back UTC timestamps
      // So it is easier to pass it back (and possibly better insofar as accuracy)
      data.time = Date.now();
      $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: 'http://localhost:3000/event/action/pause',
        statusCode: {
          200: function() {
            event.removeClass('running');
            event.find('.pauseEvent').addClass('disabledButton');
            event.find('.startEvent').removeClass('disabledButton');
            event.find('.fa-bolt').remove();
            var ul = $('#runningEvents');
            ul.find('li[data-id="' + id + '"]').remove();
            if (ul.find("li").length == 0){
              $('#runningLabel').addClass("hide");
            }
            else{
              $('#runningLabel').removeClass("hide");
            }            
          },
          500: function() {
            alert("Didn't work");
          }
        }
      });
    }
  });

  // Should add other metrics here
  $('.metrics').click(function(e){
    e.stopPropagation();
    var event = $(this).parent();
    var eventWrapper = event.parent();
    var metrics = eventWrapper.find('.eventMetrics');
    metrics.toggleClass("show");

    if (metrics.hasClass("show")){
      var id = event.attr("data-id");
      console.log('Sum event, event_id = ' + id);      
      var data = {};
      data.id = id;
      data.time = Date.now();
      $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: 'http://localhost:3000/event/metric/timespent',
        statusCode: {
          200: function(data) {
            var ms = data.total;
            var secs = parseInt(ms / 1000) % 60;
            var mins = parseInt(ms / (60 * 1000)) % 60;
            var hours = parseInt(ms / (60 * 60 * 1000));

            var spentString = "";

            if (hours != 0) spentString += hours + "h";
            if (mins != 0) spentString += mins + "m";
            if (secs != 0) spentString += secs + "s";

            if (spentString == "") spentString = "Not Started";

            metrics.find('#timeSpent').text(spentString);
          },
          500: function() {
            alert("Didn't work");
          }
        }
      });
    }
  });

  $('.completeEvent').click(function(e){
    e.stopPropagation();
    var event = $(this).parent().parent();
    data = {};
    data.id = event.attr("data-id");
    data.time = Date.now();
    console.log('Complete event, event_id = ' + data.id);      
    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: 'http://localhost:3000/event/action/complete',
      statusCode: {
        200: function() {
          $('#runningEvents').find('li[data-id="' + data.id + '"]').remove();
          if ($('#runningEvents').find("li").length == 0){
            $('#runningLabel').addClass("hide");
          }
          else{
            $('#runningLabel').removeClass("hide");
          }            
          console.log("Successful completion");
          event.removeClass("expand");
          event.fadeOut(1000, function(){ 
            $(this).remove();
          });
        },
        500: function() {
          alert("Didn't work");
        }
      }
    });
  });

  
  var eventFilter = {
    searchName : '',
    tagName : '',
    isRunFilter : false,

    filterEvents : function(events){
      searchName = $('#nameSearch input').val().toLowerCase();
      tagName = $('#tagSearch input').val().toLowerCase();

      events.each(function(){
        var eventName = $(this).find('.name').text().toLowerCase();
        var eventTag = $(this).find('.tagSpan').text().toLowerCase();
        $(this).removeClass('hide');
        if (eventFilter.isRunFilter){
          if (!$(this).hasClass('running')) $(this).addClass('hide');
        }
        if(eventName.indexOf(searchName) == -1 || eventTag.indexOf(tagName) == -1){
          $(this).addClass('hide');
        }
      });
    },
  };

  $('.fa-search').click(function(e){
    $('#nameSearch').toggleClass("show");
    if ($('#nameSearch').hasClass("show")) $(this).addClass("clicked");
    else if($('#nameSearch input').val() === '') $(this).removeClass("clicked");
    $('#nameSearch input').focus();
    $('#nameSearch input').select();
    eventFilter.filterEvents($('.event'));
  });
  $('.fa-tags').click(function(e){
    $('#tagSearch').toggleClass("show");
    if ($('#tagSearch').hasClass("show")) $(this).addClass("clicked");
    else if($('#tagSearch input').val() === '') $(this).removeClass("clicked");
    $('#tagSearch input').focus();
    $('#tagSearch input').select();
    eventFilter.filterEvents($('.event'));
  });
  $('.sideIcon.fa-bolt').click(function(e){
    $(this).toggleClass("clicked");
    if ($(this).hasClass("clicked")) eventFilter.isRunFilter = true;
    else eventFilter.isRunFilter = false;
    eventFilter.filterEvents($('.event'));
  });
  $('#nameSearch').keypress(function(event) {
    eventFilter.filterEvents($('.event'));
    if(event.which == 13){
      if ($('#nameSearch input').val() === '') $('.fa-search').removeClass("clicked");
      $('#nameSearch').toggleClass("show");
    }
  });
  $('#tagSearch').keypress(function(event) {
    eventFilter.filterEvents($('.event'));
    if(event.which == 13){
      if ($('#tagSearch input').val() === '') $('.fa-tags').toggleClass("clicked");
      $('#tagSearch').toggleClass("show");
    }
  });


  $('.unCompleteEvent').click(function(e){
    e.stopPropagation();
    var event = $(this).parent().parent();
    data = {};
    data.id = event.attr("data-id");
    console.log('Complete event, event_id = ' + data.id);      
    
    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: 'http://localhost:3000/event/action/uncomplete',
      statusCode: {
        200: function() {
          $('#runningEvents').find('li[data-id="' + data.id + '"]').remove();
          if ($('#runningEvents').find("li").length == 0){
            $('#runningLabel').addClass("hide");
          }
          else{
            $('#runningLabel').removeClass("hide");
          }            
          console.log("Successful completion");
          event.removeClass("expand");
          event.fadeOut(1000, function(){ 
            $(this).remove();
          });
        },
        500: function() {
          alert("Didn't work");
        }
      }
    });
  });

  $('#eventViews').click(function(){
  });
});
