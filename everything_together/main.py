from flask import Flask, redirect, url_for, render_template, request, make_response, jsonify
import json
from flask_jsglue import JSGlue
import requests
import datetime
from bs4 import BeautifulSoup

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
    if request.method == "POST":
        data = {}
        data = request.json
        response = requests.get(data['url'], verify=False)
        soup = BeautifulSoup(response.text, 'xml')
 
        date= data['date']
        time= data['time']

        result = soup.find_all("time", {"from": date + "T" + time + ":00Z"})

        date_for_python = datetime.datetime.strptime(date + ' ' + time + ":00", '%Y-%m-%d %H:%M:%S')
        difference = abs((date_for_python - datetime.datetime.now()))
        seconds_in_day = 24 * 60 * 60
        mins, secs = divmod(difference.days * seconds_in_day + difference.seconds, 60)
        hours = mins/60
  
        if result == [] and hours > 85 and hours < 144:
            time = int(time[slice(2)])
            while time % 3 != 0:
                time = time - 1
            time = str(time)
            if len(time) == 1:
                time = "0" + time + ":00"
            else:
                time = str(time) + ":00"
            result = soup.find_all("time", {"from": date + "T" + time + ":00Z"})
        elif result == [] and hours > 144:
            time = int(time[slice(2)])
            while time % 6 != 0:
                time = time - 1
            time = str(time)
            if len(time) == 1:
                time = "0" + time + ":00"
            else:
                time = str(time) + ":00"
            result = soup.find_all("time", {"from": date + "T" + time + ":00Z"})
        else:
            result = soup.find_all("time", {"from": date + "T" + time + ":00Z"})

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
    else:
        return render_template('<h1>Nope</h1>')

if __name__ == "__main__":
    app.run(debug=True)