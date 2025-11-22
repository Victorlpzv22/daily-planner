import unittest
import sys
import os
from datetime import datetime, date, timedelta
import json

# Add src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from app import create_app
from database.db import db
from models.task import Task

class TestPeriodicTasks(unittest.TestCase):
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

    def test_create_daily_tasks(self):
        """Test creating daily tasks for 5 days"""
        start_date = date.today()
        data = {
            'titulo': 'Daily Workout',
            'fecha_inicio': start_date.isoformat(),
            'fecha_fin': start_date.isoformat(),
            'recurrence': {
                'enabled': True,
                'frequency': 'daily',
                'interval': 1,
                'endType': 'count',
                'count': 5
            }
        }
        
        response = self.app.post('/api/tasks/', json=data)
        if response.status_code != 201:
            print(response.get_json())
        self.assertEqual(response.status_code, 201)
        
        with self.app_instance.app_context():
            tasks = Task.query.all()
            self.assertEqual(len(tasks), 5)
            self.assertEqual(tasks[0].titulo, 'Daily Workout')
            self.assertIsNotNone(tasks[0].group_id)
            self.assertEqual(tasks[0].group_id, tasks[4].group_id)
            
            # Check dates
            dates = sorted([t.fecha_inicio for t in tasks])
            for i in range(5):
                expected_date = start_date + timedelta(days=i)
                self.assertEqual(dates[i], expected_date)

    def test_create_weekly_tasks(self):
        """Test creating weekly tasks on Mon and Wed"""
        # Start on a Monday
        start_date = date(2023, 1, 2) # Monday
        data = {
            'titulo': 'Weekly Meeting',
            'fecha_inicio': start_date.isoformat(),
            'fecha_fin': start_date.isoformat(),
            'recurrence': {
                'enabled': True,
                'frequency': 'weekly',
                'interval': 1,
                'weekdays': ['MO', 'WE'],
                'endType': 'count',
                'count': 4
            }
        }
        
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        with self.app_instance.app_context():
            tasks = Task.query.all()
            self.assertEqual(len(tasks), 4)
            
            dates = sorted([t.fecha_inicio for t in tasks])
            # Should be Mon, Wed, Mon, Wed
            self.assertEqual(dates[0], date(2023, 1, 2)) # Mon
            self.assertEqual(dates[1], date(2023, 1, 4)) # Wed
            self.assertEqual(dates[2], date(2023, 1, 9)) # Mon
            self.assertEqual(dates[3], date(2023, 1, 11)) # Wed

if __name__ == '__main__':
    unittest.main()
