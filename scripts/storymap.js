// Watch for scrollable container
var scrollPosition = 0;
$('div#contents').scroll(function() {
  scrollPosition = $(this).scrollTop();
});
// Leaflet Map Init
function initMap() {
  var map = L.map('map', {
    zoomControl: false
  }).setView([0, 0], 5); // initial map automatically fits bounds of all markers

  // optional : customize link to view source code; add your own GitHub repository
  map.attributionControl
  .setPrefix('View <a href="http://github.com/rblades/rblades.github.io">code on GitHub</a>, created with <a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>');

  // optional: add legend to toggle any baselayers and/or overlays
  // global variable with (null, null) allows indiv layers to be added inside functions below
  var controlLayers = L.control.layers( null, null, {
    position: "bottomright",
    collapsed: false, // false = open by default
    'data-intro': 'test',
    'data-position': 'left'
  }).addTo(map);

  // optional: reposition zoom control other than default topleft
  L.control.zoom({position: "topright"}).addTo(map);

  /* BASELAYERS */
  // use common baselayers below, delete, or add more with plain JavaScript from http://leaflet-extras.github.io/leaflet-providers/preview/
  // .addTo(map); -- suffix displays baselayer by default
  // controlLayers.addBaseLayer (variableName, 'label'); -- adds baselayer and label to legend; omit if only one baselayer with no toggle desired
  // http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png
  var lightAll = new L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '<a href="http://maps.stamen.com/toner/#12/37.7706/-122.3782/</a>'
  }).addTo(map); //this displays layer by default
  controlLayers.addBaseLayer(lightAll, 'Pembroke Today');

  // Esri satellite map from http://leaflet-extras.github.io/leaflet-providers/preview/
  var Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });
  controlLayers.addBaseLayer(Esri_WorldImagery, 'Pembroke Satellite');

  // Harvard Map Warper Pemb 1970
  var Pemb1967 = new L.tileLayer('http://warp.worldmap.harvard.edu/maps/tile/5310/{z}/{x}/{y}.png', {
    attribution: '<a href="http://warp.worldmap.harvard.edu/</a>'
  });
  controlLayers.addOverlay(Pemb1967, 'Pembroke 1967');

  var Pemb1980 = new L.tileLayer('http://warp.worldmap.harvard.edu/maps/tile/5312/{z}/{x}/{y}.png', {
    attribution: '<a href="http://warp.worldmap.hardvard.edu/</a>'
  });
  controlLayers.addOverlay(Pemb1980, 'Pembroke 1980');

  // Harvard Map Warper Pemb 1967
  //var Pemb1967 = new L.tileLayer('http://warp.worldmap.harvard.edu/maps/tile/5310/{z}/{x}/{y}.png', {
   // attribution: '<a href="http://warp.worldmap.harvard.edu/</a>'
  //});
  //controlLayers.addOverlay(Pemb1967, 'Pembroke 1967');

// Opacity Slider
  var handle = document.getElementById('handle'),
    start = false,
    startTop;

  document.onmousemove = function(e) {
      if (!start) return;
      // Adjust control.
      handle.style.top = Math.max(-5, Math.min(195, startTop + parseInt(e.clientY, 10) - start)) + 'px';
      // Adjust opacity.
      Pemb1967.setOpacity(1 - (handle.offsetTop / 200));
      Pemb1980.setOpacity(1 - (handle.offsetTop / 200));
  };

  handle.onmousedown = function(e) {
      // Record initial positions.
      start = parseInt(e.clientY, 10);
      startTop = handle.offsetTop - 5;
      return false;
  };

  document.onmouseup = function(e) {
      start = null;
  };

  // *GET THE GEOJSON
  $.getJSON('data.geojson', function(data) {
    var geojson = L.geoJson(data, {
      onEachFeature: function (feature, layer) {
        (function(layer, properties) {
          // Create numerical icons to match the ID numbers
          // OR remove the next 6 lines for default blue Leaflet markers
          var numericMarker = L.ExtraMarkers.icon({
            icon: 'fa-number',
            number: feature.properties['id'],
            markerColor: 'blue'
          });
          layer.setIcon(numericMarker);

          // Create the contents of each chapter
          var chapter = $('<p></p>', {
            text: feature.properties['chapter'],
            class: 'chapter-header'
          });
          var image = $('<img>', {
            src: feature.properties['image'],
            width: '100%'
          });
          // I am using 'var source' to link out to my timeline pages. Orginally used to link to source of image
          var source = $('<a>', {
            text: feature.properties['source-credit'],
            href: feature.properties['source-link'],
            target: "_blank",
            class: 'source'
          });
          // Added description to add above audio controls to describe audio
          var audioDescription = $('<p></p>', {
            text: feature.properties['audioDescription'],
            class: 'audio-text'
          });
          // Added audio controls to play audio at each marker
          var audio = $('<audio></audio>', {
            src: feature.properties['audio'],
            controls: 'controls',
            preload: 'auto',
          });
          var description = $('<p></p>', {
            text: feature.properties['description'],
            class: 'description'
          });
          var container = $('<div></div>', {
            id: 'container' + feature.properties['id'],
            class: 'image-container'
          });
          container.append(chapter).append(image).append(source).append(audioDescription).append(audio).append(description);
          $('#contents').append(container);
          // Watch the current scroll postion for scroll-driven map navigation!
          var areaHeight = $('.image-container').height() + 50;
          var areaTop = (feature.properties['id']-1) * areaHeight - 50; // -50 is a minor adjustment
          var areaBottom = areaTop + areaHeight - 50; // -50 is a minor adjustment
          $('div#contents').scroll(function() {
            if($(this).scrollTop() >= areaTop && $(this).scrollTop() < areaBottom) {
              $('.image-container').css('opacity', 0.3);
              $('div#container' + feature.properties['id']).css('opacity', 1);
              map.flyTo([feature.geometry.coordinates[1], feature.geometry.coordinates[0] ], feature.properties['zoom']);
            }
          });
//          $(numericMarker).click(function(e) {
//            if($(this) != $('div#container' + feature.properties['id']).css('opacity', 1)) {
//              $('div#contents').animate({
//              scrollTop: $('div#container' + feature.properties['id']).offset().top},
//                'slow')
//            };
//          });
        })(layer, feature.properties);
      }
    });
    $('div#container1').css('opacity', 1);
    map.fitBounds(geojson.getBounds());
    geojson.addTo(map);
  });
}
initMap();
