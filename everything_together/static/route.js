mapboxgl.accessToken = 'pk.eyJ1Ijoic2Vhbi1tZWFkZSIsImEiOiJja2oxcDdlNG4wOHRtMnJwaThqaXNsb3c0In0.b3gF1oc--lsBuTigpSurDg';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [147.101601, -43.245012],
    zoom: 13
});// map variable

function craeteAutoPoints(dist, div, center) {
    // Takes a distance and a divide to give the radius of a circle of 8 points based around the center
    var longConvert = dist/54.6; // dist_in_long
    var latConvert = dist/69; // dist_in_lat

    var x = center[0]; //current_long
    var y = center[1]; //currnt_lat

    var coord_i = longConvert/Math.sqrt(Math.pow(dist, 2) * 2);
    var coord_j = latConvert/Math.sqrt(Math.pow(dist, 2) * 2);

    var circle_points = [[x, y -latConvert/div], 
                        [x + coord_i, y + coord_j],
                        [x + longConvert/div, y],
                        [x + coord_i, y - coord_j],
                        [x, y -latConvert/div],
                        [x - coord_i, y - coord_j],
                        [x -longConvert/div, y],
                        [x - coord_i, y + coord_j]];

    return circle_points;
}

function setupMap() {

    navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {enableHighAccuracy: true
    });

    function errorLocation(){
        alert("Could not find location.");
    }

    function successLocation(position){
        
        const currentLoc = [position.coords.longitude, position.coords.latitude];
        var inputDist = parseFloat(document.getElementById("distance").value);
        var clickRoute = [currentLoc];
        var autoRoute = [currentLoc];
        var nothing = turf.featureCollection([]);
        var startDivide = 3;
        var clicks = turf.featureCollection([]);
        var index = -1;

        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: currentLoc,
            zoom: 13
        });// map variable

        var geoJSON_currentLoc = turf.featureCollection([turf.point(currentLoc)]);

        map.on('load', function() {
            map.addLayer({
                id: 'currentLoc',
                type: 'circle',
                source: {
                    data: geoJSON_currentLoc,
                    type: 'geojson'
                },
                paint: {
                    'circle-radius': 20,
                    'circle-color': 'white',
                    'circle-stroke-color': '#3887be',
                    'circle-stroke-width': 3,
                }
            }); // add layer of current location

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
              }, 'waterway-label'); // add layer to be used for route

              
              map.addLayer({
                id: 'click-marker',
                type: 'symbol',
                source: {
                  data: clicks,
                  type: 'geojson'
                },
                layout: {
                  'icon-allow-overlap': true,
                  'icon-ignore-placement': true,
                  'icon-image': 'marker-15',
                }
              
              });


              if (document.getElementById("dist").style.visibility == "hidden") {

                map.on('click', function(e) {

                    var coords = e.lngLat;

                    var click = [coords.lng, coords.lat]
                    clickRoute.push(click); // updates clickRoute with new point
                    
                    var pt = turf.point(
                        [click[0], click[1]],
                        {
                          orderTime: Date.now(),
                          key: Math.random()
                        }
                    );
                    
                    clicks.features.push(pt);

                    createRouteRequest(clickRoute);
                    addMarker(clicks);
                }); // map on click
    
            } else {
                // get input value
                
    
                // check if inputDist is a number
                if (inputDist > 0){

                    
                    
                    addPoint(inputDist, startDivide);
                    
                } else {
                    alert("Please select a distance.");
                }
    
            }// if/else if for toggle of click or auto
        }); // map on load

        function addMarker(points) {
            map.getSource('click-marker')
                    .setData(points);
        }


    function addPoint(dist, divideInput) {
        index = index + 1;

        if (index < 8){

        var circle_points = craeteAutoPoints(dist, divideInput, currentLoc);

        autoRoute.push(circle_points[index]);

        createRouteRequest(autoRoute);
        } else {
            
                alert("Cannot find suitable loop.");

        }
    }
        
        function createRouteRequest(route){


            // console.log(route.join(';'));
            var url = 'https://api.mapbox.com/optimized-trips/v1/mapbox/driving/'+ route.join(';') + '?&overview=full&steps=true&geometries=geojson&source=first&access_token=' + mapboxgl.accessToken;
            
            $.ajax({
                method: 'GET',
                url: url,
              }).done(function(data) {
                // Create a GeoJSON feature collection
                var routeGeoJSON = turf.featureCollection([turf.feature(data.trips[0].geometry)]);
                var distanceObject = turf.featureCollection([turf.feature(data.trips[0].distance)]);

                var distance = distanceObject["features"][0]["geometry"]
                console.log(distance);
                console.log(inputDist * 1609.34, "distance wated");
                console.log(inputDist * 1609.34 * 1.25, "distance hign");
                console.log(inputDist * 1609.34 * 0.75, "distance low");

                if (document.getElementById("dist").style.visibility == "hidden"){
                    document.getElementById("miles").innerText = (distance/1609.34).toFixed(2);
                    map.getSource('route')
                    .setData(routeGeoJSON);
                } else {
                    if (distance <= inputDist * 1609.34 * 1.25 && distance >= inputDist * 1609.34 * 0.75) {
                        document.getElementById("miles").innerText = (distance/1609.34).toFixed(2);
                    map.getSource('route')
                    .setData(routeGeoJSON);
                    } else {
                        addPoint(inputDist, startDivide);
                    }

                }
                
              });  
        }
        

    }// successLocation
}