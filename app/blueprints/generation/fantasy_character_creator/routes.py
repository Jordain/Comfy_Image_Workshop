from flask import redirect, request, render_template, url_for, Blueprint
from flask_login import login_required
from app.app import db

fantasy_character_creator = Blueprint("fantasy_character_creator", __name__, template_folder='templates')

@fantasy_character_creator.route('/')
@login_required
def index():
    return render_template('fantasy_character_creator/index.html')
