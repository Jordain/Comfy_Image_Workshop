from flask import render_template, Blueprint
from flask_login import login_required
from app.app import db

output = Blueprint("output", __name__, template_folder='templates')

@output.route('/')
@login_required
def index():
    return render_template('output/index.html')