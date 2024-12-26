from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8000"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type"]
    }
})

app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///movies.db'
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

db = SQLAlchemy(app)

# Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

class Movie(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    year = db.Column(db.String(4))
    duration = db.Column(db.String(20))
    quality = db.Column(db.String(10))
    rating = db.Column(db.String(5))
    genre = db.Column(db.String(50))
    image = db.Column(db.String(200))
    video_url = db.Column(db.String(500))
    type = db.Column(db.String(20))  # movie or wrestling

class Series(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    year = db.Column(db.String(4))
    duration = db.Column(db.String(20))
    quality = db.Column(db.String(10))
    rating = db.Column(db.String(5))
    genre = db.Column(db.String(50))
    image = db.Column(db.String(200))
    video_url = db.Column(db.String(500))
    episodes = db.Column(db.String(100))
    type = db.Column(db.String(20))  # series or anime

# Create all tables
with app.app_context():
    db.create_all()
    # Create admin user if it doesn't exist
    admin_user = User.query.filter_by(username='admin').first()
    if not admin_user:
        admin_user = User(
            username='admin',
            password=generate_password_hash('admin123', method='pbkdf2:sha256')
        )
        db.session.add(admin_user)
        db.session.commit()

# Login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('dashboard'))
        
        flash('اسم المستخدم أو كلمة المرور غير صحيحة')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    movies = Movie.query.filter_by(type='movie').all()
    series = Series.query.filter_by(type='series').all()
    anime = Series.query.filter_by(type='anime').all()
    wrestling = Movie.query.filter_by(type='wrestling').all()
    return render_template('dashboard.html', movies=movies, series=series, anime=anime, wrestling=wrestling)

# Movie routes
@app.route('/add_movie', methods=['POST'])
@login_required
def add_movie():
    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        year = request.form.get('year')
        duration = request.form.get('duration')
        quality = request.form.get('quality')
        rating = request.form.get('rating')
        genre = request.form.get('genre')
        video_url = request.form.get('video_url')
        
        image = request.files.get('image')
        if image:
            filename = secure_filename(image.filename)
            image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            image_path = filename
        else:
            image_path = None

        movie = Movie(
            title=title,
            description=description,
            year=year,
            duration=duration,
            quality=quality,
            rating=rating,
            genre=genre,
            image=image_path,
            video_url=video_url,
            type='movie'
        )
        
        db.session.add(movie)
        db.session.commit()
        flash('تم إضافة الفيلم بنجاح')
        return redirect(url_for('dashboard'))

@app.route('/edit_movie/<int:id>', methods=['GET', 'POST'])
@login_required
def edit_movie(id):
    movie = Movie.query.get_or_404(id)
    if request.method == 'POST':
        movie.title = request.form.get('title')
        movie.description = request.form.get('description')
        movie.year = request.form.get('year')
        movie.duration = request.form.get('duration')
        movie.quality = request.form.get('quality')
        movie.rating = request.form.get('rating')
        movie.genre = request.form.get('genre')
        movie.video_url = request.form.get('video_url')
        
        image = request.files.get('image')
        if image:
            filename = secure_filename(image.filename)
            image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            movie.image = filename

        db.session.commit()
        flash('تم تحديث الفيلم بنجاح')
        return redirect(url_for('dashboard'))
    
    return render_template('edit_movie.html', movie=movie)

@app.route('/delete_movie/<int:id>')
@login_required
def delete_movie(id):
    movie = Movie.query.get_or_404(id)
    if movie.image:
        try:
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], movie.image))
        except:
            pass
    db.session.delete(movie)
    db.session.commit()
    flash('تم حذف الفيلم بنجاح')
    return redirect(url_for('dashboard'))

