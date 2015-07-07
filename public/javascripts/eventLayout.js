$(document).ready(function(){
  var eventFilter = {
    searchName : '',
    tagName : '',
    isRunFilter : false,

    filterEvents : function(events){
      searchName = $('#nameSearch input').val().toLowerCase();
      tagName = $('#tagSearch input').val().toLowerCase();

      events.each(function(){
        var eventName = $(this).find('.name').text().toLowerCase();
        var eventTag = $(this).find('.tagSpan').text().toLowerCase();
        $(this).removeClass('hide');
        if (eventFilter.isRunFilter){
          if (!$(this).hasClass('running')) $(this).addClass('hide');
        }
        if(eventName.indexOf(searchName) == -1 || eventTag.indexOf(tagName) == -1){
          $(this).addClass('hide');
        }
      });
    },
  };

  var triggerNameSearch = function(){
    $('#nameSearch').toggleClass("show");
    if ($('#nameSearch').hasClass("show")) $('.fa-search').addClass("clicked");
    else if($('#nameSearch input').val() === '') $('.fa-search').removeClass("clicked");
    $('#nameSearch input').focus();
    $('#nameSearch input').select();
    eventFilter.filterEvents($('.event'));
  };
  $('.fa-search').click(function(e){
    triggerNameSearch();
  });
  var triggerTagSearch = function(){
    $('#tagSearch').toggleClass("show");
    if ($('#tagSearch').hasClass("show")) $('.fa-tags').addClass("clicked");
    else if($('#tagSearch input').val() === '') $('.fa-tags').removeClass("clicked");
    $('#tagSearch input').focus();
    $('#tagSearch input').select();
    eventFilter.filterEvents($('.event'));
  };
  $('.fa-tags').click(function(e){
    triggerTagSearch();
  });
  $('#filterHolder .fa-bolt').click(function(e){
    $(this).toggleClass("clicked");
    if ($(this).hasClass("clicked")) eventFilter.isRunFilter = true;
    else eventFilter.isRunFilter = false;
    eventFilter.filterEvents($('.event'));
  });
  $('#nameSearch').keypress(function(event) {
    eventFilter.filterEvents($('.event'));
    if(event.which == 13){
      if ($('#nameSearch input').val() === '') $('.fa-search').removeClass("clicked");
      $('#nameSearch').toggleClass("show");
    }
  });
  $('#tagSearch').keypress(function(event) {
    eventFilter.filterEvents($('.event'));
    if(event.which == 13){
      if ($('#tagSearch input').val() === '') $('.fa-tags').toggleClass("clicked");
      $('#tagSearch').toggleClass("show");
    }
  });


  $('#eventViews').click(function(){
    $(this).toggleClass('clicked');
    if ($(this).hasClass('clicked')){
      $('#viewHolder').addClass('show');
    }
    else{
      $('#viewHolder').removeClass('show');
    }
  });
  $('.viewIcon').click(function(e){
    e.stopPropagation();
    $('.viewIcon').toggleClass('clicked');
    var data = {};
    data.viewType = $('.viewIcon.clicked').attr('data-type');
    console.log("Switching to view: " + data.viewType);
    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/events/viewType',
    });
  });

  $('.fa-filter').click(function(){
    $(this).toggleClass('clicked');
    if ($(this).hasClass('clicked')){
      $('#filterHolder').addClass('show');
    }
    else{
      $('#filterHolder').removeClass('show');
    }
  });


  // A few hotkey mappings
  // Have to do weird keymappings to avoid the regular hotkeys
  // Should probably consider doing this some other way
  // Could use r for reload (or running event filters)
  // x is another unused key
  // This seems like enough key mappings for now, but may want more in future
  $(document).keydown(function(e){
    if( e.which === 70 && e.ctrlKey && e.shiftKey ){
      e.preventDefault();
      console.log('ctrl+shift+f'); 
      triggerNameSearch();
    }
    if( e.which === 68 && e.ctrlKey && e.shiftKey ){
      e.preventDefault();
      console.log('ctrl+shift+d'); 
      triggerTagSearch();
    }
  }); 

  // TODO
  // Could extend to a model that doesn't change by
  // Calling this fn for any show event and having a variable
  // in routes/index.js which would hold the current showType
  // Similar to how viewType is done I think
  // Might want to do this for all filters
  $('.showType').click(function(){
    var params = {
      type: 'GET',
      contentType: 'application/json',
      url: '/events/show',
      statusCode: {
        200: function(data) {
          // TODO show logic
          var newHTML = $(data);
          $('#subContent ul').replaceWith(newHTML.find('#subContent ul'));
        },
        400: function(data) {
          alert("Didn't work");
        }
      }
    };

    var data = {};
    data.showType = null;

    if ($(this).hasClass('fa-check-square-o')){
      data.showType = "completed";
    }
    else if ($(this).hasClass('fa-bookmark')){
      data.showType = "activities";
    }
    else if ($(this).hasClass('fa-history')){
      data.showType = "recent";
    }

    params.data = data;
    $.ajax(params);
  });
});  
