from app.models import Generation, Blueprint, Workflow

from app.app import db
from flask import session

def generation_add(url, id):
    generation = Generation(
                user_id=session['_user_id'],
                path=url,
                blueprint_id=id
            )
    db.session.add(generation)
    db.session.commit()
    db.session.close()

def blueprint_add(name, id):
    blueprint = Blueprint(
                title=name,
                id=id
            )
    db.session.add(blueprint)
    db.session.commit()
    db.session.close()


def save_workflow(id, title, desc, json):
    workflow = Workflow(
                user_id=session['_user_id'],
                description=desc,
                blueprint_id=id,
                workflow=json,
                title=title
            )
    db.session.add(workflow)
    db.session.commit()
    db.session.close()
    