from flask import redirect, request, render_template, url_for, Blueprint

from app.app import db

generation = Blueprint("generation", __name__, template_folder='templates')

@generation.route('/')
def index():
    return render_template('generation/index.html')
