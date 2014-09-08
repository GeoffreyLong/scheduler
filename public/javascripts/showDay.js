$(document).ready(function(){
  var date = new Date();
  var hour = date.getHours();
  var min = date.getMinutes();
  if (hour >=6 && hour <= 22){
    var topOffset = hour - 6;
    topOffset += parseInt(min/15);

    // May not be perfect sized
    // Should find less hack way to do this
    var rowSize = $('#dayTimeLabel td').height();
    alert(rowSize);
  }
});
