mapboxgl.accessToken = 'pk.eyJ1Ijoic2Vhbi1tZWFkZSIsImEiOiJja2kzZThkNDgxOTljMnhtc3cyeWpocHAyIn0.dBYGHaeYoY7lVo6X1AS6xg';

function weatherConditions(){
    // Get current location
    navigator.geolocation.getCurrentPosition(successLocation,
        errorLocation,
        {enableHighAccuracy: true
        })

    function successLocation(position) {
        var lat = position.coords.latitude;
        var long = position.coords.longitude;

        var time = document.getElementById("time");

        var dateIndex = document.getElementById("weekAhead").selectedIndex;

        var date = document.getElementsByTagName("option")[dateIndex];

        // console.log(lat, long);

        var url = "http://metwdb-openaccess.ichec.ie/metno-wdb2ts/locationforecast?lat=" + lat + ";long=" + long + ";from=" + date + "T" + time + ";to=" + date + "T" + time;
        // year-month-day



        
}
}