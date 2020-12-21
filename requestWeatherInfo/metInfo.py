import requests
import urllib3
from bs4 import BeautifulSoup
import json
urllib3.disable_warnings()

response = requests.get('https://metwdb-openaccess.ichec.ie/metno-wdb2ts/locationforecast?lat=52.8632402000;long=-8.4562368000', verify=False)

soup = BeautifulSoup(response.text, 'json')

date="2020-12-07"
time="00:00"
temperature = soup.temperature
print(temperature['value'], temperature['unit'])


result = soup.find_all("time", {"from": date + "T" + time + ":00Z"})
print(result[0].temperature['value'])