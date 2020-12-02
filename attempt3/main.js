// Set Token
mapboxgl.accessToken = 'pk.eyJ1Ijoic2Vhbi1tZWFkZSIsImEiOiJja2kzZThkNDgxOTljMnhtc3cyeWpocHAyIn0.dBYGHaeYoY7lVo6X1AS6xg';

// Get current location
navigator.geolocation.getCurrentPosition(successLocation,
    errorLocation,
    {enableHighAccuracy: true
    })

function successLocation(position) {
    setupMap([position.coords.longitude, position.coords.latitude]);
}

function errorLocation() {
    // set it to bermuda triangle if error
    setupMap([25, 71])
}


var lastQueryTime = 0;
var lastAtRestaurant = 0;
var keepTrack = [];
var currentSchedule = [];
var currentRoute = null;
var pointHopper = {};
var pause = true;
var speedFactor = 50;

function setupMap(center) {
    // Create map object
    const map = new mapboxgl.Map({
        // ID of where map ends up
        container: "map",
        style: 'mapbox://styles/mapbox/outdoors-v11',
        center: center,
        zoom: 15
    });

    var geolocate = new mapboxgl.GeolocateControl();

    map.addControl(geolocate);

    geolocate.on('geolocate', function(e) {
        var lon = e.coords.longitude;
        var lat = e.coords.latitude
        var runner = turf.featureCollection([turf.point([lon, lat])]);
        return runner
    });

    // Track user location
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
        enableHighAccuracy: true
        },
        trackUserLocation: true,
        fitBoundsOptions: {zoom:15}
    }));

    

    map.dragPan.disable();
}

// Create a GeoJSON feature collection for the warehouse
//var halfwayMark = turf.featureCollection([turf.point()]);
var runnerLoc = turf.featureCollection([turf.point(runner)]);

map.on('load', function() {
    var marker = document.createElement('div');
    marker.classList = 'truck';
  
    // Create a new marker
    runnerMarker = new mapboxgl.Marker(marker)
      .setLngLat(runnerLoc)
      .addTo(map);

    // Create new layer
    map.addLayer({
        id: 'runnerLoc',
        type: 'circle',
        source: {
            data: runnerLoc,
            type: 'geojson'
        },
        paint: {
            'circle-radius': 20,
            'circle-color': 'white',
            'circle-stroke-color': '#3887be',
            'circle-stroke-width': 3,
        }
    });

    // create symbol
    map.addLayer({
        id: 'runnerLoc',
        type: 'symbol',
        source: {
            data: runnerLoc,
            type: geojson
        },
        layout: {
            'icon-image': 'imgs/runner.png',
            'icon-size': 1
        },
        paint: {
            'text-color': '#3887be'
        }
    })
    
});