$(document).ready(function(){
  $.ajax({
    type: 'GET',
    url: 'http://localhost:3000/events/running',
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
            + "<span class='timeElapsed'> </span> </li>";
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
