from datetime import datetime
from ..extensions import db

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jacket = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))
    tshirt = db.Column(db.String(250))
    jins = db.Column(db.Integer)
    date = db.Column('datetime', db.Date, default=lambda: datetime.utcnow().date())
    

    
