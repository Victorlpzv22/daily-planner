from database.db import db
from datetime import datetime, timezone


def utc_now():
    """Función helper para obtener datetime UTC actual sin warnings de deprecación"""
    return datetime.now(timezone.utc)


class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    fecha_inicio = db.Column(db.Date, nullable=False)
    fecha_fin = db.Column(db.Date, nullable=False)
    hora = db.Column(db.Time, nullable=True)
    completada = db.Column(db.Boolean, default=False)
    prioridad = db.Column(db.String(10), default='media')
    tipo = db.Column(db.String(15), default='diaria')
    color = db.Column(db.String(7), default='#1976d2')
    group_id = db.Column(db.String(36), nullable=True)
    created_at = db.Column(db.DateTime, default=utc_now)
    updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now)
    
    subtasks = db.relationship('Subtask', backref='task', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descripcion': self.descripcion,
            'fecha_inicio': self.fecha_inicio.isoformat() if self.fecha_inicio else None,
            'fecha_fin': self.fecha_fin.isoformat() if self.fecha_fin else None,
            'hora': self.hora.isoformat() if self.hora else None,
            'completada': self.completada,
            'prioridad': self.prioridad,
            'tipo': self.tipo,
            'color': self.color,
            'group_id': self.group_id,
            'subtasks': [subtask.to_dict() for subtask in self.subtasks]
        }