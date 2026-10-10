import os
from dotenv import load_dotenv

load_dotenv('.env')

from app import create_app

application = create_app()
os.makedirs(application.config['SERVER_PATH'], exist_ok=True)
