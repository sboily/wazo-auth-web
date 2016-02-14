/*
@licstart  The following is the entire license notice for the 
JavaScript code in this page.

Copyright (C) 2015  Sylvain Boily

The JavaScript code in this page is free software: you can
redistribute it and/or modify it under the terms of the GNU
General Public License (GNU GPL) as published by the Free Software
Foundation, either version 3 of the License, or (at your option)
any later version.  The code is distributed WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

As additional permission under GNU GPL version 3 section 7, you
may distribute non-source (e.g., minimized or compacted) forms of
that code without the copy of the GNU GPL normally required by
section 4, provided you include this license notice and a URL
through which recipients can access the Corresponding Source.

@licend  The above is the entire license notice
for the JavaScript code in this page.
*/

auth = new XiVOAuth();
var session = Cookies.getJSON('xivo_auth_session');
var background_login = ["img/1.jpg"];

var startLogoutTimer = function() {
    setTimeout(LogoutTimeout, getExpirationTime());
}

var LogoutTimeout = function() {
    console.log("Auto logout");
    logout();
}

var getExpirationTime = function() {
    expiration = new Date(session.expires);
    time_now = new Date();
    expires = expiration.getTime() - time_now.getTime();
    if (expires < 0) {
        timezone = expiration.getTimezoneOffset() * 60 * 1000;
        expires = expiration.getTime() - time_now.getTime() + timezone;
    }

    return expires;
}

var set_backends = function () {
    $('#backend').find('option').remove();

    auth.host = $("input#host").val();
    auth.backend().done(print_backends).fail(auth_error);
}

var print_backends = function(data) {
    if (data) {
        $.each(data['data'], function(index, element) {
            text = 'With ' + element.toUpperCase().replace('_',' ');
            value = element;
            var option = new Option(text, value);
            $('.selectpicker').append($(option));
        });
    }
    $('.selectpicker').selectpicker('refresh');
    $(".loader").fadeOut("slow");
}

var set_cookies = function(data) {
    session = { token: data['data']['token'],
                uuid: data['data']['xivo_user_uuid'],
                acls: data['data']['acls'],
                auth_id: data['data']['auth_id'],
                expires: new Date(data['data']['expires_at']),
                auth_host: auth.host
              };
    Cookies.set('xivo_auth_session', session, { expires: session.expires });
}

var unset_cookies = function() {
    Cookies.remove('xivo_auth_session');
    $(".loader").fadeOut("slow");
    location.reload();
}

var actionLogout = function() {
    $('#logout').on('click', function(e) {
        e.preventDefault();
        logout();
    });
}

var logout = function() {
    auth.host = session.auth_host;
    auth.logout(session.token).done(unset_cookies);
}

var launch_application = function(data) {
    $.backstretch("destroy");

    $('#error').addClass('hidden');
    $('#login').addClass('hidden');
    $('#main').removeClass('hidden');

    if (data) { set_cookies(data); }
 
    startLogoutTimer();
    print_auth_info();
    addCounter('expiration', session.expires);
    actionLogout();
}

var print_auth_info = function() {
    if (!session.uuid) {
        session.uuid = '-'
    }

    if (session.acls == '') {
        session.acls = '-'
    }

    info = "<tr><td><strong>token</strong></td><td>" + session.token + "</td></tr>" +
           "<tr><td><strong>uuid</strong></td><td>" + session.uuid + "</td></tr>" +
           "<tr><td><strong>auth_id</strong></td><td>" + session.auth_id + "</td></tr>" +
           "<tr><td><strong>expiration</strong></td><td>" + session.expires + " in <em><span id='expiration'></span></em></td></tr>" +
           "<tr><td><strong>acls</strong></td><td>" + session.acls + "</td></tr>";

    $('#auth').html(info);
}

var addCounter = function(elem, datetime) {
    countdown(new Date(datetime),
              function(ts) {
                   $('[id="'+ elem + '"]').html(formatSessionTime(ts));
               },
               countdown.HOURS | countdown.MINUTES | countdown.SECONDS);
}

var formatSessionTime = function(ts) {
    s = '';

    if (ts.hours)
        s += addZero(ts.hours)+':';
    if (ts.minutes)
        s += addZero(ts.minutes)+':';

    s += addZero(ts.seconds);

    return s
}

var addZero = function(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

var auth_error = function(data) {
    $('#error').html('').removeClass('hidden');

    $('<p>', {
        'class': 'text-left',
        'html': '<strong>Error:</strong> '+ data.status +'<br><strong>Message:</strong>' + data.statusText,
    }).appendTo('#error');

    if (data.status == 0) {
        $('<p>', {
            'class': 'text-left',
            'html': '<strong>Important:</strong> Please click on this <strong><a href="' +
                    auth.host + '" target="_blank">link</a></strong> to check your service!</p>'
        }).appendTo('#error');
    }

    $(".loader").fadeOut("slow");
}

var launch_login = function() {
    $('#login').removeClass('hidden');
    $.backstretch(background_login, {centeredY: false});
    $('[data-toggle="tooltip"]').tooltip()

    if ($("input#host").val()) {
        set_backends();
    } else {
        $('#tutorial').modal();
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

    $('#host').change(function() {
        set_backends();
    });
}

$(document).ready(function() {
    if (session == null) {
        launch_login();
    } else {
        launch_application();
    }

});
