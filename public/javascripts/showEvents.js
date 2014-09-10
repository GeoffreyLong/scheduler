$(document).ready(function(){
  $('.event').click(function(){
    console.log($(this).attr("data-id"));

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


  $('.createEvent').click(function(){
    window.location.replace("http://localhost:3000/events/eventForm");    
  });

  $('.deleteEvent').click(function(e){
    e.stopPropagation();
    var event = $(this).parent().parent();
    var id = event.attr("data-id");
    console.log('Remove clicked, event_id = ' + id);      
    var data = {};
    data.id = id;
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
            var li = "<li class='runningEvent' data-id='"
              + id + "'>" + event.find('.name').text() + "</li>";
            $('#runningEvents').append(li);
            $('#runningLabel').removeClass("hide");
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
              $('#runningLabel').addClass("hide");
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
    var metrics = $('#eventMetrics');
    metrics.toggleClass("show");

    if (metrics.hasClass("show")){
      // All hacky logic...cleanup
      event.css({
        "width": event.width()+1,
      });
      metrics.css({
        'top':event.offset().top - 50,
        'left':event.offset().left + event.width() + 20,
      });

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
            metrics.find('#timeSpent').text(data.total + " ms");
            console.log(data.total);
          },
          500: function() {
            alert("Didn't work");
          }
        }
      });
    }
    else{
      event.css({
        "width": event.width()-1,
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
});
