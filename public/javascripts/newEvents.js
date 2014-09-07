$(document).ready(function(){
  $('.dialog').dialog({
    autoOpen: false,
    dialogClass: "no-close",
  });
  $('#submit').click(function(e){
    e.preventDefault();
    console.log('submit clicked');

    var data = {};
    data.name = $('#name').val();
    data.priority = $('#priority').find('option:selected').text();
    data.dateCreated = Date.now();

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
