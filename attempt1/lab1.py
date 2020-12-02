import requests
import json
from xlwt import *

url = "https://reports.sem-o.com/api/v1/documents/static-reports"

response = requests.get(url)
data = response.json()

# output
print(data)

filename = "routes.json"

f = open(filename, "w")
json.dump(data, f, indent=4)