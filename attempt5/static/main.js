// Set Token
mapboxgl.accessToken = 'pk.eyJ1Ijoic2Vhbi1tZWFkZSIsImEiOiJja2kzZThkNDgxOTljMnhtc3cyeWpocHAyIn0.dBYGHaeYoY7lVo6X1AS6xg';

var currentLoc;

// console.log(distance.value);

// Get current location
navigator.geolocation.getCurrentPosition(successLocation,
    errorLocation,
    {enableHighAccuracy: true
    })

function successLocation(position) {
    setupMap([position.coords.longitude, position.coords.latitude]);
    currentLoc = [position.coords.latitude, position.coords.longitude];
    return currentLoc;
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

// Create an empty GeoJSON feature collection for drop-off locations
var running_route = turf.featureCollection([]);

function setupMap(center, distance) {
    //console.log(center, "center");
    var runnerLoc = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [center[0], center[1]]
        },
        "properties": {
            "name": "Runner Location"
        }
    };

    //console.log(center[0], center[1]);
    
    if (distance != undefined){
        // console.log("what this works?!?");
        // make a list of lat long for route
        // 1 lat degree is 69 miles
        // 1 long degree is 54.6 miles
        var i = distance/54.6; // dist_in_long
        var j = distance/69; // dist_in_lat

        var d = 3; // divide

        var x = center[0]; //current_long
        var y = center[1]; //currnt_lat

        var coord_i = i/Math.sqrt(Math.pow(d, 2) * 2);
        var coord_j = j/Math.sqrt(Math.pow(d, 2) * 2);
        
        // var circle_points = {
        //     1: [[x], [y - j/d]],
        //     2: [[x + coord_i], [y + coord_j]],
        //     3: [[x + i/d], [y]],
        //     4: [[x + coord_i], [y - coord_j]],
        //     5: [[x], [y - i/d]],
        //     6: [[x - coord_i], [y - coord_j]],
        //     7: [[x - i/d], [y]],
        //     8: [[x - coord_i], [y + coord_j]] 
        // }

        var circle_points = [[x, y - j/d], [x + coord_i, y + coord_j],[x + i/d, y],[x + coord_i, y - coord_j],[x, y - i/d],[x - coord_i, y - coord_j],[x - i/d, y],[x - coord_i, y + coord_j]]
    }
    //console.log(distance, "distance");
 
    console.log(circle_points, "circle_points");
    // console.log(circle_points[1][0]);
    // console.log(circle_points[2]);

    // Create map object
    const map = new mapboxgl.Map({
        // ID of where map ends up
        container: "map",
        style: 'mapbox://styles/mapbox/outdoors-v11',
        center: center,
        zoom: 15
    });

    // Track user location
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
        enableHighAccuracy: true
        },
        trackUserLocation: true,
        fitBoundsOptions: {zoom:15}
    }));

    //map.dragPan.disable();

    

    map.on('load', function() {

    var marker = document.createElement('div');
    marker.classList = 'runner';    

    runnerMarker = new mapboxgl.Marker(marker)
    .setLngLat([center[0]+0.01, center[1]+0.01])
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

    // map.addLayer({
    //     id: 'running-points',
    //     type: 'symbol',
    //     source: {
    //       data: dropoffs,
    //       type: 'geojson'
    //     },
    //     layout: {
    //       'icon-allow-overlap': true,
    //       'icon-ignore-placement': true,
    //       'icon-image': 'marker-15',
    //     }
    //   });
    
//Create a symbol layer on top of circle layer
map.loadImage(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Running_icon_-_Noun_Project_17825.svg/200px-Running_icon_-_Noun_Project_17825.svg.png',
    function (error, image) {
    if (error) throw error;
    map.addImage('cat', image);
    map.addSource('point', {
    'type': 'geojson',
    'data': {
    'type': 'FeatureCollection',
    'features': [
    {
    'type': 'Feature',
    'geometry': {
    'type': 'Point',
    'coordinates': [center[0], center[1]]
    }
    }
    ]
    }
    });
    map.addLayer({
    'id': 'points',
    'type': 'symbol',
    'source': 'point',
    'layout': {
    'icon-image': 'cat',
    'icon-size': 0.25
    }
    });
    }
    );
})}