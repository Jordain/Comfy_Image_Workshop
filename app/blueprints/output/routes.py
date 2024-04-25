from flask import render_template, Blueprint

from app.app import db

output = Blueprint("output", __name__, template_folder='templates')

@output.route('/')
def index():
    return render_template('output/index.html')