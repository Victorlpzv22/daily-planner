import unittest
import sys
import os
import json
from datetime import date, timedelta

# Add src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from app import create_app
from database.db import db
from models.task import Task

class TestTaskRoutes(unittest.TestCase):
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

    def test_get_empty_tasks(self):
        """Test getting tasks when database is empty"""
        response = self.app.get('/api/tasks/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['tasks'], [])

    def test_create_task(self):
        """Test creating a new task"""
        data = {
            'titulo': 'New Task',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat()
        }
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        json_response = response.get_json()
        self.assertEqual(json_response['task']['titulo'], 'New Task')
        self.assertIn('id', json_response['task'])

    def test_get_tasks_list(self):
        """Test getting list of tasks"""
        # Create a task first
        with self.app_instance.app_context():
            task = Task(
                titulo='Task 1',
                fecha_inicio=date.today(),
                fecha_fin=date.today()
            )
            db.session.add(task)
            db.session.commit()

        response = self.app.get('/api/tasks/')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()['tasks']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['titulo'], 'Task 1')

    def test_get_single_task(self):
        """Test getting a specific task"""
        with self.app_instance.app_context():
            task = Task(
                titulo='Task 1',
                fecha_inicio=date.today(),
                fecha_fin=date.today()
            )
            db.session.add(task)
            db.session.commit()
            task_id = task.id

        response = self.app.get(f'/api/tasks/{task_id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['task']['titulo'], 'Task 1')

    def test_update_task(self):
        """Test updating a task"""
        with self.app_instance.app_context():
            task = Task(
                titulo='Old Title',
                fecha_inicio=date.today(),
                fecha_fin=date.today()
            )
            db.session.add(task)
            db.session.commit()
            task_id = task.id

        data = {
            'titulo': 'New Title',
            'descripcion': 'Updated description'
        }
        response = self.app.put(f'/api/tasks/{task_id}', json=data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['task']['titulo'], 'New Title')
        
        # Verify in DB
        with self.app_instance.app_context():
            updated_task = Task.query.get(task_id)
            self.assertEqual(updated_task.titulo, 'New Title')
            self.assertEqual(updated_task.descripcion, 'Updated description')

    def test_delete_task(self):
        """Test deleting a task"""
        with self.app_instance.app_context():
            task = Task(
                titulo='To Delete',
                fecha_inicio=date.today(),
                fecha_fin=date.today()
            )
            db.session.add(task)
            db.session.commit()
            task_id = task.id

        response = self.app.delete(f'/api/tasks/{task_id}')
        self.assertEqual(response.status_code, 200)
        
        # Verify deletion
        with self.app_instance.app_context():
            deleted_task = Task.query.get(task_id)
            self.assertIsNone(deleted_task)

    def test_toggle_task(self):
        """Test toggling task completion status"""
        with self.app_instance.app_context():
            task = Task(
                titulo='To Toggle',
                fecha_inicio=date.today(),
                fecha_fin=date.today(),
                completada=False
            )
            db.session.add(task)
            db.session.commit()
            task_id = task.id

        response = self.app.patch(f'/api/tasks/{task_id}/toggle')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.get_json()['task']['completada'])
        
        # Toggle back
        response = self.app.patch(f'/api/tasks/{task_id}/toggle')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.get_json()['task']['completada'])

if __name__ == '__main__':
    unittest.main()
