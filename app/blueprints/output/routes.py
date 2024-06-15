from flask import render_template, Blueprint, session, request, jsonify
from flask_login import login_required
from app.app import db

from app.models import Generation

output = Blueprint("output", __name__, template_folder='templates', static_folder='static', static_url_path='/output/static')

@output.route('/')
@login_required
def index():
    generations = db.session.query(Generation)\
        .filter_by(user_id=session['_user_id'])\
        .order_by(Generation.created_at.desc())\
        .all()
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

@output.route('/filter', methods=['GET'])
@login_required
def filter_generations():
    blueprint = request.args.get('blueprint')
    sort = request.args.get('sort')
    limit = int(request.args.get('limit', 0))  # Convert limit to integer, default to 0 if not provided

    query = db.session.query(Generation).filter_by(user_id=session['_user_id'])

    if blueprint and blueprint != '0':  # Filter by blueprint if specified and not '0'
        try:
            blueprint_id = int(blueprint)
            query = query.filter_by(blueprint_id=blueprint_id)
        except ValueError:
            pass  # Handle if blueprint is not a valid integer

    if sort == 'newest':  # Sort by newest if specified
        query = query.order_by(Generation.created_at.desc())
    elif sort == 'oldest':  # Sort by oldest if specified
        query = query.order_by(Generation.created_at.asc())

    if limit > 0:  # Apply limit if specified and greater than 0
        query = query.limit(limit)

    generations = query.all()

    return render_template('output/index.html', generations=generations)

