from flask import Blueprint, abort, redirect, render_template, request
from flask_login import current_user, login_required
from ..extensions import db
from ..models.post import Post

post = Blueprint('post', __name__)

@post.route('/', methods=['POST', 'GET'])
def all():
    posts = Post.query.order_by(Post.id.desc()).all()
    return render_template('post/all.html', posts=posts)
   



@post.route('/post/create', methods=['POST', 'GET'])
@login_required
def create():
    if request.method == "POST":
        tshirt = request.form.get('tshirt')
        jins = request.form.get('jins')
        
        
        post = Post(jacket=current_user.id, tshirt=tshirt, jins=jins)
        
        try:
            db.session.add(post)
            db.session.commit()
            return redirect('/')
        except Exception as e:
            print(str(e))
    else:
        return render_template('post/create.html')


@post.route('/post/<int:id>/update', methods=['POST', 'GET'])
@login_required
def update(id):
    post = Post.query.get(id)
    
    if post.author.id == current_user.id:
    
    
        if request.method == "POST":
            post.jacket = request.form.get('jacket')
            post.tshirt = request.form.get('tshirt')
            post.jins = request.form.get('jins')
            try:
                db.session.commit()
                return redirect('/')
            except Exception as e:
                print(str(e))
        else:
            return render_template('post/update.html', post=post)
    else:
        abort(403)
    
    
@post.route('/post/<int:id>/delete', methods=['POST', 'GET'])
@login_required
def delete(id):
    
    if post.author.id == current_user.id:
        post = Post.query.get(id)
        try:
            db.session.delete(post)
            db.session.commit()
            return redirect('/')
        except Exception as e:
            print(str(e))
            return str(e)
    else:
        abort(403)
