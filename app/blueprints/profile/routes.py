from flask import redirect, request, render_template, url_for, Blueprint, session

from app.helpers import apology
from werkzeug.security import check_password_hash, generate_password_hash

from app.app import db
from app.models import User
from flask_login import login_required
profile = Blueprint("profile", __name__, template_folder='templates')

@profile.route('/')
@login_required
def index():
    return render_template('profile/index.html')

@profile.route('/delete')
def delete():
    id = db.session.query(User).first().id
    user = db.session.query(User).filter(User.id==id).first()
    try:
        db.session.delete(user)
        db.session.commit()
        session.clear()
    except Exception as e:
        print("Error deleting user:", e)

    return render_template('profile/delete.html')

@profile.route("/update", methods=["GET", "POST"])
@login_required
def update():

    user_id = session.get("user_id")
    oldPassword = request.form.get("oldPassword")
    password = request.form.get("password")
    msg = "Password Updated"

    if request.method == "GET":

        return render_template("profile/update.html")

    if request.method == "POST":
        
        user = db.session.query(User).first()

        print(len(user.hash))

        # check old password matches
        if len(user.hash) is None or not check_password_hash(
            user.hash, oldPassword
        ):
            return apology("Old Password does not match", 400)

        # Ensure password was submitted
        elif not password:
            return apology("must provide password", 400)

        # Ensure confirmation password was submitted
        elif not request.form.get("confirmation"):
            return apology("must provide confirmation password", 400)

        # Ensure password match
        elif request.form.get("confirmation") != password:
            return apology("password does not match", 400)

        hash = generate_password_hash(password)

        # Update password
        user.hash = hash
        db.session.commit()

        return render_template("profile/update.html", msg=msg)