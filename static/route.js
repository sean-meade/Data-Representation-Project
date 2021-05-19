import * as turf from '@turf/turf';

// set API accessToken for MapBox
mapboxgl.accessToken =
	'pk.eyJ1Ijoic2Vhbi1tZWFkZSIsImEiOiJja2oxcDdlNG4wOHRtMnJwaThqaXNsb3c0In0.b3gF1oc--lsBuTigpSurDg';

// Initialize a map with the center being an view of Ireland
const map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/streets-v11',
	center: [-7.266155, 53.75014],
	zoom: 4.75,
}); // map variable

// function ran when routeButton is clicked
function setupMap() {
	// Get current geo location position
	navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
		enableHighAccuracy: true,
	});

	// alert if no location found
	function errorLocation() {
		alert('Could not find location.');
	}

	// run function with position as current geo location
	function successLocation(position) {
		// Set all the higher level variables
		// get long and lat (has to be in this order for MapBox)
		const currentLoc = [position.coords.longitude, position.coords.latitude];
		// The input distance (if there is one)
		var inputDist = parseFloat(document.getElementById('distance').value);
		// A list to track clicks (if in click route mode)
		var clickRoute = [currentLoc];
		// A list to track points in auto route mode
		var autoRoute = [currentLoc];
		// an empty geoJSON feature collection
		var nothing = turf.featureCollection([]);
		// starting divide variable (I'm trying to fine tune the auto route method)
		var startDivide = 3;
		// a geoJSON feature collection to track clicks to add markers to map
		var clicks = turf.featureCollection([]);
		// used again in the creation of thr auto route
		var index = -1;

		// initialize a new map zoomed in on current location
		const map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/streets-v11',
			center: currentLoc,
			zoom: 13,
		});

		// a geoJSON feature collection representing current location
		var geoJSON_currentLoc = turf.featureCollection([turf.point(currentLoc)]);

		// function that executes only after the map has loaded
		map.on('load', function () {
			// create a layer over the map the represents the
			// current location as a small circle
			map.addLayer({
				id: 'currentLoc',
				type: 'circle',
				source: {
					data: geoJSON_currentLoc,
					type: 'geojson',
				},
				paint: {
					'circle-radius': 10,
					'circle-color': 'white',
					'circle-stroke-color': '#3887be',
					'circle-stroke-width': 3,
				},
			});

			// create a source to add to for the route but
			// initially set to nothing
			map.addSource('route', {
				type: 'geojson',
				data: nothing,
			});

			// Add a layer to the map to represent the route
			// giving 'route' as the source data
			map.addLayer(
				{
					id: 'routeline-active',
					type: 'line',
					source: 'route',
					layout: {
						'line-join': 'round',
						'line-cap': 'round',
					},
					paint: {
						'line-color': '#3887be',
						'line-width': ['interpolate', ['linear'], ['zoom'], 12, 3, 22, 12],
					},
				},
				'waterway-label'
			);

			// Add layer that will be used to mark clicks as dots
			// for the click route
			map.addLayer({
				id: 'click-marker',
				type: 'symbol',
				source: {
					data: clicks,
					type: 'geojson',
				},
				layout: {
					'icon-allow-overlap': true,
					'icon-ignore-placement': true,
					'icon-image': 'marker-15',
				},
			});

			// if click route is chosen
			if (document.getElementById('dist').style.visibility == 'hidden') {
				// when the map is clicked with the long and lat of click
				map.on('click', function (e) {
					var coords = e.lngLat;
					var click = [coords.lng, coords.lat];
					clickRoute.push(click); // updates clickRoute with new point

					// set the click as a geoJSON feature
					var pt = turf.point([click[0], click[1]], {
						orderTime: Date.now(),
						key: Math.random(),
					});

					clicks.features.push(pt); // updates clickRoute with new geoJSON feature

					// create route and update distance of it
					createRoute(clickRoute);
					// Add click to make a marker on the map
					addMarker(clicks);
				}); // map on click
			} else {
				// check if inputDist is a number
				if (inputDist > 0) {
					// use the input distance to create route
					createAutoRoute(inputDist, startDivide);
				} else {
					// tells user to input a number
					alert('Please select a distance.');
				}
			} // if/else if for toggle of click or auto
		}); // map on load

		// function that simply adds a marker where clicked
		function addMarker(points) {
			map.getSource('click-marker').setData(points);
		}

		// create auto route
		function createAutoRoute(dist, divideInput) {
			// index to add points from the circle points
			index = index + 1;

			// circle points only has 8 points
			if (index < 8) {
				// save the output of  the created points
				var circle_points = craeteAutoPoints(dist, divideInput, currentLoc);

				// add the next point to the autoRoute
				autoRoute.push(circle_points[index]);

				// create route with above
				createRoute(autoRoute);
			} else {
				// throws alert if a route can't be found with the 8 points
				alert(
					'Sorry cannot find suitable route (still trying to work out the kinks), try using the click route option.'
				);
			}
		}

		// create a route with given lat long values
		function createRoute(route) {
			// create url to make request with
			var url =
				'https://api.mapbox.com/optimized-trips/v1/mapbox/driving/' +
				route.join(';') +
				'?&overview=full&steps=true&geometries=geojson&source=first&access_token=' +
				mapboxgl.accessToken;

			$.ajax({
				method: 'GET',
				url: url,
			}).done(function (data) {
				// Create a GeoJSON feature collection containing the route
				var routeGeoJSON = turf.featureCollection([
					turf.feature(data.trips[0].geometry),
				]);
				// grab the distance of the route
				var distanceObject = turf.featureCollection([
					turf.feature(data.trips[0].distance),
				]);
				var distance = distanceObject['features'][0]['geometry'];

				// if the user is using clicks to create route
				if (document.getElementById('dist').style.visibility == 'hidden') {
					// Display the distance of the route
					document.getElementById('miles').innerText = (
						distance / 1609.34
					).toFixed(2);
					// show route on map
					map.getSource('route').setData(routeGeoJSON);
				} else {
					// check to see if the auto route produces a roue with a distance with 25% of input
					// distance (yes that's how bad it is it doesn't even work most of the time)
					if (
						distance <= inputDist * 1609.34 * 1.25 &&
						distance >= inputDist * 1609.34 * 0.75
					) {
						// Display the distance of the route
						document.getElementById('miles').innerText = (
							distance / 1609.34
						).toFixed(2);
						// show route on map
						map.getSource('route').setData(routeGeoJSON);
					} else {
						// otherwise run the create Auto route again with the next point
						createAutoRoute(inputDist, startDivide);
					}
				}
			});
		}

		function craeteAutoPoints(dist, div, center) {
			// This function creates a circle of points around the center
			// with radius longConvert or latConvert depending on the direction

			var longConvert = dist / 54.6; // dist_in_long
			var latConvert = dist / 69; // dist_in_lat

			var x = center[0]; //current_long
			var y = center[1]; //currnt_lat

			var coord_i = longConvert / Math.sqrt(Math.pow(dist, 2) * 2);
			var coord_j = latConvert / Math.sqrt(Math.pow(dist, 2) * 2);

			var circle_points = [
				[x, y - latConvert / div],
				[x + coord_i, y + coord_j],
				[x + longConvert / div, y],
				[x + coord_i, y - coord_j],
				[x, y - latConvert / div],
				[x - coord_i, y - coord_j],
				[x - longConvert / div, y],
				[x - coord_i, y + coord_j],
			];
			return circle_points;
		}
	} // successLocation
}
