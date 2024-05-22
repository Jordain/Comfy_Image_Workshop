import json
import flask
import requests
import os
import uuid

import urllib.request
import urllib.parse
import urllib.error

from flask import redirect, request, render_template, url_for, Blueprint, send_from_directory, current_app, session, current_app
from flask_login import login_required
from app.app import db

from app.blueprints.generation.helper import blueprint_add, generation_add, save_workflow, delete_workflow

ip_adapter_headshot = Blueprint("ip_adapter_headshot", __name__, template_folder='templates', static_folder='static')

# Need to import Blueprint after creating blueprint since that's the name of my model. Bad name need to fix later.
from app.models import Generation, Blueprint, Workflow

@ip_adapter_headshot.route('/')
@login_required
def index():
    if(not Blueprint.query.filter_by(id=3).first() or Blueprint.query.filter_by(id=3).first().title != 'ip_adapter_headshot'):
        blueprint_add('ip_adapter_headshot', 3)

    workflow_display = Workflow.query.filter(Workflow.user_id == session['_user_id'], Workflow.blueprint_id == 3).all()
    base_url = '/generation/ip_adapter_headshot'
    return render_template('ip_adapter_headshot/index.html', base_url=base_url, workflow_display=workflow_display)

# This is to view the image generated by ComfyUI. 
@ip_adapter_headshot.route("/<endpoint>", methods=['GET'])
@login_required
def get_endpoint(endpoint=None):
    args = flask.request.args
    if len(args) > 0:
        queries = urllib.parse.urlencode(dict(args))
        try:
            res = urllib.request.urlopen(
                f"http://127.0.0.1:8188/{endpoint}?{queries}")
            print(res.url)
            generation_add(res.url, Blueprint.query.filter_by(title="ip_adapter_headshot").first().id)
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
# This is to generate the image by ComfyUI. Is this the only thing that generates and returns the image?
@ip_adapter_headshot.route("/<endpoint>", methods=['POST'])
@login_required
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
    
@ip_adapter_headshot.route("/upload_image", methods=['POST'])
@login_required
def upload_image():
    if request.method == 'POST':
        if 'image' in request.files:
            image = request.files['image']
            # Save the image to a directory
            unique_image_id = str(uuid.uuid4())
            upload_folder = current_app.config['UPLOAD_FOLDER']
            image_filename = unique_image_id + '_' + image.filename
            file_path = os.path.join(upload_folder, image_filename)
            image.save(file_path)
            print(file_path)
            print(image_filename)
            return render_template('ip_adapter_headshot/index.html', image_filename=image_filename)
        else:
            return 'No image found in request.', 400
    else:
        return 'Invalid request method.', 400
    
@ip_adapter_headshot.route("/save", methods=['POST'])
@login_required
def save():
    try:
        title = request.form['save-title']
        desc = request.form['save-desc']
        wf_json_str = request.form['workflow']
        wf_json = json.loads(wf_json_str)['wf']
        save_workflow(Blueprint.query.filter_by(title="ip_adapter_headshot").first().id, title, desc, wf_json)
        return redirect(url_for("ip_adapter_headshot.index"))
    except KeyError as e:
        print(f"Error: {e} is missing in the form data.")
        # You can handle the error here, e.g., by returning an error response or redirecting to an error page
        return redirect(url_for("ip_adapter_headshot.index"))  

# Talk to bren about this one. Delete later.
@ip_adapter_headshot.route("/load", methods=['GET','POST'])
@login_required
def load():
    print("load")
    if(request.method == 'GET'):
        workflow_display = Workflow.query.filter(Workflow.user_id == session['_user_id']).all()
        return render_template('ip_adapter_headshot/index.html', workflow_display=workflow_display)
    # if(request.method == 'POST'):
    #     load_id = request.form['load-id']
    #     worflow_form_data = Workflow.query.filter(user_id=session('_user_id') and Workflow.id == load_id ).first()
    #     return render_template('ip_adapter_headshot/index.html', wf_form_data=worflow_form_data)

@ip_adapter_headshot.route("/delete", methods=['POST'])
@login_required
def delete():
    try:
        print("delete")
        id = request.json['workflowID']
        delete_workflow(id)
        return redirect(url_for("ip_adapter_headshot.index"))
    except KeyError as e:
        print(f"Error: {e} is missing in the form data.")
        # You can handle the error here, e.g., by returning an error response or redirecting to an error page
        return redirect(url_for("ip_adapter_headshot.index"))