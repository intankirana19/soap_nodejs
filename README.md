# SOAPNODEJSAPI
SOAPNODEJS-API

start app : node ./bin/start


# LOGIN

- URL : http://localhost:3000/login
- METHOD : POST
- HEADER :
    - Content-Type : application/x-www-form-urlencoded
- BODY :
    - username : string
    - password : string

- REPONSE : (JSON)
{
    "status": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxMiwidXNlcm5hbWUiOiJhZGlzYXB1IiwicGFzc3dvcmQiOiJGQ0FrMnFiUWw1MUNQeEpLUVd5ZHpRPT0iLCJqb2JfcG9zaXRpb24iOiJBZG1pbmlzdHJhdG9yIiwicm9sZV9pZCI6MSwiY2xpZW50X2lkIjo2LCJjcmVhdGVfYXQiOiIyMDE4LTEyLTEyVDA2OjIyOjM3LjcxOFoiLCJ1cGRhdGVfYXQiOiIyMDE5LTEwLTAyVDE3OjU5OjI2LjU0NloiLCJlbWFpbCI6ImFkaS5zYXB1dHJhQGJyYWlud29yeC5jby5pZCJ9LCJpYXQiOjE1ODM0NTg1ODMsImV4cCI6MTU4MzQ2MjE4M30.O6w6aZ-7qu_MxuEG2qHbYyWBNLSIARMceCOV4yLg7c0"
}