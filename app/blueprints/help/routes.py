from flask import render_template, Blueprint

#import model
from app.models import User

help = Blueprint("help", __name__, template_folder='templates')

@help.route('/')
def index():
    users = User.query.all()
    return render_template('help/index.html')