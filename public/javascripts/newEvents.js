$(document).ready(function(){
  var allTags = [];
  $.ajax({
    type: 'POST',
    contentType: 'application/json',
    url: 'http://localhost:3000/event/tags',
    async: false,
    statusCode: {
      200: function(data) {
        console.log(data);
        data.forEach(function(elm){
          allTags.push(elm.name);
        });
      },
      400: function() {
        alert("Didn't work");
      }
    }
  });

  $("#tags").autocomplete({
      source: function (request, response) {
          var result = $.ui.autocomplete.filter(allTags, request.term);
          response(result);
      }
  });
  

  $("#tags").keypress(function(event) {
    // For the record $(this).val() is getting the event... need to watch for that
    //var tag = $(this).value;
    if (event.which == 13) {
      event.preventDefault();
      var tag = $("#tags").val();
      $('#tags').val('');

      if($.inArray(tag, allTags) == -1){
        var data = {};
        data.name = tag;
        console.log(allTags);
        console.log(tag);
        $.ajax({
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(data),
          url: 'http://localhost:3000/event/tag/create',
          statusCode: {
            200: function(data) {
              allTags.push(tag);
              $('#addedTags').append('<li>' + tag + '</li>');
              console.log("successful add");
            },
            500: function() {
              alert("Didn't work");
            }
          }
        });
      }
      else{
        $('#addedTags').append('<li>' + tag + '</li>');
      }
    }
  });

  var portToDate = function(oldDate){
    // Hacky workaround because the Date.parse cant seem to parse anything
    var date = oldDate.replace(/['"]+/g, '');
    dateAndTime = date.split('T');
    
    var dateTokens = dateAndTime[0].split('-');
    var timeTokens = dateAndTime[1].split(':');

    return new Date(dateTokens[0], dateTokens[1]-1, dateTokens[2], timeTokens[0], timeTokens[1]);
  }
  
  var dueDate = $('#dueDate').datepicker({
    dateFormat: "yy-mm-dd",
  }); 
  var startDate = $('#startDate').datepicker({
    dateFormat: "yy-mm-dd",
  }); 
  var endDate = $('#endDate').datepicker({
    dateFormat: "yy-mm-dd",
  }); 


  // Setting of fields if in edit mode
  if ($('#dueDateTR').attr('data-dueDate')){
    dueDate.datepicker('setDate', portToDate($('#dueDateTR').attr('data-dueDate')));
  }
  if ($('#expectedDurationTR').attr('data-duration')){
    var duration = parseInt($('#expectedDurationTR').attr('data-duration'));
    var hours = parseInt(duration / 60);
    var mins = duration - hours*60;
    $('#durHours').val(hours);
    $('#durMins').val(mins);
  }
  if ($('#startDateTR').attr('data-startDate')){
    var date = portToDate($('#startDateTR').attr('data-startDate')); 
    startDate.datepicker('setDate', date);
    $('#startHour').val(date.getHours());
    $('#startMinute').val(date.getMinutes());
  }
  if ($('#endDateTR').attr('data-endDate')){
    var date = portToDate($('#endDateTR').attr('data-endDate'));
    endDate.datepicker('setDate', date);
    $('#endHour').val(date.getHours());
    $('#endMinute').val(date.getMinutes());
  }

  $('.dialog').dialog({
    autoOpen: false,
    dialogClass: "no-close",
  });

  var toggleType = function(eventType){
    $('.rToggle').addClass("hide");

    switch(eventType){
      case "rTask":
        $('.rToggle').removeClass("hide");
      case "task":
        $('.taskToggle').removeClass("hide");
        $('.eventToggle').addClass("hide");
        $('.activityToggle').removeClass("hide");
        break;
      case "rEvent":
        $('.rToggle').removeClass("hide");
      case "event":
        $('.eventToggle').removeClass("hide");
        $('.taskToggle').addClass("hide");
        $('.activityToggle').removeClass("hide");
        break;
      case "activity":
        $('.taskToggle').addClass("hide");
        $('.eventToggle').addClass("hide");
        $('.activityToggle').addClass("hide");
        break;
    }
    //$('.eventToggle').toggleClass('hide');
  }

  toggleType($('#eventType').val());

  $('#eventType').change(function(){
    var eventType = $(this).val();
    toggleType(eventType);
  });
  
  $('#submit').click(function(e){
    e.preventDefault();
    console.log('submit clicked');

    var isValid = true;

    var data = {};
    data.eventType = $('#eventType').val();
    data.name = $('#name').val();
    if (data.name == ''){
      alert("Need name");
    }
    data.priority = $('#priority').find('option:selected').text();
    data.description = $('#description').val();
    data.dateCreated = Date.now();

    console.log(data.eventType);
    switch(data.eventType){
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
      case "activity":
        data.priority = 0;
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
              $('#success').dialog('close');
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
