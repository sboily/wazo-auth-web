auth = new XiVOAuth();

var set_backends = function (backends) {
    $('#backend').find('option').remove();
    if (backends) {
        $.each(backends['data'], function(index, element) {
            text = 'With ' + element.toUpperCase().replace('_',' ');
            value = element;
            var option = new Option(text, value);
            $('.selectpicker').append($(option));
        });
    }
    $('.selectpicker').selectpicker('refresh');
    $(".loader").fadeOut("slow");
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
    $(".loader").fadeOut("slow");
    location.reload();
}

var logout = function() {
    $('#logout').on('click', function(e) {
        e.preventDefault();
        auth.logout(Cookies.get('xivo_auth_session')).done(unset_cookies);
    });
}

var launch_application = function(session) {
    $('#login').hide();
    $('#main').show();
    $('#error').addClass('hide');
    $.backstretch("destroy");
    if (session)
        set_cookies(session);
    info = "<tr><td><strong>token</strong></td><td>" + Cookies.get('xivo_auth_session') + "</td></tr>" +
           "<tr><td><strong>uuid</strong></td><td>" + Cookies.get('xivo_auth_uuid') + "</td></tr>" +
           "<tr><td><strong>auth_id</strong></td><td>" + Cookies.get('xivo_auth_auth_id') + "</td></tr>" +
           "<tr><td><strong>acls</strong></td><td>" + Cookies.get('xivo_auth_acls') + "</td></tr>";
    $('#auth').html(info);
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

    if (!auth.host) {
        $('#tutorial').modal();
    }
}

var auth_error = function(data) {
    console.log(data.status);
    console.log(data.statusText);
    message = "<p class='text-left'><strong>Error:</strong> "+ data.status +"<br><strong>Message:</strong> "+ data.statusText + "</p>";
    if (data.status == 0) {
        server = Cookies.get('xivo_server') + "/0.1/backends";
        message += "<p class='text-left'><strong>Important:</strong> Please click on this <strong><a href='" +
                    server + "' target='_blank'>link</a></strong> to check your service!</p>";
    }
    $('#error').removeClass('hide');
    $('#error').html(message);
    $(".loader").fadeOut("slow");
}

var launch_login = function() {
    $('#main').hide();
    $.backstretch(["img/1.jpg"], {centeredY: false});
    $('[data-toggle="tooltip"]').tooltip()

    if ($("input#host").val()) {
        auth.backend().done(set_backends).fail(auth_error);
    } else {
        $(".loader").fadeOut("slow");
    }

    $('#authenticate').on('submit', function(e) {
        e.preventDefault();
        c = { username: $("input#username").val(),
              password: $("input#password").val(),
              backend: $("select#backend").val(),
            };
        auth.login(c).done(launch_application).fail(auth_error);
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
