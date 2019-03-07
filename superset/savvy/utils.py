import json

def post_request(url, params):
    import requests
    return requests.post(url, data=json.dumps(params))