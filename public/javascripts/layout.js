$(document).ready(function(){
  $.ajax({
    type: 'GET',
    url: '/events/running',
    statusCode: {
      200: function(data) {
        var ul = $('#runningEvents');
        data.forEach(function(elm){
          var lastIndex = elm.timeSheet.length - 1;
          var times = elm.timeSheet[lastIndex];
          var startTime = -1;
          if (times.endTime == -1) startTime = times.startTime;
          var li = "<li class='runningEvent' data-id='"
            + elm._id + "' data-startTime='" + startTime + "'>" 
            + elm.name + "<span style='font-weight:bold'> Time Elapsed: </span>" 
            + "<span class='timeElapsed'> </span>"
            + "<span class='topPause fa fa-pause' style='margin:0; padding:0'> </span> </li>";
          ul.append(li);
        });
        if (ul.find("li").length == 0){
          $('#runningLabel').addClass("hide");
        }
        else{
          $('#runningLabel').removeClass("hide");
        }
      },
      500: function(error) {
        alert(error);
      }
    }
  });

  // topPause wasn't registering clicks, refer the static html elm runningEvents
  $('#runningEvents').on('click', '.topPause', function(e){
    e.stopPropagation();
    var li = $(this).parent();
    var ul = li.parent();
    var id = li.attr("data-id");
    console.log('Pausing event, event_id = ' + id);      
    var data = {};
    data.id = id;

    var event = $('.event[data-id="' + id + '"]');
    // Mongoose or express might be overriding the Date package
    // At any rate it is not putting back UTC timestamps
    // So it is easier to pass it back (and possibly better insofar as accuracy)
    data.time = Date.now();
    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/event/action/pause',
      statusCode: {
        200: function() {
          event.removeClass('running');
          event.find('.pauseEvent').addClass('disabledButton');
          event.find('.startEvent').removeClass('disabledButton');
          event.find('.fa-bolt').remove();
          li.remove();
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
  });

  // Alternatively, instead of doing expensive calculations, could just
  // set a variable for the time when the interval starts and 
  // increment at each iteration based on the interval... 
  // May be better if speed is an issue
  setInterval(function () {
    var curTime = Date.now();
    $('#runningEvents').find("li").each(function(elm){
      var startTime = $(this).attr("data-startTime");
      var ms = curTime - startTime;
      var secs = parseInt(ms / 1000) % 60;
      var mins = parseInt(ms / (60 * 1000)) % 60;
      var hours = parseInt(ms / (60 * 60 * 1000));

      var spentString = "";

      if (hours != 0) spentString += hours + "h";
      if (mins != 0) spentString += mins + "m";
      if (secs != 0) spentString += secs + "s";

      $(this).find('.timeElapsed').text(spentString);
    });
  },1000);
});
