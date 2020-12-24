// A function that adds a number of days to the given date and returns the date
Date.prototype.addDays = function(days) {
    var newDate = new Date(this.valueOf());
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}

// This is a list of days of the week used to fill selection options
var dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
]

// this loop fills out the days of the week 
// in the selection drop down (starting with
// current day) and sets the day as the text
// and the date as value (to be used in request
// later)
for (var i = 0; i < 7; i++) {
    // select the weekAhead selection to add options to
    const selectBox = document.querySelector('#weekAhead');

    // get day, month and year
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

    // set date the same format for request later
    var dateForWeather = year + "-" + dateVal + "-" + dayNo;

    // set an option with text as dayName and value as date
    let newOption = new Option(dayName, dateForWeather);
    selectBox.add(newOption,undefined);
}

// create the drop down options for time similar to above
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