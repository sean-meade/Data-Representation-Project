/*

Notes to self when not nearly midnight (I hope this makes sense):
First create an empty GeoJSON feature collection for made up points. 

Then do somthing like this: (this is in the newDropoff function)

// Update the `route` source by getting the route source
// and setting the data equal to routeGeoJSON
map.getSource('route')
  .setData(routeGeoJSON);

Wrap the onclink function in an if statement: 

if (radiobutton is set to click){
// Listen for a click on the map
  map.on('click', function(e) {
    // When the map is clicked, add a new drop-off point
    // and update the `dropoffs-symbol` layer
    newDropoff(map.unproject(e.point));
    updateDropoffs(dropoffs);
  });}
  else {
    use the distance that was input
    or unhide the distance input
  }

May have to rebuild this a lot because of ajax request (you'll need one for the auto route as well).

*/

var truckLocation = [-83.093, 42.376];
var warehouseLocation = [-83.083, 42.363];
var lastQueryTime = 0;
var lastAtRestaurant = 0;
var keepTrack = [];
var currentSchedule = [];
var currentRoute = null;
var pointHopper = {};
var pause = true;
var speedFactor = 50;

// Add your access token
mapboxgl.accessToken = 'pk.eyJ1Ijoic2Vhbi1tZWFkZSIsImEiOiJja2kzZThkNDgxOTljMnhtc3cyeWpocHAyIn0.dBYGHaeYoY7lVo6X1AS6xg';

// Initialize a map
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
  center: truckLocation, // starting position
  zoom: 12 // starting zoom
});

var distance = 1.5;

var u = distance/54.6; // dist_in_long
var j = distance/69; // dist_in_lat

var center = [-83.093, 42.376];

var x = center[0]; //current_long
var y = center[1]; //currnt_lat

var coord_i = u/Math.sqrt(Math.pow(distance, 2) * 2);
var coord_j = j/Math.sqrt(Math.pow(distance, 2) * 2);

// var circle_points = {
//   1: [[x], [y - j/d]],
//   2: [[x + coord_i], [y + coord_j]],
//   3: [[x + i/d], [y]],
//   4: [[x + coord_i], [y - coord_j]],
//   5: [[x], [y - i/d]],
//   6: [[x - coord_i], [y - coord_j]],
//   7: [[x - i/d], [y]],
//   8: [[x - coord_i], [y + coord_j]] 
// }



var circle_points = [
  
  [x + coord_i, y + coord_j],
  [x + u/distance, y],
  [x + coord_i, y - coord_j],
  [x, y + j/distance],
  [x - coord_i, y - coord_j],
  [x - u/distance, y],
  [x - coord_i, y + coord_j],
]

var dropoffs = turf.featureCollection([turf.point(truckLocation)]);
var run = true;

// for (var p = 0; p < circle_points.length; p++){
//   var ptx = turf.point(
//     [circle_points[p][0], circle_points[p][1]],
//   );
//     dropoffs.features.push(ptx);

// }
// var dropoffs = [
//   [truckLocation],
//   [x, y - j/distance]
// ]; 
// console.log(dropoffs);


// Create a GeoJSON feature collection for the warehouse
var warehouse = turf.featureCollection([turf.point(warehouseLocation)]);

// Create an empty GeoJSON feature collection for drop-off locations

// Create an empty GeoJSON feature collection, which will be used as the data source for the route before users add any new data
var nothing = turf.featureCollection([]);


