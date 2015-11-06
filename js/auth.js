function XiVOAuth(host) {
    this.host = host;

    this.connect = function(host) {
        host = this.host + "/0.1/"
        return new $.RestClient(host);
    }

    this.login = function(username, password, backend, expiration) {
        client = this.connect();

        if (expiration == null)
            expiration = 3600;

        if (backend == null)
            backend = 'xivo_ws';


        client.add('token', {
            stripTrailingSlash: true,
            stringifyData: true,
            username: username,
            password: password
        });

        client.token.create({
            backend: backend,
            expiration: expiration
        }).done(function (data) {
            Cookies.set('xivo_session', data['data']['token']);
            Cookies.set('xivo_uuid', data['data']['auth_id']);
            Cookies.set('xivo_acls', data['data']['acls']);
            home();
        });
    }

    this.logout = function(token) {
        client = this.connect();

        client.add('token', {
            stripTrailingSlash: true,
            stringifyData: true
        });

        client.token.del(token);

        Cookies.remove('xivo_session');
        Cookies.remove('xivo_uuid');
        Cookies.remove('xivo_acls');

        home_login();
    }

    this.backend = function() {
        client = this.connect();

        client.add('backends', {
            stripTrailingSlash: true,
            stringifyData: true,
            ajax: { async: false }
        });

        data = client.backends.read().done();
        return data.responseJSON;
    }
}

var home = function () {
    $('#login').hide();
    launch_application();
}

var get_backends = function () {
    return auth.backend();
}

$(function() {
    auth = new XiVOAuth(host)

    $('#login').on('submit', function(e) {
        e.preventDefault();

        if (host == null)
            host = $("input#host").val();

        auth.login($("input#username").val(),
                   $("input#password").val(), 
                   $("select#backend").val());
    });

    $('#logout').on('submit', function(e) {
        auth.logout(Cookies.get('xivo_session'));
    });

    if (Cookies.get('xivo_session'))
        home();
});
