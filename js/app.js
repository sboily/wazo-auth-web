auth = new XiVOAuth();

var set_backends = function (backends) {
    $('#backend').find('option').remove();
    if (backends) {
        $.each(backends['data'], function(index, element) {
            text = 'With ' + element.toUpperCase().replace('_',' ');
            value = element;
            var option = new Option(text, value);
            $('#backend').append($(option));
        });
    }
}

var set_cookies = function(session) {
    Cookies.set('xivo_auth_session', session['data']['token']);
    Cookies.set('xivo_auth_uuid', session['data']['xivo_user_uuid']);
    Cookies.set('xivo_auth_acls', session['data']['acls']);
    Cookies.set('xivo_auth_auth_id', session['data']['auth_id']);
}

var unset_cookies = function(data) {
    Cookies.remove('xivo_auth_session');
    Cookies.remove('xivo_auth_uuid');
    Cookies.remove('xivo_auth_acls');
    Cookies.remove('xivo_auth_auth_id');
    location.reload();
}

var logout = function() {
    $('#logout').on('submit', function(e) {
        e.preventDefault();
        auth.logout(Cookies.get('xivo_auth_session'), unset_cookies);
    });
}

var launch_application = function(session) {
    $('#login').hide();
    $('#main').show();
    $('#error').addClass('hide');
    if (session)
        set_cookies(session);
    info = "token: " + Cookies.get('xivo_auth_session') + "<br>uuid: " +
                       Cookies.get('xivo_auth_uuid') + "<br>acls: " +
                       Cookies.get('xivo_auth_acls');
    $('.info').html(info);
    logout();
}

var set_host = function() {
    if (Cookies.get('xivo_server')) {
        $('#host').val(Cookies.get('xivo_server'));
    }

    $('#host').change(function() {
        Cookies.set('xivo_server', $('#host').val());
        location.reload();
    });

    auth.host = $("input#host").val();
}

var auth_error = function(data) {
    console.log(data.status);
    console.log(data.statusText);
    message = "<strong>Error:</strong> "+ data.status +"<br><strong>Message:</strong> "+ data.statusText;
    $('#error').removeClass('hide');
    $('#error').html(message);
}

var launch_login = function() {
    $('#main').hide();
    auth.backend(set_backends, auth_error);

    $('#login').on('submit', function(e) {
        e.preventDefault();

        auth.login($("input#username").val(),
                   $("input#password").val(), 
                   $("select#backend").val(),
                   null,
                   launch_application,
                   auth_error);
    });

}

$(document).ready(function() {
    set_host();

    if (Cookies.get('xivo_auth_session') == null) {
        launch_login();
    } else {
        launch_application();
    }

});
