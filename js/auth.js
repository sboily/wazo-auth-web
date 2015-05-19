var make_base_auth = function(user, password) {
  var tok = user + ':' + password;
  var hash = btoa(tok);
  return "Basic " + hash;
}

var login = function (username, password) {
    auth_host = Cookies.get('server');
    $.ajax({
        url: auth_host + "/0.1/token",
        type: "POST",
        dataType: "json",
        beforeSend: function (xhr) { 
            xhr.setRequestHeader('Authorization', make_base_auth(username,
password)); 
        },
        ContentType: "application/json",
        accepts: { json: 'application/json' },
        success: function(data) {
           token = data['data']['token']
           console.log(data);
           Cookies.set('session', token);
           $('#login').hide();
           $('#logout').show();
        }
    });
}

var logout = function (token) {
    auth_host = Cookies.get('server');
    $.ajax({
        url: auth_host + "/0.1/token/" + token,
        type: "DELETE",
        dataType: "json",
        contentType : 'application/json',
        success: function(data) {
           console.log(data);
           Cookies.remove('session');
           $('#logout').hide();
           $('#login').show();
        }
    });
}

$(function() {
    $('#login').on('submit', function(e) {
        e.preventDefault();
        username = $("input#username").val();
        password = $("input#password").val();
        server = $("input#server").val();
        Cookies.set('server', server);

        login(username, password);
    });

    $('#logout').on('submit', function(e) {
        e.preventDefault();
        token = Cookies.get('session');

        logout(token);
    });


    if (Cookies.get('session'))
        $('#login').hide();
    else
        $('#logout').hide();

});

