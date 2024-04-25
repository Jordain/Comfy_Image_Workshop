from flask import redirect, request, render_template, url_for, Blueprint

from app.app import db

auth = Blueprint("auth", __name__, template_folder='templates')

@auth.route('/')
def index():
    return render_template('auth/index.html')
