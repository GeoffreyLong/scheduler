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
      },
      500: function(error) {
        alert(error);
      }
    }
  });
});
