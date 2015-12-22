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

var unset_cookies = function() {
    Cookies.remove('xivo_auth_session');
    Cookies.remove('xivo_auth_uuid');
    Cookies.remove('xivo_auth_acls');
    Cookies.remove('xivo_auth_auth_id');
}

var logout = function(auth) {
    $('#logout').on('submit', function(e) {
        logout = auth.logout(Cookies.get('xivo_auth_session'));
        if (logout)
            unset_cookies();
    });
}

var launch_application = function(session) {
    $('#login').hide();
    $('#main').show();
    if (session)
        set_cookies(session);
    info = "token: " + Cookies.get('xivo_auth_session') + "<br>uuid: " +
                       Cookies.get('xivo_auth_uuid') + "<br>acls: " +
                       Cookies.get('xivo_auth_acls');
    $('.info').html(info);
}

var set_host = function() {
    if (Cookies.get('xivo_server')) {
        $('#host').val(Cookies.get('xivo_server'));
    }

    $('#host').change(function() {
        Cookies.set('xivo_server', $('#host').val());
        location.reload();
    });
}

var launch_login = function(auth) {
    $('#main').hide();
    set_backends(auth.backend());

    $('#login').on('submit', function(e) {
        e.preventDefault();

        session = auth.login($("input#username").val(),
                             $("input#password").val(), 
                             $("select#backend").val());
        if (session) {
            launch_application(session);
        } else {
            alert('Sorry, your login/password is wrong!');
        }
    });

}

$(document).ready(function() {
    set_host();

    auth = new XiVOAuth($("input#host").val())
    logout(auth);

    if (Cookies.get('xivo_auth_session') == null) {
        launch_login(auth);
    } else {
        launch_application();
    }

});
