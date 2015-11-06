if (Cookies.get('xivo_server') == null) {
    var host = $("input#host").val();
    Cookies.set('xivo_server', host);
} else {
    var host = Cookies.get('xivo_server');
    Cookies.remove('xivo_server');
}

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

var launch_application = function() {
    $('#main').show();
    info = "token: " + Cookies.get('xivo_session') + "<br>uuid: " + Cookies.get('xivo_uuid') + "<br>acls: " + Cookies.get('xivo_acls');
    $('.info').html(info);
}

$(document).ready(function() {
    if (Cookies.get('xivo_session') == null) {
        $('#main').hide();
        set_backends(get_backends());
    }
});