# Series routes
@app.route('/add_series', methods=['POST'])
@login_required
def add_series():
    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        year = request.form.get('year')
        duration = request.form.get('duration')
        quality = request.form.get('quality')
        rating = request.form.get('rating')
        genre = request.form.get('genre')
        video_url = request.form.get('video_url')
        episodes = request.form.get('episodes')
        
        image = request.files.get('image')
        if image:
            filename = secure_filename(image.filename)
            image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            image_path = filename
        else:
            image_path = None

        series = Series(
            title=title,
            description=description,
            year=year,
            duration=duration,
            quality=quality,
            rating=rating,
            genre=genre,
            image=image_path,
            video_url=video_url,
            episodes=episodes,
            type='series'
        )
        
        db.session.add(series)
        db.session.commit()
        flash('تم إضافة المسلسل بنجاح')
        return redirect(url_for('dashboard'))

@app.route('/edit_series/<int:id>', methods=['GET', 'POST'])
@login_required
def edit_series(id):
    series = Series.query.get_or_404(id)
    if request.method == 'POST':
        series.title = request.form.get('title')
        series.description = request.form.get('description')
        series.year = request.form.get('year')
        series.duration = request.form.get('duration')
        series.quality = request.form.get('quality')
        series.rating = request.form.get('rating')
        series.genre = request.form.get('genre')
        series.video_url = request.form.get('video_url')
        series.episodes = request.form.get('episodes')
        
        image = request.files.get('image')
        if image:
            filename = secure_filename(image.filename)
            image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            series.image = filename

        db.session.commit()
        flash('تم تحديث المسلسل بنجاح')
        return redirect(url_for('dashboard'))
    
    return render_template('edit_series.html', series=series)

@app.route('/delete_series/<int:id>')
@login_required
def delete_series(id):
    series = Series.query.get_or_404(id)
    if series.image:
        try:
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], series.image))
        except:
            pass
    db.session.delete(series)
    db.session.commit()
    flash('تم حذف المسلسل بنجاح')
    return redirect(url_for('dashboard'))

# Anime routes
@app.route('/add_anime', methods=['POST'])
@login_required
def add_anime():
    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        year = request.form.get('year')
        duration = request.form.get('duration')
        quality = request.form.get('quality')
        rating = request.form.get('rating')
        genre = request.form.get('genre')
        video_url = request.form.get('video_url')
        episodes = request.form.get('episodes')
        
        image = request.files.get('image')
        if image:
            filename = secure_filename(image.filename)
            image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            image_path = filename
        else:
            image_path = None

        anime = Series(
            title=title,
            description=description,
            year=year,
            duration=duration,
            quality=quality,
            rating=rating,
            genre=genre,
            image=image_path,
            video_url=video_url,
            episodes=episodes,
            type='anime'
        )
        
        db.session.add(anime)
        db.session.commit()
        flash('تم إضافة الأنمي بنجاح')
        return redirect(url_for('dashboard'))

@app.route('/edit_anime/<int:id>', methods=['GET', 'POST'])
@login_required
def edit_anime(id):
    anime = Series.query.get_or_404(id)
    if request.method == 'POST':
        anime.title = request.form.get('title')
        anime.description = request.form.get('description')
        anime.year = request.form.get('year')
        anime.duration = request.form.get('duration')
        anime.quality = request.form.get('quality')
        anime.rating = request.form.get('rating')
        anime.genre = request.form.get('genre')
        anime.video_url = request.form.get('video_url')
        anime.episodes = request.form.get('episodes')
        
        image = request.files.get('image')
        if image:
            filename = secure_filename(image.filename)
            image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            anime.image = filename

        db.session.commit()
        flash('تم تحديث الأنمي بنجاح')
        return redirect(url_for('dashboard'))
    
    return render_template('edit_anime.html', anime=anime)

@app.route('/delete_anime/<int:id>')
@login_required
def delete_anime(id):
    anime = Series.query.get_or_404(id)
    if anime.image:
        try:
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], anime.image))
        except:
            pass
    db.session.delete(anime)
    db.session.commit()
    flash('تم حذف الأنمي بنجاح')
    return redirect(url_for('dashboard'))

