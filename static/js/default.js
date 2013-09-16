var MAP;
var MARKER;
var MARKER_BUTTON_CONTROL;

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function sameOrigin(url) {
    // test that a given url is a same-origin URL
    // url could be relative or scheme relative or absolute
    var host = document.location.host; // host + port
    var protocol = document.location.protocol;
    var sr_origin = '//' + host;
    var origin = protocol + sr_origin;
    // Allow absolute or scheme relative URLs to same origin
    return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
        (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
        // or any other URL that isn't scheme relative or absolute i.e relative.
        !(/^(\/\/|http:|https:).*/.test(url));
}

function resizeMap() {
    //$("#portal-map").height($(window).height() - $("#id-header").height());
    $("#portal-map").height($(window).height() - 60);
}

function dragstart(e) {
    if (MARKER) {
        MARKER.dragging.disable();
    }
}

function dragend(e) {
    if (MARKER) {
        MARKER.dragging.enable();
    }
}

function fillPlacePositionAttributes() {
    $('#id_map_center_lng').val(MARKER.getLatLng().lng);
    $('#id_map_center_lat').val(MARKER.getLatLng().lat);
    $('#id_map_zoom').val(MAP.getZoom());
}
function onMarkerDrag(e) {
    if (MAP != null && MARKER != null) {
        fillPlacePositionAttributes();
    }
}

function showFormErrors(errors){
    var errorMsg = '<ul>';
    for (error in errors){
        errorMsg += '<li>' + error + ' ' + errors[error] + '</li>';
    }
    errorMsg += '</ul>';
    $('#id-alert-placeholder').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">×</a><span>' + errorMsg + '</span></div>')
}

function showInformationAlert(msg){
    $('#id-alert-placeholder').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">×</a><span>' + msg + '</span></div>')
}

function showPlaceAddForm(marker_lat, marker_lng) {
    if (!marker_lat) {
        marker_lat = MAP.getCenter().lat;
    }

    if (!marker_lng) {
        marker_lng = MAP.getCenter().lng;
    }

    $('#id-add-marker').text('Anuluj dodawanie miejsca');
    MARKER = L.marker(
        [marker_lat, marker_lng], {
            draggable: true
        });
    MARKER.on('drag', onMarkerDrag);
    MARKER.addTo(MAP)

    fillPlacePositionAttributes();

    $('#id-sidebar').css('display', 'block');
}

function closePlaceAddForm() {
    $( '#id-create-form' ).each(function(){
        this.reset();
    });

    $('#id-add-marker').text('Dodaj nowe miejsce');
    MAP.removeLayer(MARKER);
    MARKER = null;
    $('#id-sidebar').css('display', 'none');
}
function createMarkerButtonControl() {
    /*add button to bottom left map*/
    MARKER_BUTTON_CONTROL = L.control({position: 'bottomleft'});

    MARKER_BUTTON_CONTROL.onAdd = function (MAP) {
        this._div = L.DomUtil.create('div', 'id-add-marker-div');
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    MARKER_BUTTON_CONTROL.update = function () {
        this._div.innerHTML = '<button type="button" id="id-add-marker" class="btn btn-info">Dodaj nowe miejsce</button>';
    };

    MARKER_BUTTON_CONTROL.addTo(MAP);

    /*handling id-add-marker click event*/
    $('#id-add-marker').on('click', function (e) {
        if (MARKER) {
            closePlaceAddForm();
        } else {
            showPlaceAddForm(MAP.getCenter().lat, MAP.getCenter().lng);
        }
    });
}

function initPortalMap(map_center_lng, map_center_lat, map_zoom) {

    //resizeMap();

    MAP = L.map('portal-map').setView([map_center_lng, map_center_lat], map_zoom);
    MAP.on('dragstart', dragstart);
    MAP.on('dragend', dragend);

    L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>'
    }).addTo(MAP);


    createMarkerButtonControl();

    var form = $('#id-create-form');
    /*handling id-form-submit click event*/
    form.submit(function () {

        /*map zoom can be changed without marker dragging*/
        $('#id_map_zoom').val(MAP.getZoom());

        //var formData = $("#id-create-form").serialize();
        //formData = JSON.parse(formData);
        var formData = {}

        //alert(formData);

        $('#id-create-form input, #id-create-form select').each(function (key, value) {
            formData[this.name] = this.value;
        });

        formData['csrftoken'] = getCookie('csrftoken');  /*$.cookie('csrftoken');*/

        $.ajaxSetup({
            beforeSend: function (xhr) {
                if (!csrfSafeMethod('POST') && sameOrigin('/place/create/')) {
                    // Send the token to same-origin, relative URLs only.
                    // Send the token only if the method warrants CSRF protection
                    // Using the CSRFToken value acquired earlier
                    xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                }
            }
        });

        $.ajax({
            type: 'POST', /*'POST'*/
            url: '/place/create/', /*'/place/create/' */
            data: $("#id-create-form").serialize(), //JSON.stringify(formData),
            dataType: 'json',
            //contentType: 'application/json',
            success: function (data) {
                if (data.success){
                    closePlaceAddForm();
                    showInformationAlert('Place has been registered (' + data.place_pk.toString() + '). Confirmation email will be send.' );
                } else {
                    showFormErrors(data.errors);
                }
            },
            error: function (err) {
                console.log("Error while calling Ajax: " + err.responseText.toString());
            }
        });

        return false;
    });

}

