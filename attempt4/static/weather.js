function weatherConditions(){
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2Vhbi1tZWFkZSIsImEiOiJja2kzZThkNDgxOTljMnhtc3cyeWpocHAyIn0.dBYGHaeYoY7lVo6X1AS6xg';

    // Get current location
    navigator.geolocation.getCurrentPosition(successLocation,
        errorLocation,
        {enableHighAccuracy: true
        })

    function successLocation(position) {

        function diff_hours(dt2, dt1) 
        {

            var diff =(dt2.getTime() - dt1.getTime()) / 1000;
            diff /= (60 * 60);
            return Math.abs(Math.round(diff));
        
        }
        var lat = position.coords.latitude;
        var long = position.coords.longitude;

        var timeIndex = document.getElementById("time").selectedIndex;

        var time = document.getElementById("time")[timeIndex].getAttribute("value");

        var dateIndex = document.getElementById("weekAhead").selectedIndex;

        var date = document.getElementsByTagName("option")[dateIndex].getAttribute("value");

        var today = new Date();

        //console.log(date);
        //var year = parseInt(date.slice(0, 5), 10);
        //console.log(year, "year");
        //var month = parseInt(date.slice(5, 7), 10);
        //console.log(month, "month");
        var day = parseInt(date.slice(-2), 10);
        //console.log(day, "day");
        var hour = parseInt(time.slice(0, 2), 10);
        //console.log(hour, "hour");

        //var dayOfRun = new Date(year, month, day, hour, 0,0,0);
        //console.log(dayOfRun, "run");
        
        var currentDay = today.getDate();

        var CurrentHour = today.getHours();
        // console.log(parseInt(hour, 10));
        // console.log(parseInt(time, 10));
        if (hour < parseInt(CurrentHour, 10) + 1 && currentDay == parseInt(day, 10)){
            alert("You can't run in the past. Please choose a time in the future.")
        }
        // else if ( diff_hours(today, dayOfRun) > 90 ){
        //     alert("Gonna have to fix this");
        // }

        

        //var info = {'lat': lat, 'long': long, 'date': date, 'time': time}
        var url = "https://metwdb-openaccess.ichec.ie/metno-wdb2ts/locationforecast?lat=" + lat + "000;long=" + long + "000";

        var distance = document.getElementById("distance").value;

        //document.getElementById("weatherInfo").innerText = document.getElementById("weatherInfo").innerText.replace("a", url);
        console.log(date, time);
        console.log(url);
        $.ajax({
          url: Flask.url_for('weather_link'),
          type: 'POST',
          data: JSON.stringify({ "url": url , 'date': date, 'time': time, 'distance': distance}),
          contentType: 'application/json'
          })
          .done(function(result){  
            document.getElementById("temperature").innerText = "Temperature: " + result["Temperature: "];
            document.getElementById("windDirection").innerText = "Wind Direction: " + result["Wind Direction: "];
            document.getElementById("windSpeed").innerText = "Wind Speed: " + result["Wind Speed: "];
            document.getElementById("humidity").innerText = "Humidity: " + result["Humidity: "];
            document.getElementById("pressure").innerText = "Pressure: " + result["Pressure: "];
            if (result['Precipitation'] == undefined) {
                document.getElementById("precipitationMax").innerText = "Precipitation Max: " + result["Precipitation Max: "];
                document.getElementById("precipitationMin").innerText = "Precipitation Min: " + result["Precipitation Min: "];
            } else {
            document.getElementById("precipitation").innerText = "Precipitation: " + result["Precipitation: "];
            }
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
