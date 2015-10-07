var auth_host = $("input#server").val();

var make_base_auth = function(user, password) {
  var tok = user + ':' + password;
  var hash = btoa(tok);
  return "Basic " + hash;
}

var login = function (username, password) {
    auth_host = Cookies.get('server');
    auth_backend = Cookies.get('auth');
    $.ajax({
        url: auth_host + "/0.1/token",
        type: "POST",
        contentType: "application/json",
        accepts: { json: "application/json" },
        dataType: "json",
        data: JSON.stringify({"backend": auth_backend}),
        beforeSend: function (xhr) { 
            xhr.setRequestHeader("Authorization", make_base_auth(username,
password)); 
        },
        success: function(data) {
           token = data['data']['token'];
           uuid = data['data']['auth_id'];
           acls = data['data']['acls'];
           console.log(data);
           Cookies.set('session', token);
           Cookies.set('uuid', uuid);
           Cookies.set('acls', acls);
           $('#login').hide();
           $('#logout').show();
           info = "token: " + token + "<br>";
           if (uuid)
               info += "uuid: " + uuid + "<br>";
           info += "acls: " + acls;
           $('.info').html(info);
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
           Cookies.remove('uuid');
           $('#logout').hide();
           $('#login').show();
        }
    });
}

var get_backends = function () {
    var backends = false;
    $.ajax({
        url: auth_host + "/0.1/backends",
        async: false,
        type: "GET",
        dataType: "json",
        contentType : 'application/json',
        success: function(data) {
           backends = data;
        }
    });
    return backends;
}

var set_backends = function (backends) {
    $('#auth_type').find('option').remove();
    $.each(backends['data'], function(index, element) {
        text = 'With ' + element.toUpperCase().replace('_',' ');
        value = element;
        var option = new Option(text, value);
        $('#auth_type').append($(option));
    });
}

$(function() {
    $('#login').on('submit', function(e) {
        e.preventDefault();
        username = $("input#username").val();
        password = $("input#password").val();
        server = $("input#server").val();
        auth_backend = $("select#auth_type").val();
        Cookies.set('server', server);
        Cookies.set('auth', auth_backend);

        login(username, password);
    });

    $('#logout').on('submit', function(e) {
        e.preventDefault();
        token = Cookies.get('session');

        logout(token);
    });


    if (Cookies.get('session')) {
        $('#login').hide();
        info = "token: " + Cookies.get('session') + "<br>uuid: " + Cookies.get('uuid') + "<br>acls: " + Cookies.get('acls');
        $('.info').html(info);
    } else {
        $('#logout').hide();
    }

    set_backends(get_backends());

});

