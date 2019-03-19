// global variables
var map;  // google map object
var markers = [];  // array of markers on map
var infowindows = [];  // array of infowindows on map

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

        // put their markers on map
        createMarkers(results);

        // append their name into restaurant list
        for (let result of results) {
          let $new;
          $new = $('<li id="' + result.id + '">' + result.name + '</li>');
          $new.click(function () {
            openInfowindow(result.id);
          });
          $("#restaurantList").append($new);
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
    // set content inside infowindow
    var infoContent;
    if (place.rating) {  // has rating
      infoContent = "<b>" + place.name + "</b><br>" + place.vicinity + "<br>評分: " + place.rating + "/5";
    } else {  // no rating
      infoContent = "<b>" + place.name + "</b><br>" + place.vicinity + "<br>評分: N/A";
    }

    // init infowindow
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
      closeAllInfowindows();
      infowindow.setContent(this.info);
      infowindows.push(infowindow);
      // open infowindow
      infowindow.open(map, this);

      // reset list color & hover style
      $("#restaurantList li").css("color", "white");
      $("#restaurantList li").hover(function () {
        $(this).css({ "cursor": "pointer", "color": "yellow" });
      }, function () {
        $(this).css("color", "white");
      });
    });
  }
}

function openInfowindow(resId) {
  closeAllInfowindows();
  for (let marker of markers) {
    if (marker.id === resId) {
      // click the marker of this restaurant
      google.maps.event.trigger(marker, 'click');
      return;
    }
  }
}

function closeAllInfowindows() {
  for (let infowindow of infowindows) {
    infowindow.close();
  }
}
