from flask import redirect, request, render_template, url_for, Blueprint, jsonify, send_from_directory
from flask_login import login_required
from app.app import db


from app.blueprints.generation.helper import blueprint_add, generation_add, save_workflow, delete_workflow, get_local_ip
generation = Blueprint("generation", __name__, template_folder='templates')

@generation.route('/')
@login_required
def index():
    return render_template('generation/index.html')

# This is to get the local ip address for all the generations under blueprint
@generation.route('/local_ip')
def get_local_ip_route():
    # Get the local IP address
    local_ip = get_local_ip()  # Implement this function to get the local IP address
    
    # Return the local IP address as JSON
    return jsonify({'local_ip': local_ip})

# This is the static route folder for the helpers.js to use in all other generation workflows
@generation.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('blueprints/generation/static', filename)
