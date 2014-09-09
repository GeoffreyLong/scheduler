$(document).ready(function(){
  $('#dueDate').datepicker();
  $('.dialog').dialog({
    autoOpen: false,
    dialogClass: "no-close",
  });

  $('#eventType').change(function(){
    var eventType = $(this).val();

    $('.rToggle').addClass("hide");
    switch(eventType){
      case "Recurring Task":
        $('.rToggle').removeClass("hide");
      case "Task":
        $('.taskToggle').removeClass("hide");
        $('.eventToggle').addClass("hide");
        break;

      case "Recurring Event":
        $('.rToggle').removeClass("hide");
      case "Event":
        $('.eventToggle').removeClass("hide");
        $('.taskToggle').addClass("hide");
        break;
    }
    //$('.eventToggle').toggleClass('hide');
    
  });
  
  $('#submit').click(function(e){
    e.preventDefault();
    console.log('submit clicked');

    var data = {};
    data.name = $('#name').val();
    data.priority = $('#priority').find('option:selected').text();
    data.description = $('#description').val();
    data.dateCreated = Date.now();
    data.dueDate = $('#dueDate').val();
    data.expectedDuration = parseInt($('#durHours').val() * 60 + parseInt($('#durMins').val()));

    if (data.name != ''){
      $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: 'http://localhost:3000/event/create',
        statusCode: {
          200: function() {
            $('#success').dialog('open').delay(1000).fadeOut(1000, function(){
              window.location.replace("http://localhost:3000/events/show");
            });
          },
          400: function() {
            alert("Didn't work");
          }
        }
      });
    }
    else{
      alert('Need Name');
    }
  });
});
