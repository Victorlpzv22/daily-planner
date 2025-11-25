from database.db import db
from datetime import datetime

class Subtask(db.Model):
    __tablename__ = 'subtasks'
    
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    titulo = db.Column(db.String(200), nullable=False)
    completada = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'titulo': self.titulo,
            'completada': self.completada
        }
