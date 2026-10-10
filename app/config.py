import os
from sqlalchemy.engine import URL, make_url


class Config(object):
    APPNAME = "app"
    ROOT = os.path.dirname(os.path.abspath(__file__))
    UPLOAD_PATH = '/static/upload/'
    SERVER_PATH = ROOT + UPLOAD_PATH

    USER = os.environ.get('POSTGRES_USER', 'ako')
    PASSWORD = os.environ.get('POSTGRES_PASSWORD', '')
    HOST = os.environ.get('POSTGRES_HOST', '127.0.0.1')
    PORT = os.environ.get('POSTGRES_PORT', '5532')
    DB = os.environ.get('POSTGRES_DB', 'mydb')

    DATABASE_URL = os.environ.get('DATABASE_URL')
    if DATABASE_URL:
        SQLALCHEMY_DATABASE_URI = make_url(DATABASE_URL)
        if SQLALCHEMY_DATABASE_URI.drivername in ('postgres', 'postgresql'):
            SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.set(drivername='postgresql+psycopg2')
    else:
        SQLALCHEMY_DATABASE_URI = URL.create(
            'postgresql+psycopg2', username=USER, password=PASSWORD,
            host=HOST, port=int(PORT), database=DB
        )
    SQLALCHEMY_ENGINE_OPTIONS = {'pool_pre_ping': True}
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        raise RuntimeError('Set SECRET_KEY in .env before starting the app')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_SECURE = os.environ.get('COOKIE_SECURE', 'false').lower() == 'true'
    REMEMBER_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_SAMESITE = 'Lax'
    REMEMBER_COOKIE_SECURE = SESSION_COOKIE_SECURE
