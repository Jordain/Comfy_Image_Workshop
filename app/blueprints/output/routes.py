from flask import render_template, Blueprint, session
from flask_login import login_required
from app.app import db

from app.models import Generation

output = Blueprint("output", __name__, template_folder='templates')

@output.route('/')
@login_required
def index():
    generations = db.session.query(Generation)\
    .filter_by(user_id=session['_user_id'])\
    .order_by(Generation.created_at.desc())\
    .all()
    print(session['_user_id'])
    print(generations)
    for generation in generations:
        print(generation.path)
    return render_template('output/index.html', generations=generations)

@output.route('/sort_by_newest')
@login_required
def sort_by_newest():
    generations = db.session.query(Generation)\
    .filter_by(user_id=session['_user_id'])\
    .order_by(Generation.created_at.desc())\
    .all()
    print(session['_user_id'])
    print(generations)
    for generation in generations:
        print(generation.path)
    return render_template('output/index.html', generations=generations)

@output.route('/sort_by_oldest')
@login_required
def sort_by_oldest():
    generations = db.session.query(Generation)\
    .filter_by(user_id=session['_user_id'])\
    .order_by(Generation.created_at.asc())\
    .all()
    print(session['_user_id'])
    print(generations)
    for generation in generations:
        print(generation.path)
    return render_template('output/index.html', generations=generations)

@output.route('/filter_by_worflows/<int:blueprint_id>')
@login_required
def filter_by_worflows(blueprint_id=None):
    print("blueprint_id", blueprint_id)
    generations = db.session.query(Generation)\
    .filter_by(user_id=session['_user_id'], blueprint_id=blueprint_id)\
    .order_by(Generation.created_at.desc())\
    .all()
    print(session['_user_id'])
    print(generations)
    for generation in generations:
        print(generation.path)
    return render_template('output/index.html', generations=generations)