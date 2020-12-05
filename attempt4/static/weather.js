function weatherConditions(){
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2Vhbi1tZWFkZSIsImEiOiJja2kzZThkNDgxOTljMnhtc3cyeWpocHAyIn0.dBYGHaeYoY7lVo6X1AS6xg';

    // Get current location
    navigator.geolocation.getCurrentPosition(successLocation,
        errorLocation,
        {enableHighAccuracy: true
        })

    function successLocation(position) {
        var lat = position.coords.latitude;
        var long = position.coords.longitude;

        var timeIndex = document.getElementById("time").selectedIndex;

        var time = document.getElementById("time")[timeIndex].getAttribute("value");

        var dateIndex = document.getElementById("weekAhead").selectedIndex;

        var date = document.getElementsByTagName("option")[dateIndex].getAttribute("value");

        //var info = {'lat': lat, 'long': long, 'date': date, 'time': time}
        var url = "https://metwdb-openaccess.ichec.ie/metno-wdb2ts/locationforecast?lat=" + lat + "000;long=" + long + "000";

        //document.getElementById("weatherInfo").innerText = document.getElementById("weatherInfo").innerText.replace("a", url);
        
        var html;
        $.ajax({
          url: Flask.url_for('weather_link'),
          type: 'POST',
          data: JSON.stringify({ "url": url , 'date': date, 'time': time}),
          contentType: 'application/json'
          })
          .done(function(result){     // on success get the return object from server
            document.getElementById("temperature").innerText = "Temperature: " + result["temperature"];
            document.getElementById("windDirection").innerText = "Wind Direction: " + result["windDirection"];
            document.getElementById("windSpeed").innerText = "Wind Speed: " + result["windSpeed"];
            document.getElementById("humidity").innerText = "Humidity :" + result["humidity"];
            document.getElementById("pressure").innerText = "Pressure :" + result["pressure"];
            document.getElementById("precipitationMax").innerText = "Precipitation Max :" + result["precipitationMax"];
            document.getElementById("precipitationMin").innerText = "Precipitation Min:" + result["precipitationMin"];
        })
        }
        //var csvInfo = {lat: lat, long: long, date: date, time: time};

        //var filler = lat + "," + long + "," + date + "," + time + ",";
        // console.log(time);
        // console.log(date);
        

        
        // console.log(csvInfo);

                // // year-month-day

        //$.ajax({ url: url, success: function(data) { alert(data); } });
    }
