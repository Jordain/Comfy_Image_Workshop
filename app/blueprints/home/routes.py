from flask import render_template, Blueprint

#import model
from app.models import User

home = Blueprint("home", __name__, template_folder='templates')

@home.route('/')
def index():
    users = User.query.all()
    return render_template('home/index.html')