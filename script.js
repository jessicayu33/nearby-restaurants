// global variables
var map;
var markers = [];  // array of markers on map

function initMap() {
  // initial map center position
  var initPos = { lat: 22.337204, lng: 114.150763 }

  // initialize map
  map = new google.maps.Map(document.getElementById('map'), {
    center: initPos,
    zoom: 17
  });

  // boundaries change event
  map.addListener('bounds_changed', function () {
    // clear original restaurant list
    $("#restaurantList").empty();

    // get center position
    var currentPos = map.getCenter();

    // search restaurants in nearby area using PlacesService
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
      location: currentPos,  // current center position
      type: 'restaurant',  // only search restaurants
      rankBy: google.maps.places.RankBy.DISTANCE  // order by distance
    },
      function (results, status) {
        // proceed only when success
        if (status !== 'OK') return;

        // clear original restaurant list again to avoid dulplicates
        $("#restaurantList").empty();

        // console.log(results);

        // put their markers on map
        createMarkers(results);

        // append their name into restaurant list
        for (let result of results) {
          $("#restaurantList").append('<li id="' + result.id + '">' + result.name + '</li>');
        }
      });
  });
}

function createMarkers(places) {
  // clear markers on map
  for (let marker of markers) {
    marker.setMap(null);
  }

  for (let place of places) {
    // set content in the infowindow
    var infoContent;
    if (place.rating) {  // has rating
      infoContent = place.name + "<br>" + place.vicinity + "<br>評分: " + place.rating + "/5";
    } else {  // no rating
      infoContent = place.name + "<br>" + place.vicinity + "<br>評分: N/A";
    }

    // set up infowindow
    var infowindow = new google.maps.InfoWindow({
      content: ''
    });

    // set up marker
    var marker = new google.maps.Marker({
      map: map,
      id: place.id,
      title: place.name,
      position: place.geometry.location,
      info: infoContent
    });

    markers.push(marker);

    // marker click event --> popup its infowindow
    google.maps.event.addListener(marker, 'click', function () {
      infowindow.setContent(this.info);
      // open infowindow
      infowindow.open(map, this);

      // reset list names color
      $("#restaurantList li").css("color", "white");

      var resid = this.id;
      $("#restaurantList li").each(function () {
        // highlight its name on the list
        if ($(this).attr('id') == resid) {
          $(this).css("color", "yellow");
        }
      });
    });

    // close infowindow event
    google.maps.event.addListener(infowindow, 'closeclick', function () {
      // reset list names color
      $("#restaurantList li").css("color", "white");
    });
  }
}
