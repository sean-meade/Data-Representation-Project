// function called when button is hit
function weatherConditions(){
    
    // Get current location for weather request
    navigator.geolocation.getCurrentPosition(successLocation,
        errorLocation,
        {enableHighAccuracy: true
        })
    
    // If there's problem with getting location throw alert
    function errorLocation() {
        alert("Could not find your location.")
    }

    // If successful request use the current geolocation (position)
    function successLocation(position) {

        // extract latitude and longitude from position
        var lat = position.coords.latitude;
        var long = position.coords.longitude;

        // get index of both dropdown choices
        var timeIndex = document.getElementById("time").selectedIndex;
        var dateIndex = document.getElementById("weekAhead").selectedIndex;

        // use index to get value
        var time = document.getElementById("time")[timeIndex].getAttribute("value");
        var date = document.getElementsByTagName("option")[dateIndex].getAttribute("value");

        var today = new Date();

        // check to see if the selected time and day has past 
        // (the api used doesn't hold past information)
        var day = parseInt(date.slice(-2), 10);
        var hour = parseInt(time.slice(0, 2), 10);
        var currentDay = today.getDate();
        var CurrentHour = today.getHours();
        // throw alert if in the past
        if (hour < parseInt(CurrentHour, 10) + 1 && currentDay == parseInt(day, 10)){
            alert("Stop living in the past and choose a time to go for a run.")
        }
      
        // create url with lat and long to make request with Python (no matter what I tried I couldn't 
        // get it work with a ajax request)
        var url = "http://metwdb-openaccess.ichec.ie/metno-wdb2ts/locationforecast?lat=" + lat + "000;long=" + long + "000";

        // POST to Python file the url, date, and time given by user
        $.ajax({
          url: Flask.url_for('weather_request'),
          type: 'POST',
          data: JSON.stringify({ "url": url , 'date': date, 'time': time}),
          contentType: 'application/json'
          })
          .done(function(result){
            // When the Python file returns the parsed data set weather information to the right elements
            document.getElementById("temperature").innerText = result["Temperature: "];
            document.getElementById("windDirection").innerText = result["Wind Direction: "];
            document.getElementById("windSpeed").innerText = result["Wind Speed: "];
            document.getElementById("humidity").innerText = result["Humidity: "];
            document.getElementById("pressure").innerText = result["Pressure: "];
            document.getElementById("precipitationMaxMin").innerText = result["Precipitation Max: "] + "/" + result["Precipitation Min: "];

        });
        }
    }
