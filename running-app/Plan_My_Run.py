from flask import Flask, redirect, url_for, render_template, request, make_response, jsonify
import json
from flask_jsglue import JSGlue
import requests
import urllib3
import datetime
from bs4 import BeautifulSoup
urllib3.disable_warnings()

app = Flask(__name__)
jsglue = JSGlue(app)

@app.route("/")
def home():
    resp = make_response(render_template("index.html"))
    # Set a same-site cookie for first-party contexts
    # Ensure you use "add" to not overwrite existing cookie headers
    # Set a cross-site cookie for third-party contexts
    
    resp.headers.add('Set-Cookie','cookie2=value2; SameSite=None; Secure')
    return resp

@app.route("/weather_link", methods=["POST"])
def weather_request():
    # Check for incoming post and collect data from url in the form of xml
    if request.method == "POST":
        data = {}
        data = request.json
        response = requests.get(data['url'])
        soup = BeautifulSoup(response.text, 'xml')
 
        # collect date and time
        date= data['date']
        time= data['time']

        # Find the weather information for the date and time you're interested in
        result = soup.find_all("time", {"from": date + "T" + time + ":00Z"})

        # convert the input date and time to a python datetime
        """
        This is because Met Éireann stores weather information in 3 hour intervals
        after 85 hours and in 6 hour intervals after 144 hours.
        """
        date_for_python = datetime.datetime.strptime(date + ' ' + time + ":00", '%Y-%m-%d %H:%M:%S')
        difference = abs((date_for_python - datetime.datetime.now()))
        seconds_in_day = 24 * 60 * 60
        mins, secs = divmod(difference.days * seconds_in_day + difference.seconds, 60)
        # So you check how many hours are there between today and when the user requests the info for
        hours = mins/60
  

        time = int(time[slice(2)])
        # after 90 hours weaether info is given in 3 hour intervals and after 
        # 144 they are given in 6 hour intervals. I check for the nearest 
        # weather information if this is the case
        while result == []:
            time = time - 1
            time = str(time)
            if len(time) == 1:
                time = "0" + time + ":00"
            else:
                time = str(time) + ":00"
            result = soup.find_all("time", {"from": date + "T" + time + ":00Z"})
            time = int(time[slice(2)])
        
        
        # Create dictionary and fill relevant information along with key
        weather_dict = {}
        temperature = result[0].temperature['value']
        weather_dict["Temperature: "] = temperature
        windDirection = result[0].windDirection['name']
        weather_dict["Wind Direction: "] = windDirection
        windSpeed = result[0].windSpeed['mps']
        weather_dict["Wind Speed: "] = windSpeed
        humidity = result[0].humidity['value']
        weather_dict["Humidity: "] = humidity
        pressure = result[0].pressure['value']
        weather_dict["Pressure: "] = pressure
        if len(str(result[1].precipitation)) > 55:
            precipitationMax = result[1].precipitation['maxvalue']
            weather_dict["Precipitation Max: "] = precipitationMax
            precipitationMin = result[1].precipitation['minvalue']
            weather_dict["Precipitation Min: "] = precipitationMin
        else:
            precipitation = result[1].precipitation['value']
            weather_dict["Precipitation: "] = precipitation

        return weather_dict

if __name__ == "__main__":
    app.run(debug=True)