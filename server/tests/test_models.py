import unittest
import sys
import os
from datetime import date, time, datetime

# Add src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from app import create_app
from database.db import db
from models.task import Task

class TestTaskModel(unittest.TestCase):
    def setUp(self):
        self.app_instance = create_app({
            'TESTING': True,
            'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
            'SQLALCHEMY_TRACK_MODIFICATIONS': False
        })
        self.app = self.app_instance.test_client()
        
        with self.app_instance.app_context():
            db.create_all()

    def tearDown(self):
        with self.app_instance.app_context():
            db.session.remove()
            db.drop_all()

    def test_create_task(self):
        """Test creating a task with required fields"""
        with self.app_instance.app_context():
            task = Task(
                titulo='Test Task',
                fecha_inicio=date(2023, 1, 1),
                fecha_fin=date(2023, 1, 1)
            )
            db.session.add(task)
            db.session.commit()
            
            saved_task = Task.query.first()
            self.assertIsNotNone(saved_task)
            self.assertEqual(saved_task.titulo, 'Test Task')
            self.assertEqual(saved_task.fecha_inicio, date(2023, 1, 1))
            self.assertEqual(saved_task.fecha_fin, date(2023, 1, 1))
            
            # Check defaults
            self.assertFalse(saved_task.completada)
            self.assertEqual(saved_task.prioridad, 'media')
            self.assertEqual(saved_task.tipo, 'diaria')
            self.assertEqual(saved_task.color, '#1976d2')

    def test_create_task_with_all_fields(self):
        """Test creating a task with all fields"""
        with self.app_instance.app_context():
            task = Task(
                titulo='Full Task',
                descripcion='Description',
                fecha_inicio=date(2023, 1, 1),
                fecha_fin=date(2023, 1, 2),
                hora=time(10, 0),
                completada=True,
                prioridad='alta',
                tipo='trabajo',
                color='#ff0000',
                group_id='12345'
            )
            db.session.add(task)
            db.session.commit()
            
            saved_task = Task.query.first()
            self.assertEqual(saved_task.descripcion, 'Description')
            self.assertEqual(saved_task.hora, time(10, 0))
            self.assertTrue(saved_task.completada)
            self.assertEqual(saved_task.prioridad, 'alta')
            self.assertEqual(saved_task.tipo, 'trabajo')
            self.assertEqual(saved_task.color, '#ff0000')
            self.assertEqual(saved_task.group_id, '12345')

    def test_to_dict(self):
        """Test to_dict method"""
        with self.app_instance.app_context():
            task = Task(
                titulo='Dict Task',
                fecha_inicio=date(2023, 1, 1),
                fecha_fin=date(2023, 1, 1),
                hora=time(14, 30)
            )
            db.session.add(task)
            db.session.commit()
            
            data = task.to_dict()
            self.assertEqual(data['titulo'], 'Dict Task')
            self.assertEqual(data['fecha_inicio'], '2023-01-01')
            self.assertEqual(data['hora'], '14:30:00')
            self.assertFalse(data['completada'])

if __name__ == '__main__':
    unittest.main()
