from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()

def create_app():
    app = Flask(__name__, template_folder='templates', static_folder='../static')

    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///./project.db"

    db.init_app(app)

    #import and register all blueprints
    from app.blueprints.home.routes import home
    from app.blueprints.auth.routes import auth
    from app.blueprints.profile.routes import profile
    from app.blueprints.generation.routes import generation
    from app.blueprints.generation.txt_gen.routes import txt_gen
    from app.blueprints.generation.fantasy_character_creator.routes import fantasy_character_creator
    from app.blueprints.output.routes import output

    app.register_blueprint(home, url_prefix="/")
    app.register_blueprint(auth, url_prefix="/auth")
    app.register_blueprint(profile, url_prefix="/profile")
    app.register_blueprint(generation, url_prefix="/generation")
    app.register_blueprint(txt_gen, url_prefix="/generation/txt_gen")
    app.register_blueprint(fantasy_character_creator, url_prefix="/generation/fantasy_character_creator")
    app.register_blueprint(output, url_prefix="/output")

    migrate = Migrate(app, db)

    return app