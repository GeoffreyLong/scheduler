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
              + "<span class='timeElapsed'>  </span> </li>";
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

  $('.fa-search').click(function(e){
    $(this).toggleClass("clicked");
    $('#nameSearch').toggleClass("show");
    $('#nameSearch input').focus();
  });
  $('.fa-tags').click(function(e){
    $(this).toggleClass("clicked");
    $('#tagSearch').toggleClass("show");
    $('#tagSearch input').focus();
  });

  $('#nameSearch').keypress(function(event) {
    $('.event').each(function(index, value){
      if (!$(this).hasClass('createEvent')){
        var eventName = $(this).find('.name').text().toLowerCase();
        var searchedName = $('#nameSearch input').val().toLowerCase();
        // Remember that indexOf without the != will pass all basically
        if(eventName.indexOf(searchedName) == -1){
          $(this).addClass('hide');
        }
        else{
          $(this).removeClass('hide');
        }
      }
    });
    if(event.which == 13){
      $('#nameSearch input').val('');
      $('.fa-search').toggleClass("clicked");
      $('#nameSearch').toggleClass("show");
    }
  });
});
