// write everything outside if/else statements and then use an if statement to call certain functions

// Set Token 
mapboxgl.accessToken = 'pk.eyJ1Ijoic2Vhbi1tZWFkZSIsImEiOiJja2oxcDdlNG4wOHRtMnJwaThqaXNsb3c0In0.b3gF1oc--lsBuTigpSurDg';

var currentLoc;

// console.log(distance.value);

// Get current location

var geoJSON_route = turf.featureCollection([]);
function successLocation(position) {
    setupMap([position.coords.longitude, position.coords.latitude]);
    currentLoc = [position.coords.latitude, position.coords.longitude];
    return currentLoc;
}

function errorLocation() {
    // set it to bermuda triangle if error
    setupMap([25, 71])
}

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
    center: currentLoc, // starting position
    zoom: 12 // starting zoom
  });

navigator.geolocation.getCurrentPosition(successLocation,
    errorLocation,
    {enableHighAccuracy: true
    })




/* These are for pointer */
var dropoffs = turf.featureCollection([]);
var nothing = turf.featureCollection([]);

function setupMap(center, distance) {
    
var lastAtRestaurant = 0;
var keepTrack = [];
var pointHopper = {};
    
// console.log(center, distance, "fired");
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

    var index = 0;

    var slider = document.querySelector('#flexSwitchCheckChecked:checked');
    // console.log(slider);
    
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

    function newPoint(coords) {
        // Store the clicked point as a new GeoJSON feature
        console.log(coords);
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
          url: assembleQueryURLforClick(),
        }).done(function(data) {
          // Create a GeoJSON feature collection
          console.log(data, "data");
          var routeGeoJSON = turf.featureCollection([turf.feature(data.trips[0].geometry)]);
          // var distance = turf.featureCollection([turf.feature(data.trips[0].distance)]);
        //   console.log(JSON.stringify(distance["features"][0]["geometry"]));
          // document.getElementById("dist").innerText = JSON.stringify(distance["features"][0]["geometry"]);
            // console.log(routeGeoJSON);
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
      function pointer(geojson) {
        map.getSource('dropoffs-symbol')
          .setData(geojson);
      }
      
      // Here you'll specify all the parameters necessary for requesting a response from the Optimization API
      function assembleQueryURLforClick() {
      
        // Store the location of the truck in a variable called coordinates
        var coordinates = [center];
        var distributions = [];
        keepTrack = [center];
      
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
            coordinates.push(center);
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
        console.log(coordinates);
        var url_for_click = 'https://api.mapbox.com/optimized-trips/v1/mapbox/driving/' + coordinates.join(';') + '?distributions=' + distributions.join(';') + '&overview=full&steps=true&geometries=geojson&source=first&access_token=' + mapboxgl.accessToken;
        console.log(url_for_click);
        // Set the profile to `driving`
        // Coordinates will include the current location of the truck,
        return url_for_click;
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

    function newDropoff(count, madeup_route, circle_points, distance_in_miles) {
        // console.log(madeup_route, 1);
        // // console.log(count, 2);
        // console.log(circle_points, 3);
        // console.log(circle_points[count], 4);
        // check the distance for each point in circle_points added to route
        madeup_route.push(circle_points[count]);
        console.log(madeup_route, 6);
        var dist_in_meters = distance_in_miles * 1609.34;
        var url = 'https://api.mapbox.com/optimized-trips/v1/mapbox/driving/' + madeup_route.join(';') + '?distributions=&overview=full&steps=true&geometries=geojson&source=first&access_token=' + mapboxgl.accessToken;
        console.log(url);
        $.ajax({
          method: 'GET',
          url: url,
        }).done(function(data) {
          var dist = turf.featureCollection([turf.feature(data.trips[0].distance)]);
        //   console.log(dist["features"][0]["geometry"], "outside");
        var routeGeoJSON = turf.featureCollection([turf.feature(data.trips[0].geometry)]);
      
        var current_dist = parseFloat((dist["features"][0]["geometry"]));
          if ( current_dist <= dist_in_meters * 1.25 && current_dist >= dist_in_meters * 0.75){
            // console.log(dist["features"][0]["geometry"], "inside");
            document.getElementById("dist").innerText = current_dist/1609.34;
            run = false;
            console.log(routeGeoJSON);
            createRoute(routeGeoJSON);
          } // if check distance
          else if (count < 7) {
            count = count + 1;
            newDropoff(count, madeup_route, circle_points);
          } else {
              alert("Sorry can't find route.")
          }
      
          
      
          
        }); // ajax request return
      
          
      } // newdropoff function

      function createRoute(routeGeoJSON){
              
        map.getSource('route')
          .setData(routeGeoJSON);

    }


    if (slider != null){
    map.on('load', function() {

    var marker = document.createElement('div');
    marker.classList = 'runner';    

    runnerMarker = new mapboxgl.Marker(marker)
    .setLngLat([center[0], center[1]])
    .addTo(map);

               
    

    if (distance != undefined && slider != null){
        // console.log(slider, distance, "fired");
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
        
        var circle_points = [[x, y - j/d], [x + coord_i, y + coord_j],[x + i/d, y],[x + coord_i, y - coord_j],[x, y - i/d],[x - coord_i, y - coord_j],[x - i/d, y],[x - coord_i, y + coord_j]]
        var madeup_route = [center, [x, y - j/distance]];
        // geoJSON_route.features.push(circle_points);
        // console.log(geoJSON_route);
        newDropoff(index, madeup_route, circle_points, distance);
    } 
    });
}// slider != null if statement
else {
    map.on('load', function() {
        // create marker to represent the truck
        var marker = document.createElement('div');
        // set the css for it
        marker.classList = 'truck';
      
        // Create a new marker with variable, location and the map to add it to
        truckMarker = new mapboxgl.Marker(marker)
          .setLngLat(center)
          .addTo(map);

          // console.log(geoJSON_route, "route");
        map.addLayer({
            id: 'dropoffs-symbol',
            type: 'symbol',
            source: {
              data: geoJSON_route,
              type: 'geojson'
            },
            layout: {
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
              'icon-image': 'marker-15',
            }
          });

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
          newPoint(map.unproject(e.point));
          // console.log(map.unproject(e.point));
          pointer(dropoffs);
        });
      
      });
}
    
}