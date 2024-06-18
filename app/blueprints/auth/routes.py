from flask import redirect, request, render_template, url_for, Blueprint, session
from flask_login import login_user, logout_user, login_required, current_user


from app.helpers import apology
from werkzeug.security import check_password_hash, generate_password_hash

from app.app import db
from app.models import User

auth = Blueprint("auth", __name__, template_folder='templates')

@auth.route('/')
def index():
    return render_template('auth/index.html')

@auth.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()
    
    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure username was submitted
        if not request.form.get("username"):
            return apology("must provide username", 403)

        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology("must provide password", 403)

        # Query database for username
        user = User.query.filter_by(username = request.form.get("username")).first()

        # Ensure username exists and password is correct
        if user is None or not check_password_hash(user.hash, request.form.get("password")):
            return apology("invalid username and/or password", 403)

        # Remember which user has logged in
        login_user(user)

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("auth/login.html")


@auth.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    logout_user()

    # Redirect user to login form
    return redirect("/auth")

@auth.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""

    users = User.query.with_entities(User.username).all()
    #username is also the email
    username = request.form.get("username")
    password = request.form.get("password")
    email = request.form.get("email")

    for user in users:
        print(user.username)
    if request.method == "POST":
        # Ensure username was submitted
        if not username:
            return apology("must provide username", 400)

        # Ensure username is unique
        if any(user.username == username for user in users):
            return apology("Username already exists", 400)

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

        # Query database for username
        user = User(
            username=username,
            hash=hash,
            email=email
        )
        db.session.add(user)
        db.session.commit()

        return redirect("/")
    else:
        return render_template("auth/register.html")