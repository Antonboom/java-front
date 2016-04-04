from urllib2 import Request, urlopen

values = """
  {
    "login": "test",
    "password": "test",
    "email": "test@test.test"
  }
"""

headers = {
    'Content-Type': 'application/json'
}
request = Request('http://localhost:8080/api/user', data=values, headers=headers)

response_body = urlopen(request).read()
print response_body

values = """
  {
    "login": "dima",
    "password": "111",
    "email": "dima@dima.dima"
  }
"""

headers = {
    'Content-Type': 'application/json'
}
request = Request('http://localhost:8080/api/user', data=values, headers=headers)

response_body = urlopen(request).read()
print response_body

values = """
  {
    "login": "admin",
    "password": "qwerty",
    "email": "ad@ad.ad"
  }
"""

headers = {
    'Content-Type': 'application/json'
}
request = Request('http://localhost:8080/api/user', data=values, headers=headers)

response_body = urlopen(request).read()
print response_body