function newDropoff() {
  // Store the clicked point as a new GeoJSON feature with
  // two properties: `orderTime` and `key`
  var madeup_route = [truckLocation, [x, y - j/distance]];
  for (var r = 0; r < circle_points.length; r ++){
    console.log(run, "this");
    if (run == true){
      dropoffs.features.push(turf.point(circle_points[r]));
      madeup_route.push(circle_points[r]);
      
    
  
  var pt = turf.point(
    [circle_points[r][0], circle_points[r][1]],
    // [coords.lng, coords.lat],
    {
      // create a key for this point
      key: Math.random()
    }
  );
  dropoffs.features.push(pt);
  pointHopper[pt.properties.key] = pt;
  // console.log(dropoffs);
  // console.log(66);
  // Make a request to the Optimization API
  $.ajax({
    method: 'GET',
    url: 'https://api.mapbox.com/optimized-trips/v1/mapbox/driving/' + madeup_route.join(';') + '?distributions=&overview=full&steps=true&geometries=geojson&source=first&access_token=' + mapboxgl.accessToken,
  }).done(function(data) {
    console.log(data);
    // Create a GeoJSON feature collection
    
    var dist = turf.featureCollection([turf.feature(data.trips[0].distance)]);
    

    
    // console.log(JSON.stringify(distance["features"][0]["geometry"]));
    // console.log(dist["features"][0]["geometry"]);
    // dist = new.js:139 13664.199999999997 for all points
    var current_dist = parseFloat((dist["features"][0]["geometry"]));
    if ( current_dist <= 6000.00 || current_dist >= 3000.00){
      var routeGeoJSON = turf.featureCollection([turf.feature(data.trips[0].geometry)]);
    document.getElementById("dist").innerText = current_dist;
    run = false;
    console.log(routeGeoJSON);
    }

    // If there is no route provided, reset
    if (!data.trips[0]) {
      routeGeoJSON = nothing;
    } else {
      // Update the `route` source by getting the route source
      // and setting the data equal to routeGeoJSON
      map.getSource('route')
        .setData(routeGeoJSON);
    }

    if (data.waypoints.length === 12) {
      window.alert('Maximum number of points reached. Read more at docs.mapbox.com/api/navigation/#optimization.');
    }
  });
} else {
  break;
}
  }
}

function updateDropoffs(geojson) {
  map.getSource('dropoffs-symbol')
    .setData(geojson);
}

// // Here you'll specify all the parameters necessary for requesting a response from the Optimization API
// function assembleQueryURL() {
//   // console.log(circle_points.push([truckLocation]));
//   // Store the location of the truck in a variable called coordinates
  


//   var url = 

//   //console.log(url);
//   // Set the profile to `driving`
//   // Coordinates will include the current location of the truck,
//   return url;
// }

function objectToArray(obj) {
  var keys = Object.keys(obj);
  var routeGeoJSON = keys.map(function(key) {
    return obj[key];
  });
  return routeGeoJSON;
}


map.on('load', function() {
  var marker = document.createElement('div');
  marker.classList = 'truck';

  // Create a new marker
  truckMarker = new mapboxgl.Marker(marker)
    .setLngLat(truckLocation)
    .addTo(map);




  


  map.addLayer({
    id: 'dropoffs-symbol',
    type: 'symbol',
    source: {
      data: dropoffs,
      type: 'geojson'
    },
    layout: {
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-image': 'marker-15',
    }
  });


  map.addSource('route', {
    type: 'geojson',
    data: nothing
  });
  
  map.addLayer({
    id: 'routeline-active',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#3887be',
      'line-width': [
        "interpolate",
        ["linear"],
        ["zoom"],
        12, 3,
        22, 12
      ]
    }
  }, 'waterway-label');


  
  // Listen for a click on the map
  map.on('click', function(e) {
    // When the map is clicked, add a new drop-off point
    // and update the `dropoffs-symbol` layer
    // one point each time
      newDropoff();
      
    // newDropoff(map.unproject(e.point));
    // console.log(map.unproject(e.point));
    // console.log((e.point));
    // e.point = new.js:309 a {x: 534, y: 161}
    // map.unproject(e.point) = Dl {lng: -83.09574658203132, lat: 42.369722455875035}lat: 42.369722455875035lng: -83.09574658203132__proto__: Object

    updateDropoffs(dropoffs);
  });


 




});