# Wrestling routes
@app.route('/add_wrestling', methods=['POST'])
@login_required
def add_wrestling():
    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        year = request.form.get('year')
        duration = request.form.get('duration')
        quality = request.form.get('quality')
        rating = request.form.get('rating')
        genre = request.form.get('genre')
        video_url = request.form.get('video_url')
        
        image = request.files.get('image')
        if image:
            filename = secure_filename(image.filename)
            image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            image_path = filename
        else:
            image_path = None

        wrestling = Movie(
            title=title,
            description=description,
            year=year,
            duration=duration,
            quality=quality,
            rating=rating,
            genre=genre,
            image=image_path,
            video_url=video_url,
            type='wrestling'
        )
        
        db.session.add(wrestling)
        db.session.commit()
        flash('تم إضافة المصارعة بنجاح')
        return redirect(url_for('dashboard'))

@app.route('/edit_wrestling/<int:id>', methods=['GET', 'POST'])
@login_required
def edit_wrestling(id):
    wrestling = Movie.query.get_or_404(id)
    if request.method == 'POST':
        wrestling.title = request.form.get('title')
        wrestling.description = request.form.get('description')
        wrestling.year = request.form.get('year')
        wrestling.duration = request.form.get('duration')
        wrestling.quality = request.form.get('quality')
        wrestling.rating = request.form.get('rating')
        wrestling.genre = request.form.get('genre')
        wrestling.video_url = request.form.get('video_url')
        
        image = request.files.get('image')
        if image:
            filename = secure_filename(image.filename)
            image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            wrestling.image = filename

        db.session.commit()
        flash('تم تحديث المصارعة بنجاح')
        return redirect(url_for('dashboard'))
    
    return render_template('edit_wrestling.html', wrestling=wrestling)

@app.route('/delete_wrestling/<int:id>')
@login_required
def delete_wrestling(id):
    wrestling = Movie.query.get_or_404(id)
    if wrestling.image:
        try:
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], wrestling.image))
        except:
            pass
    db.session.delete(wrestling)
    db.session.commit()
    flash('تم حذف المصارعة بنجاح')
    return redirect(url_for('dashboard'))

@app.route('/api/content')
def get_content():
    try:
        movies = Movie.query.filter_by(type='movie').all()
        series = Series.query.filter_by(type='series').all()
        anime = Series.query.filter_by(type='anime').all()
        wrestling = Movie.query.filter_by(type='wrestling').all()

        content = {
            'movies': [{
                'id': m.id,
                'title': m.title,
                'image': m.image if m.image and m.image.startswith('http') else f"/static/uploads/{m.image}" if m.image else None,
                'rating': m.rating,
                'year': m.year,
                'duration': m.duration,
                'description': m.description,
                'genre': m.genre,
                'quality': m.quality,
                'video_url': m.video_url
            } for m in movies],
            'series': [{
                'id': s.id,
                'title': s.title,
                'image': s.image if s.image and s.image.startswith('http') else f"/static/uploads/{s.image}" if s.image else None,
                'rating': s.rating,
                'year': s.year,
                'duration': s.duration,
                'description': s.description,
                'genre': s.genre,
                'quality': s.quality,
                'episodes': s.episodes,
                'video_url': s.video_url
            } for s in series],
            'anime': [{
                'id': a.id,
                'title': a.title,
                'image': a.image if a.image and a.image.startswith('http') else f"/static/uploads/{a.image}" if a.image else None,
                'rating': a.rating,
                'year': a.year,
                'duration': a.duration,
                'description': a.description,
                'genre': a.genre,
                'quality': a.quality,
                'episodes': a.episodes,
                'video_url': a.video_url
            } for a in anime],
            'wrestling': [{
                'id': w.id,
                'title': w.title,
                'image': w.image if w.image and w.image.startswith('http') else f"/static/uploads/{w.image}" if w.image else None,
                'rating': w.rating,
                'year': w.year,
                'duration': w.duration,
                'description': w.description,
                'genre': w.genre,
                'quality': w.quality,
                'video_url': w.video_url
            } for w in wrestling]
        }

        return jsonify(content)
    except Exception as e:
        print(f"Error in get_content: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/static/uploads/<path:filename>')
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)
