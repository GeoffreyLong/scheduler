$(document).ready(function(){
  $('.event').click(function(){
    $(this).toggleClass("expand");
    console.log($(this).attr("data-id"));
  });
});
