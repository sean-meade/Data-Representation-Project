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
    var dayNo = dateChange.getDate();
    var dateVal = dateChange.getMonth() + 1;
    var dayName = dayNames[dateChange.getDay()];
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

for (var j = 0; j < 24; j++){
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