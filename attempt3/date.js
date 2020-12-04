Date.prototype.addDays = function(days) {
    var newDate = new Date(this.valueOf());
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}

var dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
]

for (var i = 0; i < 7; i++) {
    const selectBox = document.querySelector('#weekAhead');
    var date = new Date();
    var dateChange = date.addDays(i);
    var dayNo = dateChange.getDay();
    var dateVal = dateChange.getDate();
    var dayName = dayNames[dayNo];
    if (dateVal < 10){
        dateVal = "0" + dateVal;
    }
    if (dayNo < 10){
        dayNo = "0" + dayNo;
    }
    var year = dateChange.getFullYear();

    var dateForWeather = year + "-" + dateVal + "-" + dayNo;
    let newOption = new Option(dayName, dateForWeather);
    selectBox.add(newOption,undefined);
}

for (var j = 0; j < 25; j++){
    var timeOption;
    const selectBox = document.querySelector('#time');
    if (j < 10) {
        timeOption = "0" + j + ":00";
    } else {
        timeOption = j + ":00";
    }
    let newOption = new Option(timeOption, timeOption);
    selectBox.add(newOption,undefined);
}
 
var x = new XMLHttpRequest();
x.open("GET", "http://metwdb-openaccess.ichec.ie/metno-wdb2ts/locationforecast?lat=52.887680;long=-8.457440;from=2020-12-05T02:00;to=2020-12-05T12:00", true);