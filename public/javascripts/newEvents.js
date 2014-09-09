$(document).ready(function(){
  $('#dueDate').datepicker();
  $('#startDate').datepicker();
  $('#endDate').datepicker();
  $('.dialog').dialog({
    autoOpen: false,
    dialogClass: "no-close",
  });

  $('#eventType').change(function(){
    var eventType = $(this).val();

    $('.rToggle').addClass("hide");
    switch(eventType){
      case "rTask":
        $('.rToggle').removeClass("hide");
      case "task":
        $('.taskToggle').removeClass("hide");
        $('.eventToggle').addClass("hide");
        break;
      case "rEvent":
        $('.rToggle').removeClass("hide");
      case "event":
        $('.eventToggle').removeClass("hide");
        $('.taskToggle').addClass("hide");
        break;
    }
    //$('.eventToggle').toggleClass('hide');
    
  });
  
  $('#submit').click(function(e){
    e.preventDefault();
    console.log('submit clicked');
    var isValid = true;

    var data = {};
    data.type = $('#eventType').val();
    data.name = $('#name').val();
    if (data.name == ''){
      alert("Need name");
    }
    data.priority = $('#priority').find('option:selected').text();
    data.description = $('#description').val();
    data.dateCreated = Date.now();

    console.log(data.type);
    switch(data.type){
      case "rTask":
        data.recurranceInterval = $('#recurranceInterval').val();
      case "task":
        data.expectedDuration = parseInt($('#durHours').val() * 60 + parseInt($('#durMins').val()));
        data.dueDate = Date.parse($('#dueDate').val());
        if(data.dueDate < Date.now()){
          isValid = false;
          alert("Date cannot be before now");
        }
        break;
      case "rEvent":
        data.recurranceInterval = $('#recurranceInterval').val();
      case "event":
        data.startDate = Date.parse($('#startDate').val());
        data.startDate += 60 * 1000 * (parseInt($('#startHour').val()) * 60 + parseInt($('#startMinute').val()));
        data.endDate = Date.parse($('#endDate').val()); 
        data.endDate += 60 * 1000 * (parseInt($('#endHour').val()) * 60 + parseInt($('#endMinute').val()));
        if(data.startDate < Date.now() || data.endDate < Date.now()){
          isValid = false;
          alert("Date cannot be before now");
        }
        if (data.endDate < data.startDate){
          isValid = false;
          alert("End Date cannot be before Start Date");
        }
        break;
    }

    if (data.name != '' && isValid){
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
  });
});
