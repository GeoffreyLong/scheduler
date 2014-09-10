$(document).ready(function(){
  $('.event').click(function(){
    $(this).toggleClass("expand");
    console.log($(this).attr("data-id"));
    curHeight = $(this).height();
    autoHeight = $(this).css('height', 'auto').height();
    $(this).height(curHeight).animate({height: autoHeight}, 200);
  });
  $('.createEvent').click(function(){
    window.location.replace("http://localhost:3000/events/eventForm");    
  });

  $('.deleteEvent').click(function(e){
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
        400: function() {
          alert("Didn't work");
        }
      }
    });
  });

  $('.updateEvent').click(function(e){
    e.stopPropagation();
    var event = $(this).parent();
    var id = event.attr("data-id");
    console.log('update clicked, event_id = ' + id);      
    window.location.replace("http://localhost:3000/event/update/" + id);
  });
});
