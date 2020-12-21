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

// Make a list of variables needed

var truckLocation = [-83.093, 42.376];
var warehouseLocation = [-83.093, 42.376];
var lastAtRestaurant = 0;
var pointHopper = {};
var keepTrack = [];

// Add your access token
mapboxgl.accessToken = 'pk.eyJ1Ijoic2Vhbi1tZWFkZSIsImEiOiJja2kzZThkNDgxOTljMnhtc3cyeWpocHAyIn0.dBYGHaeYoY7lVo6X1AS6xg';

// Initialize a map
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
  center: truckLocation, // starting position
  zoom: 12 // starting zoom
});

// Create a GeoJSON feature collection for the warehouse
var warehouse = turf.featureCollection([turf.point(warehouseLocation)]);

// Create an empty GeoJSON feature collection for drop-off locations
var dropoffs = turf.featureCollection([]);

// Create an empty GeoJSON feature collection, which will be used as the data source for the route before users add any new data
var nothing = turf.featureCollection([]);

// This function takes in 
function newDropoff(coords) {
  // Store the clicked point as a new GeoJSON feature
  var pt = turf.point(
    [coords.lng, coords.lat],
    {
      // create a key for this point
      key: Math.random()
    }
  );
  dropoffs.features.push(pt);
  // add key of point as key in dictionary and pt as value
  pointHopper[pt.properties.key] = pt;

  // Make a request to the Optimization API
  $.ajax({
    method: 'GET',
    // use this method that outputs the url
    url: assembleQueryURL(),
  }).done(function(data) {
    // Create a GeoJSON feature collection
    var routeGeoJSON = turf.featureCollection([turf.feature(data.trips[0].geometry)]);
    // var distance = turf.featureCollection([turf.feature(data.trips[0].distance)]);
    // // console.log(JSON.stringify(distance["features"][0]["geometry"]));
    // document.getElementById("dist").innerText = JSON.stringify(distance["features"][0]["geometry"]);

    // If there is no route provided, reset
    if (!data.trips[0]) {
      // let the route equal an empty feature
      routeGeoJSON = nothing;
    } else {
      // Update the `route` source by getting the route source
      // and setting the data equal to routeGeoJSON
      // set route layer data i think 
      map.getSource('route')
        .setData(routeGeoJSON);
    }
    // if limit is reach of points
    if (data.waypoints.length === 12) {
      window.alert('Maximum number of points reached. Read more at docs.mapbox.com/api/navigation/#optimization.');
    }
  });
}

// set dropoff points layer data
function updateDropoffs(geojson) {
  map.getSource('dropoffs-symbol')
    .setData(geojson);
}

// Here you'll specify all the parameters necessary for requesting a response from the Optimization API
function assembleQueryURL() {

  // Store the location of the truck in a variable called coordinates
  var coordinates = [truckLocation];
  var distributions = [];
  keepTrack = [truckLocation];

  // Create an array of GeoJSON feature collections for each point
  var restJobs = objectToArray(pointHopper);
  // console.log(pointHopper, "point hopper");
  //{0.49755940061288406: {…}, 0.8971768295500984: {…}, 0.4838487808545915: {…}}0.4838487808545915: {type: "Feature", properties: {…}, geometry: {…}}0.8971768295500984: {type: "Feature", properties: {…}, geometry: {…}}0.49755940061288406: {type: "Feature", properties: {…}, geometry: {…}}__proto__: Object "
  // console.log(restJobs, "rest jobs");
  // for (var y = 0; y > length.pointHopper; y++){
  //   var restJobs = objectToArray(pointHopper);
  // }
  // this code sets up the request  

  // If there are any orders from this restaurant
  if (restJobs.length > 0) {


    // If the request was made after picking up from the restaurant,
    // Add the restaurant as an additional stop
    if (restJobs) {
      var restaurantIndex = coordinates.length;
      // Add the restaurant as a coordinate
      coordinates.push(warehouseLocation);
      // push the restaurant itself into the array
      keepTrack.push(pointHopper.warehouse);
    }

    restJobs.forEach(function(d, i) {
      // Add dropoff to list
      keepTrack.push(d);
      coordinates.push(d.geometry.coordinates);
      // if order not yet picked up, add a reroute
      if (restJobs && d.properties.orderTime > lastAtRestaurant) {
        distributions.push(restaurantIndex + ',' + (coordinates.length - 1));
      }
    });
  }

  // Set the profile to `driving`
  // Coordinates will include the current location of the truck,
  return 'https://api.mapbox.com/optimized-trips/v1/mapbox/driving/' + coordinates.join(';') + '?distributions=' + distributions.join(';') + '&overview=full&steps=true&geometries=geojson&source=first&access_token=' + mapboxgl.accessToken;
}

// Chanegs an object to an array
function objectToArray(obj) {
  var keys = Object.keys(obj);
  // console.log(keys, "keys");
  var routeGeoJSON = keys.map(function(key) {
    // console.log(key, "key");
    // console.log(obj[key], "obj[key]");
    return obj[key];
  });
  // console.log(routeGeoJSON, "routeGeoJSON");
  return routeGeoJSON;
}

// When the map is loaded

map.on('load', function() {
  // create marker to represent the truck
  var marker = document.createElement('div');
  // set the css for it
  marker.classList = 'truck';

  // Create a new marker with variable, location and the map to add it to
  truckMarker = new mapboxgl.Marker(marker)
    .setLngLat(truckLocation)
    .addTo(map);

  // create layer for dropoffs
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


  // // Listen for a click on the map
  // map.on('click', function(e) {
  //   // When the map is clicked, add a new drop-off point
  //   // and update the `dropoffs-symbol` layer
  //   // map.unproject(e.point) = {lng: -83.10535961914064, lat: 42.36629807644036}
  //   newDropoff(map.unproject(e.point));
  //   // console.log(map.unproject(e.point));
  //   updateDropoffs(dropoffs);
  // });

  // Listen for a click on the map
  map.on('click', function(e) {
    // When the map is clicked, add a new drop-off point
    // and update the `dropoffs-symbol` layer
    newDropoff(map.unproject(e.point));
    // console.log(map.unproject(e.point));
    updateDropoffs(dropoffs);
  });







});
