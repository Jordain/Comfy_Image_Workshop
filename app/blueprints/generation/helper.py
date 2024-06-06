from app.models import Generation, Blueprint, Workflow

import socket

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
    
def delete_workflow(id):
    delete_workflow = db.session.query(Workflow).filter_by(id = id).first()
    db.session.delete(delete_workflow)
    db.session.commit()
    db.session.close()


# Getting the local ip address
def get_local_ip():
    try:
        # Create a socket object
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        
        # Connect to a remote server
        s.connect(("8.8.8.8", 80))
        
        # Get the local IP address
        local_ip = s.getsockname()[0]
        
        return local_ip
    except Exception as e:
        print("Error:", e)
        return None