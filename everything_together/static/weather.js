function weatherConditions(){
    
    navigator.geolocation.getCurrentPosition(successLocation,
        errorLocation,
        {enableHighAccuracy: true
        })
    
    function errorLocation() {
        alert("Could not find your location.")
    }

    function successLocation(position) {

        var lat = position.coords.latitude;
        var long = position.coords.longitude;

        var timeIndex = document.getElementById("time").selectedIndex;

        var time = document.getElementById("time")[timeIndex].getAttribute("value");

        var dateIndex = document.getElementById("weekAhead").selectedIndex;

        var date = document.getElementsByTagName("option")[dateIndex].getAttribute("value");

        var today = new Date();

        var day = parseInt(date.slice(-2), 10);

        var hour = parseInt(time.slice(0, 2), 10);

        var currentDay = today.getDate();

        var CurrentHour = today.getHours();
        
        if (hour < parseInt(CurrentHour, 10) + 1 && currentDay == parseInt(day, 10)){
            alert("Stop living in the past and choose a time to go for a run.")
        }
      
        var url = "https://metwdb-openaccess.ichec.ie/metno-wdb2ts/locationforecast?lat=" + lat + "000;long=" + long + "000";


        $.ajax({
          url: Flask.url_for('weather_request'),
          type: 'POST',
          data: JSON.stringify({ "url": url , 'date': date, 'time': time, 'distance': distance}),
          contentType: 'application/json'
          })
          .done(function(result){  
            document.getElementById("temperature").innerText = result["Temperature: "];
            document.getElementById("windDirection").innerText = result["Wind Direction: "];
            document.getElementById("windSpeed").innerText = result["Wind Speed: "];
            document.getElementById("humidity").innerText = result["Humidity: "];
            document.getElementById("pressure").innerText = result["Pressure: "];
            document.getElementById("precipitationMaxMin").innerText = result["Precipitation Max: "] + "/" + result["Precipitation Min: "];

        });
        }
    }
