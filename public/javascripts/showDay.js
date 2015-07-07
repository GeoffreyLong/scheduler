$(document).ready(function(){
  var allLayouts = [];
  /*$.ajax({
    type: 'POST',
    contentType: 'application/json',
    url: '/event/tags',
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
  });*/

  $("#layouts").autocomplete({
    source: function (request, response) {
      var result = $.ui.autocomplete.filter(allLayouts, request.term);
      response(result);
    },
    minLength: 0,
  });

  var addLayout = function(){
    var layout = $("#layouts").val();

    if($.inArray(layout, allLayouts) == -1 && layout != ""){
      var data = {};
      data.name = layout;
      console.log(allLayouts);
      console.log(layout);
      /*
      $.ajax({
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        url: '/event/tag/create',
        async: false,
        statusCode: {
          200: function(data) {
            allTags.push(tag);
            console.log("successful add");
          },
          500: function() {
            alert("Didn't work");
          }
        }
      });
      */
    }
  };

  $('#addLayoutSub').click(function(){
    var tr = $(this).parent().parent();
    var ul = $('#currentImplicitLayout');

    var minTime = tr.find('#layoutMinTime').val();
    var maxTime = tr.find('#layoutMaxTime').val();

    var prependString = '<li>';
    prependString += tr.find('#layoutTag').val();
    prependString += minTime;
    prependString += maxTime;
    prependString += '</li>';

    tr.find('[type=text]').val('');

    ul.prepend(prependString);
  });
});
