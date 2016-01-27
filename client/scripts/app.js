// YOUR CODE HERE:
var app = {};
app.server = 'https://api.parse.com/1/classes/chatterbox?limit=300';

app.messages = [];
app.rooms = [];
app.friends = {};
app.username = '';
app.currentRoom = '';

app.init = function () {
  setInterval(app.fetch, 2000);
};

$(document).on("click", ".username", function () {
  var friend = $(this).text();
  app.addFriend(friend);
});

$(document).on("submit", "#send", function (event) {
  event.preventDefault();

  var newMessage = $('#message').val();
  $('#message').val('');
  app.handleSubmit(newMessage);
});

app.send = function (message) {
  $.ajax({
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};

app.fetch = function () {
  $.ajax({
    url: app.server,
    type: 'GET',
    data: {"order": "-createdAt",},
    contentType: 'application/json',
    success: function (data) {
      app.currentRoom = $('#roomSelect option:selected').text();
      //console.log(data);
      app.getMessages(data);
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};

app.getMessages = function(data){
  //console.log(data.results);
  app.messages = data.results.filter(function(message,i,a){return (!!message.username || !!message.text) && !!message.roomname;});
  app.rooms = app.messages.map(function(message){ 
                          if((message.roomname.length < 20 && message.roomname.replace(/\s/g, '').length !== 0) && message.roomname !== undefined){
                            return message.roomname; }})
                          .filter(function(room,index,arr){return arr.indexOf(room) === index;});
  //console.log(app.rooms);
  
  $('#roomSelect').empty();                        
  app.rooms.forEach(function(room){
    var $node = $('<option/>').val(room).text(room);
    $('#roomSelect').append($node);
    $("#roomSelect option[value='"+ app.currentRoom +"']").attr('selected', 'selected'); 
  });
  
  var $newRoom = '<option value=newRoom">Add new room...</option>';
  $('#roomSelect').append($newRoom);
  app.updateRoom();
};

app.updateRoom = function(){
  if ($('#roomSelect option:selected').text() === "Add new room..."){
    if($('#newRoom').length === 0){
      var $newRoom = '<input id="newRoom" type="text" placeholder="Name your room"></input>';
      $('#send').prepend($newRoom);
    }
    $('#newRoom').focus();
  }

  app.currentRoom = $('#roomSelect option:selected').text();  
  app.clearMessages();
  app.messages.filter(function (message, i, a) {return message.roomname === app.currentRoom;})
              .forEach(function (message) {app.addMessage(message);});
};

app.clearMessages = function() {
  $('#chats').empty();
};

app.addMessage = function(message) {
  var $user = $('<div/>').addClass('username').text(message.username);
  var $message = $('<div/>').addClass(message.username).text(message.text);
  if(app.friends[message.username]){
    $message.addClass('friend');
  }
  var $node = $('<div/>').addClass('chat');
  $node.append($user).append($message);
  $node.appendTo('#chats');
};

app.addRoom = function(room) {
  var $node = $('<option/>').val(room).text(room);
  $('#roomSelect').append($node);
};

app.addFriend = function(friend){
  if($('.' + friend).hasClass("friend")){
    app.friends[friend].delete();
    $('.' + friend).removeClass("friend");
  } else {
    if(!app.friends[friend]){
      app.friends[friend] = true;
    }
    $('.' + friend).addClass("friend");
  }   
};

app.getUserName = function(){
  return window.location.search.substr(10);
};


app.handleSubmit = function(message){
  var room = $('#roomSelect option:selected').text();
  if($('#newRoom').length !== 0){
    room = $('#newRoom').val();
    $('#newRoom').remove();
    app.currentRoom = room;  ///<<--------fix heres
    
    //$("#roomSelect option[value='"+ app.currentRoom +"']").attr('selected', 'selected');
    
    //$('#roomSelect').
    //select('<option/>').val(app.currentRoom).attr('selected', 'selected');
  }
  var messageObj = {
    username: app.getUserName(),
    text: message,
    roomname: room
  };
  app.send(messageObj);
};

// var message = {
//   username: 'shawndrost',
//   text: 'trololo',
//   roomname: '4chan'
// };

app.init();
