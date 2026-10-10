import bcrypt
from flask import Blueprint, redirect, render_template, flash, request, url_for

from ..functions import save_picture
from ..forms import LoginForm, RegistrationForm
from ..extensions import db
from ..models.user import User
from flask_login import login_user, logout_user 

user = Blueprint('user', __name__)


@user.route('/user/register', methods=['POST', 'GET'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        hashed_password = hashed_password = bcrypt.hashpw(form.password.data.encode('utf-8'),bcrypt.gensalt()).decode('utf-8')
        avatar_filename = save_picture(form.avatar.data)
        user = User(name=form.name.data, login=form.login.data, avatar=avatar_filename, password=hashed_password)
        try:
            db.session.add(user)
            db.session.commit()
            flash(f'Вы успешно зарегистрировались! {form.login.data}', 'success')
            return redirect(url_for('user.login'))
        except Exception as e:
            print(str(e))
            flash('Произошла ошибка при регистрации. Попробуйте еще раз.', 'danger')
    return render_template('user/register.html', form=form)


@user.route('/user/login', methods=['POST', 'GET'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(login=form.login.data).first()
        if user and bcrypt.checkpw(form.password.data.encode('utf-8'), user.password.encode('utf-8')):
            login_user(user, remember=form.remember.data)
            next_page = request.args.get('next')
            flash(f'Вы успешно вошли в систему! {form.login.data}', 'success')
            return redirect(next_page) if next_page else redirect(url_for('post.all'))
        else:
            flash('Неверный логин или пароль', 'danger')
    return render_template('user/login.html', form=form)


@user.route('/user/logout', methods=['POST', 'GET'])
def logout():
    logout_user()
    return redirect(url_for('post.all'))