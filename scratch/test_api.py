import urllib.request
import urllib.parse
import json
import ssl

url = 'https://nightcrawler257.pythonanywhere.com/admin/api/stats'
req = urllib.request.Request(url)
try:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(req, context=ctx) as response:
        print("Status:", response.status)
        print("Response:", response.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
