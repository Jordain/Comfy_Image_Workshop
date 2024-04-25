from flask import redirect, request, render_template, url_for, Blueprint

from app.app import db

profile = Blueprint("profile", __name__, template_folder='templates')

@profile.route('/')
def index():
    return render_template('profile/index.html')
