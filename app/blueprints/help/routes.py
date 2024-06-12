from flask import render_template, Blueprint

#import model
from app.models import User

help = Blueprint("help", __name__, template_folder='templates')

@help.route('/')
def index():
    users = User.query.all()
    return render_template('help/index.html')

@help.route('/getting_started')
def getting_started():
    return render_template('help/getting_started.html')

@help.route('/txt_gen')
def txt_gen():
    return render_template('help/txt_gen.html')

@help.route('/fantasy_character_creator')
def fantasy_character_creator():
    return render_template('help/fantasy_character_creator.html')

@help.route('/ip_adapter_headshot')
def ip_adapter_headshot():
    return render_template('help/ip_adapter_headshot.html')
