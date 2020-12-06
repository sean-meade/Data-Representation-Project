from flask import Flask, redirect, url_for, render_template, request, make_response, jsonify
import sys
import json
from flask_jsglue import JSGlue
import requests
import urllib3
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

@app.route("/weather_link", methods=["GET", "POST"])
def weather_link():
    if request.method == "POST":
        data = {}
        data = request.json
        print("---------------------------\n")
        
        print("\n---------------------------\n")
        #data['title'] = request.json['title']
        #data['release_date'] = request.json['movie_release_date']
        response = requests.get(data['url'], verify=False)
        soup = BeautifulSoup(response.text, 'xml')
        print(soup)
        print("\n---------------------------\n")
        date= data['date']
        time= data['time']

        result = soup.find_all("time", {"from": date + "T" + time + ":00Z"})
        print(result)
        print("\n---------------------------\n")
        temperature = result[0].temperature['value']
        windDirection = result[0].windDirection['deg']
        windSpeed = result[0].windSpeed['mps']
        humidity = result[0].humidity['value']
        pressure = result[0].pressure['value']
        precipitationMax = result[1].precipitation['maxvalue']
        precipitationMin = result[1].precipitation['minvalue']
        #user = [temperature, windDirection, windSpeed, humidity, pressure, precipitationMax, precipitationMin]


       # do whatever you want with the data here e.g look up in database or something
       # if you want to print to console
        #print(data, file=sys.stderr)

        # then return something back to frontend on success

        # this returns back received data and you should see it in browser console
        # because of the console.log() in the script.
        #return redirect(url_for("user", temperature = temperature, windDirection = windDirection, windSpeed = windSpeed))
        #return render_template('index.html', temperature = temperature, windDirection = windDirection, windSpeed = windSpeed, humidity = humidity, pressure = pressure, precipitationMax = precipitationMax, precipitationMin = precipitationMin)
        return {'temperature': temperature, 'windDirection': windDirection, 'windSpeed': windSpeed, 'humidity': humidity, 'pressure': pressure, 'precipitationMax': precipitationMax, 'precipitationMin': precipitationMin}
    else:
        return render_template('<h1>Nope</h1>')

@app.route("/<temperature>/<windDirection>/<windSpeed>")
def user(temperature, windDirection, windSpeed):
    return f"<h1>{temperature}</h1>\n<h1>{windDirection}</h1>\n<h1>{windSpeed}</h1>"
    

if __name__ == "__main__":
    app.run(debug=True)