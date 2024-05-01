from flask import redirect, request, render_template, url_for, Blueprint
from flask_login import login_required
from app.app import db

generation = Blueprint("generation", __name__, template_folder='templates')

@generation.route('/')
@login_required
def index():
    return render_template('generation/index.html')
