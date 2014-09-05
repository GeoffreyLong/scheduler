$(document).ready(function(){
  $('.event').click(function(){
    $(this).toggleClass("expand");
    console.log($(this).attr("data-id"));
  });
  $('.newEvent').click(function(){
    window.location.replace("http://localhost:3000/events/create");    
  });

  $('.remove').click(function(e){
    e.stopPropagation();
    var id = $(this).parent().attr("data-id");
    console.log('Remove clicked, event_id = ' + id);      
    var data = {};
    data.id = id;
    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: 'http://localhost:3000/event/remove',
      statusCode: {
        200: function() {
          alert("Successfully removed");
          window.location.replace("http://localhost:3000/events/show");
        },
        400: function() {
          alert("Didn't work");
        }
      }
    });
  });

});
