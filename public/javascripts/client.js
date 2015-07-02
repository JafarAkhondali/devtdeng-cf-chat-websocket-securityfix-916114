
$(document).ready(function() {
  var console = $("#console");
  var from_user = 'anonymous';
  var to_user = '';

  // PWS only supports wss
  var proto = "wss:";
  var wss_port = "4443";    // PWS WebSocket port is 4443
  var url   = proto + "//" + location.hostname + ":" + wss_port;
  var wss = new WebSocket(url, 'echo-protocol');
  wss.onopen    = onOpen;
  wss.onerror   = onError;
  wss.onmessage = onMessage;

  function onOpen() {
    log("websocket open");
  }

  function onError(err) {
    log("websocket error: " + err.target.url);
  }

  function onMessage(event) {
    log("recv: " + event.data);

    msg = JSON.parse(event.data);
    var html = '<div class="panel panel-success"><div class="panel-heading"><h3 class="panel-title">' + msg.from_user + '</h3></div><div class="panel-body">' + msg.message + '</div></div>';
    var d = $('.message-area');
    d.append(html);
    d.scrollTop(d.prop("scrollHeight"));
  }

  function log(message) {
    console.text(console.text() + "\n" + message);
  }

	function go() {
		from_user = $('#user-name').val();
		$('#user-name').val('');
		$('.user-form').hide();
		$('.chat-box').show();

    wss.send(JSON.stringify({"type" : "login", "from_user" : from_user}));
	}

  $('#user-name').keydown(function(e) {
    if(e.keyCode == 13){ //Enter pressed
      go();
    }
  });

  $('.go-user').on('click', function(e) {
    go();
  });

  $('.chat-box textarea').keydown(function(e) {
    if(e.keyCode == 13){
      wss.send(JSON.stringify({"type" : "message", "from_user" : from_user, "message" : $('#message-input').val().trim()}));
      $(this).val('');
      e.preventDefault();
    }
  });
});



