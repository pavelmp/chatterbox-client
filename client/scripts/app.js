// YOUR CODE HERE:
var app = {};
app.server = 'https://api.parse.com/1/classes/chatterbox?limit=300';

app.messages = [];
app.rooms = [];
app.friends = [];
app.username = '';
app.currentRoom = '';

app.init = function () {
  setInterval(app.fetch, 2000);
};

$(document).on("click", ".username", function () {
  var friend = $(this).text();
  app.addFriend(friend);
});

$(document).on("click", "#submit", function () {
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
      app.currentRoom = app.escape($('#roomSelect option:selected').text());
      console.log(app.currentRoom);
      app.getMessages(data);
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};

app.getMessages = function(data){
  app.messages = data.results.filter(function(message,i,a){return !!message.username && !!message.text && !!message.roomname;});
  app.messages.forEach(function(message){
                message.username = app.escape(message.username);
                message.text = app.escape(message.text);
                message.roomname = app.escape(message.roomname);
             });
  
  app.rooms = app.messages.map(function(message){return message.roomname;})
                          .filter(function(room,index,arr){return arr.indexOf(room) === index;});
  
  $('#roomSelect').empty();                        
  app.rooms.forEach(function(room){

    var $node = '<option value=' + '"' + room + '">' + room + '</option>';
    //if(room === app.currentRoom){console.log(app.currentRoom);}
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
      $newRoom = '<input id="newRoom" type="text" placeholder="Name your room"></input>';
      $('#inputs').prepend($newRoom);
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

app.escape = function(string){
  string  = string.replace(/\&/g, function (v) {
    return '&amp';
  }).replace(/\</g, function (v) {
    return '&lt';
  }).replace(/\>/g, function (v) {
    return '&gt';
  }).replace(/\"/g, function (v) {
    return '&quot';
  }).replace(/\'/g, function (v) {
    return '&#x27';
  }).replace(/\//g, function (v) {
    return '&#x2F';
  });
  return string;
};

app.addMessage = function(message) {
  var $user = $('<div class="username">' + message.username + '</div>');
  var $message = $('<div class="'+ message.username + '">' + message.text + '</div>');
  if(app.friends.indexOf(message.username) !== -1){
    $message.addClass('friend');
  }
  var $node = $('<div class="chat" data-username=' + '"' + message.username + '" data-room="' + message.roomname + '"></div>');
  $node.append($user).append($message);
  $node.appendTo('#chats');
};

app.addRoom = function(room) {
  var $node = $('<option value=' + '"' + room + '">' + room + '</option>');
  $('#roomSelect').append($node);
};

app.addFriend = function(friend){
  if($('.' + friend).hasClass("friend")){
    app.friends.splice(app.friends.indexOf(friend),1);
    $('.' + friend).removeClass("friend");
  } else {
    if(app.friends.indexOf(friend) === -1){
      app.friends.push(friend);
    }
    $('.' + friend).addClass("friend");
  }   
};

app.getUserName = function(){
  var results = new RegExp('[\?&]username=([^&#]*)').exec(window.location.href);
  return results[1] || 0;  
};


app.handleSubmit = function(message){
  var messageObj = {
    username: app.getUserName(),
    text: message,
    roomname: $('#roomSelect option:selected').text()
  };
  app.send(messageObj);
};
// var message = {
//   username: 'shawndrost',
//   text: 'trololo',
//   roomname: '4chan'
// };

app.init();
