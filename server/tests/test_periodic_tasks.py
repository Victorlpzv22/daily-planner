"""
Tests para la funcionalidad de tareas periódicas/recurrentes.
Prueba la creación de tareas diarias, semanales y mensuales.
"""
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


class TestDailyTasks(unittest.TestCase):
    """Tests para tareas diarias"""
    
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

    def test_create_daily_tasks_by_count(self):
        """Test crear tareas diarias por cantidad"""
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
        self.assertEqual(response.status_code, 201)
        
        with self.app_instance.app_context():
            tasks = Task.query.all()
            self.assertEqual(len(tasks), 5)
            self.assertEqual(tasks[0].titulo, 'Daily Workout')
            
            # Verificar group_id compartido
            self.assertIsNotNone(tasks[0].group_id)
            group_ids = set(t.group_id for t in tasks)
            self.assertEqual(len(group_ids), 1)  # Todos tienen el mismo group_id
            
            # Verificar fechas consecutivas
            dates = sorted([t.fecha_inicio for t in tasks])
            for i in range(5):
                expected_date = start_date + timedelta(days=i)
                self.assertEqual(dates[i], expected_date)

    def test_create_daily_tasks_every_two_days(self):
        """Test crear tareas cada 2 días"""
        start_date = date(2025, 1, 1)
        data = {
            'titulo': 'Every Other Day',
            'fecha_inicio': start_date.isoformat(),
            'fecha_fin': start_date.isoformat(),
            'recurrence': {
                'enabled': True,
                'frequency': 'daily',
                'interval': 2,
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
            expected_dates = [
                date(2025, 1, 1),
                date(2025, 1, 3),
                date(2025, 1, 5),
                date(2025, 1, 7)
            ]
            for i, d in enumerate(dates):
                self.assertEqual(d, expected_dates[i])

    def test_create_daily_tasks_by_end_date(self):
        """Test crear tareas diarias hasta fecha específica"""
        start_date = date(2025, 1, 1)
        end_date = date(2025, 1, 5)
        data = {
            'titulo': 'Daily Until End',
            'fecha_inicio': start_date.isoformat(),
            'fecha_fin': start_date.isoformat(),
            'recurrence': {
                'enabled': True,
                'frequency': 'daily',
                'interval': 1,
                'endType': 'date',
                'endDate': end_date.isoformat()
            }
        }
        
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        with self.app_instance.app_context():
            tasks = Task.query.all()
            # Debería incluir del 1 al 5 = 5 tareas
            self.assertEqual(len(tasks), 5)


class TestWeeklyTasks(unittest.TestCase):
    """Tests para tareas semanales"""
    
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

    def test_create_weekly_tasks_mon_wed(self):
        """Test crear tareas semanales en Lunes y Miércoles"""
        start_date = date(2025, 1, 6)  # Lunes
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
            # Debería ser: Lun 6, Mie 8, Lun 13, Mie 15
            self.assertEqual(dates[0].weekday(), 0)  # Lunes
            self.assertEqual(dates[1].weekday(), 2)  # Miércoles

    def test_create_weekly_tasks_single_day(self):
        """Test crear tareas semanales en un solo día"""
        start_date = date(2025, 1, 7)  # Martes
        data = {
            'titulo': 'Tuesday Meeting',
            'fecha_inicio': start_date.isoformat(),
            'fecha_fin': start_date.isoformat(),
            'recurrence': {
                'enabled': True,
                'frequency': 'weekly',
                'interval': 1,
                'weekdays': ['TU'],
                'endType': 'count',
                'count': 3
            }
        }
        
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        with self.app_instance.app_context():
            tasks = Task.query.all()
            self.assertEqual(len(tasks), 3)
            
            # Todas deberían ser martes
            for task in tasks:
                self.assertEqual(task.fecha_inicio.weekday(), 1)  # Martes

    def test_create_weekly_tasks_every_two_weeks(self):
        """Test crear tareas cada 2 semanas"""
        start_date = date(2025, 1, 6)  # Lunes
        data = {
            'titulo': 'Biweekly',
            'fecha_inicio': start_date.isoformat(),
            'fecha_fin': start_date.isoformat(),
            'recurrence': {
                'enabled': True,
                'frequency': 'weekly',
                'interval': 2,
                'weekdays': ['MO'],
                'endType': 'count',
                'count': 3
            }
        }
        
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        with self.app_instance.app_context():
            tasks = Task.query.all()
            self.assertEqual(len(tasks), 3)
            
            dates = sorted([t.fecha_inicio for t in tasks])
            expected = [
                date(2025, 1, 6),   # Semana 1
                date(2025, 1, 20),  # Semana 3
                date(2025, 2, 3),   # Semana 5
            ]
            for i, d in enumerate(dates):
                self.assertEqual(d, expected[i])

    def test_create_weekly_tasks_all_weekdays(self):
        """Test crear tareas en todos los días laborables"""
        start_date = date(2025, 1, 6)  # Lunes
        data = {
            'titulo': 'Weekday Task',
            'fecha_inicio': start_date.isoformat(),
            'fecha_fin': start_date.isoformat(),
            'recurrence': {
                'enabled': True,
                'frequency': 'weekly',
                'interval': 1,
                'weekdays': ['MO', 'TU', 'WE', 'TH', 'FR'],
                'endType': 'count',
                'count': 10
            }
        }
        
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        with self.app_instance.app_context():
            tasks = Task.query.all()
            self.assertEqual(len(tasks), 10)
            
            # Verificar que no hay sábados ni domingos
            for task in tasks:
                self.assertLess(task.fecha_inicio.weekday(), 5)


class TestMonthlyTasks(unittest.TestCase):
    """Tests para tareas mensuales"""
    
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

    def test_create_monthly_tasks_by_day(self):
        """Test crear tareas mensuales en día específico"""
        start_date = date(2025, 1, 15)
        data = {
            'titulo': 'Monthly Review',
            'fecha_inicio': start_date.isoformat(),
            'fecha_fin': start_date.isoformat(),
            'recurrence': {
                'enabled': True,
                'frequency': 'monthly',
                'interval': 1,
                'monthDay': 15,
                'endType': 'count',
                'count': 3
            }
        }
        
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        with self.app_instance.app_context():
            tasks = Task.query.all()
            self.assertEqual(len(tasks), 3)
            
            dates = sorted([t.fecha_inicio for t in tasks])
            expected = [
                date(2025, 1, 15),
                date(2025, 2, 15),
                date(2025, 3, 15),
            ]
            for i, d in enumerate(dates):
                self.assertEqual(d, expected[i])


class TestRecurrenceDisabled(unittest.TestCase):
    """Tests para tareas sin recurrencia"""
    
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

    def test_create_single_task_no_recurrence(self):
        """Test crear tarea única sin recurrencia"""
        data = {
            'titulo': 'Single Task',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat()
        }
        
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        with self.app_instance.app_context():
            tasks = Task.query.all()
            self.assertEqual(len(tasks), 1)
            self.assertIsNone(tasks[0].group_id)

    def test_create_task_recurrence_disabled(self):
        """Test crear tarea con recurrence.enabled=False"""
        data = {
            'titulo': 'Disabled Recurrence',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat(),
            'recurrence': {
                'enabled': False,
                'frequency': 'daily',
                'count': 5
            }
        }
        
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        with self.app_instance.app_context():
            tasks = Task.query.all()
            self.assertEqual(len(tasks), 1)


class TestRecurrenceEdgeCases(unittest.TestCase):
    """Tests para casos límite de recurrencia"""
    
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

    def test_recurrence_preserves_task_attributes(self):
        """Test que la recurrencia preserva los atributos de la tarea"""
        data = {
            'titulo': 'Detailed Task',
            'descripcion': 'Description text',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat(),
            'hora': '10:30:00',
            'prioridad': 'alta',
            'color': '#ff5722',
            'recurrence': {
                'enabled': True,
                'frequency': 'daily',
                'interval': 1,
                'endType': 'count',
                'count': 3
            }
        }
        
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        with self.app_instance.app_context():
            tasks = Task.query.all()
            for task in tasks:
                self.assertEqual(task.descripcion, 'Description text')
                self.assertEqual(task.prioridad, 'alta')
                self.assertEqual(task.color, '#ff5722')

    def test_recurrence_max_count_protection(self):
        """Test protección contra demasiadas tareas"""
        data = {
            'titulo': 'Overflow Test',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat(),
            'recurrence': {
                'enabled': True,
                'frequency': 'daily',
                'interval': 1,
                'endType': 'count',
                'count': 1000  # Intentar crear muchas tareas
            }
        }
        
        response = self.app.post('/api/tasks/', json=data)
        # Debería limitar o rechazar
        self.assertIn(response.status_code, [201, 400])
        
        # Si se crearon, verificar que hay un límite
        if response.status_code == 201:
            with self.app_instance.app_context():
                tasks = Task.query.all()
                # No debería permitir más de un límite razonable
                self.assertLessEqual(len(tasks), 365)

    def test_recurrence_with_past_end_date(self):
        """Test recurrencia con fecha fin en el pasado.
        
        Cuando la fecha fin de recurrencia es anterior a la fecha de inicio,
        no se generan tareas y se devuelve un error 400 apropiado.
        """
        data = {
            'titulo': 'Past End Date',
            'fecha_inicio': '2020-01-01',
            'fecha_fin': '2020-01-01',
            'recurrence': {
                'enabled': True,
                'frequency': 'daily',
                'interval': 1,
                'endType': 'date',
                'endDate': '2019-01-01'  # Fecha fin antes de inicio
            }
        }
        
        response = self.app.post('/api/tasks/', json=data)
        # Ahora devuelve 400 con mensaje explicativo
        self.assertEqual(response.status_code, 400)
        json_data = response.get_json()
        self.assertIn('error', json_data)


class TestDeleteRecurringTasks(unittest.TestCase):
    """Tests para eliminar tareas recurrentes"""
    
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

    def test_delete_single_recurring_task(self):
        """Test eliminar una tarea de un grupo recurrente"""
        # Crear tareas recurrentes
        data = {
            'titulo': 'Daily Task',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat(),
            'recurrence': {
                'enabled': True,
                'frequency': 'daily',
                'interval': 1,
                'endType': 'count',
                'count': 5
            }
        }
        
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        with self.app_instance.app_context():
            tasks = Task.query.all()
            self.assertEqual(len(tasks), 5)
            task_to_delete = tasks[0].id
        
        # Eliminar una tarea
        response = self.app.delete(f'/api/tasks/{task_to_delete}')
        self.assertEqual(response.status_code, 200)
        
        # Verificar que quedan 4
        with self.app_instance.app_context():
            tasks = Task.query.all()
            self.assertEqual(len(tasks), 4)


if __name__ == '__main__':
    unittest.main()
