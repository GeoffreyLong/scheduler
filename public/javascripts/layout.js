$(document).ready(function(){
  $.ajax({
    type: 'GET',
    url: 'http://localhost:3000/events/running',
    statusCode: {
      200: function(data) {
        var ul = $('#runningEvents');
        data.forEach(function(elm){
          var li = "<li class='runningEvent' data-id='"
            + elm._id + "'>" + elm.name + "</li>";
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
});
