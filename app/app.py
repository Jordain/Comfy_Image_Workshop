from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager

db = SQLAlchemy()

def create_app():
    app = Flask(__name__, template_folder='templates', static_folder='../static')
    app.secret_key = "3240fd4f86daf0656709a1f971f05a03e79"
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///./project.db"

    #EDIT1 HERE:
    #You will need to change the path to your comfy folder. This is for the input images you use in workflows. 
    #Replace jorda with your username.
    app.config['UPLOAD_FOLDER'] = r'C:\Users\jorda\ComfyUI_windows_portable_CIW\ComfyUI\input'

    db.init_app(app)

    #loading in the javascript files with correct mimetype
    @app.route('/static/js/<path:filename>')
    def serve_js(filename):
        #print(filename)
        #since I created that app in the app directory the root static directory is one up. Look at my app = Flask(__name__, template_folder='templates', static_folder='../static')
        return send_from_directory('../static/js/', filename, mimetype='application/javascript')

    #login manager
    login_manager = LoginManager()
    login_manager.init_app(app)

    from app.models import User
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    

    #Import Core Blueprints
    from app.blueprints.home.routes import home
    from app.blueprints.auth.routes import auth
    from app.blueprints.profile.routes import profile
    from app.blueprints.generation.routes import generation
    from app.blueprints.output.routes import output
    from app.blueprints.help.routes import help

    #Import Generation Blueprints. Add new import workflow blueprints here
    from app.blueprints.generation.txt_gen.routes import txt_gen
    from app.blueprints.generation.fantasy_character_creator.routes import fantasy_character_creator
    from app.blueprints.generation.ip_adapter_headshot.routes import ip_adapter_headshot
    #EDIT2 HERE:
    #from app.blueprints.generation.my_new_workflow.routes import my_new_workflow
    
    
    #Register Core Blueprints
    app.register_blueprint(home, url_prefix="/")
    app.register_blueprint(auth, url_prefix="/auth")
    app.register_blueprint(profile, url_prefix="/profile")
    app.register_blueprint(generation, url_prefix="/generation")
    app.register_blueprint(output, url_prefix="/output")
    app.register_blueprint(help, url_prefix="/help")

    #Register Generation Blueprints. Add new register workflow blueprints here
    app.register_blueprint(txt_gen, url_prefix="/generation/txt_gen")
    app.register_blueprint(fantasy_character_creator, url_prefix="/generation/fantasy_character_creator")
    app.register_blueprint(ip_adapter_headshot, url_prefix="/generation/ip_adapter_headshot")
    #EDIT3 HERE:
    #app.register_blueprint(my_new_workflow, url_prefix="/generation/my_new_workflow")


    migrate = Migrate(app, db)

    return app