# UDPDATE ME!
import json
import flask
import requests
import os

import urllib.request
import urllib.parse
import urllib.error

from flask import redirect, request, render_template, url_for, Blueprint

from app.app import db

txt_gen = Blueprint("txt_gen", __name__, template_folder='templates', static_folder='static')

@txt_gen.route('/')
def index():
    return render_template('txt_gen/index.html')


# This is to view the image generated by ComfyUI. 
@txt_gen.route("/<endpoint>", methods=['GET'])
def get_endpoint(endpoint=None):
    args = flask.request.args
    if len(args) > 0:
        queries = urllib.parse.urlencode(dict(args))
        try:
            res = urllib.request.urlopen(
                f"http://127.0.0.1:8188/{endpoint}?{queries}")
            return res
        except urllib.error.HTTPError as e:
            return e.read()

    req = urllib.request.Request(
        f"http://127.0.0.1:8188/{endpoint}")
    try:
        response = urllib.request.urlopen(req)
        return response
    except urllib.error.HTTPError as e:
        return e.read()

# todo: 'add get and post to javascript or figure out how to make specfic routes '
# This is to generate the image by ComfyUI. 
@txt_gen.route("/<endpoint>", methods=['POST'])
def post_endpoint(endpoint=None):
    payload = flask.request.get_json()
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        f"http://127.0.0.1:8188/{endpoint}", data=data)
    try:
        response = urllib.request.urlopen(req)
        return response
    except urllib.error.HTTPError as e:
        return e.read()



