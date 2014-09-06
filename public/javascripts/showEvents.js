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
    var event = $(this).parent();
    var id = event.attr("data-id");
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
          event.remove();
          alert("Successfully removed");
        },
        400: function() {
          alert("Didn't work");
        }
      }
    });
  });

  $('.edit').click(function(e){
    e.stopPropagation();
    var event = $(this).parent();
    var id = event.attr("data-id");
    console.log('update clicked, event_id = ' + id);      
    $.ajax({
      type: 'GET',
      contentType: 'application/json',
      url: 'http://localhost:3000/event/update/' + id,
      statusCode: {
        200: function() {
        },
        400: function() {
          alert("Didn't work");
        }
      }
    });
  });
});
