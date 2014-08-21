$(document).ready(function(){
  $('#submit').click(function(e){
    e.preventDefault();
    console.log('submit clicked');
          
    var data = {};
    data.name = $('#name').val();
    data.priority = $('#priority').find('option:selected').text();
    if (data.name != ''){
      $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: 'http://localhost:3000/event',
        success: function(data) {
            console.log('success');
            console.log(JSON.stringify(data));
        }
      });
    }
    else{
      alert('Need Name');
    }
  });
});
