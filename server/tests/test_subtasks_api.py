"""
Tests para la API de subtareas.
Prueba CRUD de subtareas, toggle y operaciones relacionadas.
"""
import unittest
import sys
import os
from datetime import date

# Add src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from app import create_app
from database.db import db
from models.task import Task
from models.subtask import Subtask


class TestSubtasksCreation(unittest.TestCase):
    """Tests para creación de subtareas"""
    
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

    def test_create_task_with_subtasks(self):
        """Test crear tarea con subtareas en la misma petición"""
        data = {
            'titulo': 'Task with Subtasks',
            'descripcion': 'Testing subtasks creation',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat(),
            'subtasks': [
                {'titulo': 'Subtask 1'},
                {'titulo': 'Subtask 2', 'completada': True}
            ]
        }
        
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        task = response.get_json()['task']
        self.assertEqual(task['titulo'], 'Task with Subtasks')
        self.assertEqual(len(task['subtasks']), 2)
        
        # Verificar subtareas
        subtask1 = next(s for s in task['subtasks'] if s['titulo'] == 'Subtask 1')
        subtask2 = next(s for s in task['subtasks'] if s['titulo'] == 'Subtask 2')
        
        self.assertFalse(subtask1['completada'])
        self.assertTrue(subtask2['completada'])

    def test_create_task_with_empty_subtasks(self):
        """Test crear tarea con lista vacía de subtareas"""
        data = {
            'titulo': 'Task No Subtasks',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat(),
            'subtasks': []
        }
        
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        task = response.get_json()['task']
        self.assertEqual(len(task['subtasks']), 0)

    def test_create_task_without_subtasks_field(self):
        """Test crear tarea sin campo subtasks"""
        data = {
            'titulo': 'No Subtasks Field',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat()
        }
        
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        task = response.get_json()['task']
        self.assertIn('subtasks', task)
        self.assertEqual(len(task['subtasks']), 0)

    def test_create_task_with_multiple_subtasks(self):
        """Test crear tarea con múltiples subtareas"""
        subtasks = [{'titulo': f'Subtask {i+1}'} for i in range(5)]
        data = {
            'titulo': 'Multi Subtask Task',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat(),
            'subtasks': subtasks
        }
        
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        task = response.get_json()['task']
        self.assertEqual(len(task['subtasks']), 5)


class TestSubtasksToggle(unittest.TestCase):
    """Tests para toggle de subtareas"""
    
    def setUp(self):
        self.app_instance = create_app({
            'TESTING': True,
            'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
            'SQLALCHEMY_TRACK_MODIFICATIONS': False
        })
        self.app = self.app_instance.test_client()
        
        with self.app_instance.app_context():
            db.create_all()
            # Crear tarea con subtarea
            self.task = Task(
                titulo='Task for Toggle',
                fecha_inicio=date.today(),
                fecha_fin=date.today()
            )
            db.session.add(self.task)
            db.session.commit()
            
            self.subtask = Subtask(
                task_id=self.task.id,
                titulo='Toggle Me',
                completada=False
            )
            db.session.add(self.subtask)
            db.session.commit()
            
            self.task_id = self.task.id
            self.subtask_id = self.subtask.id

    def tearDown(self):
        with self.app_instance.app_context():
            db.session.remove()
            db.drop_all()

    def test_toggle_subtask_complete(self):
        """Test marcar subtarea como completada"""
        response = self.app.patch(f'/api/tasks/{self.task_id}/subtasks/{self.subtask_id}/toggle')
        self.assertEqual(response.status_code, 200)
        
        subtask = response.get_json()['subtask']
        self.assertTrue(subtask['completada'])

    def test_toggle_subtask_incomplete(self):
        """Test marcar subtarea como no completada"""
        # Primero completar
        self.app.patch(f'/api/tasks/{self.task_id}/subtasks/{self.subtask_id}/toggle')
        
        # Luego desmarcar
        response = self.app.patch(f'/api/tasks/{self.task_id}/subtasks/{self.subtask_id}/toggle')
        self.assertEqual(response.status_code, 200)
        
        subtask = response.get_json()['subtask']
        self.assertFalse(subtask['completada'])

    def test_toggle_subtask_not_found(self):
        """Test toggle de subtarea inexistente"""
        response = self.app.patch(f'/api/tasks/{self.task_id}/subtasks/99999/toggle')
        self.assertEqual(response.status_code, 404)

    def test_toggle_subtask_wrong_task_id(self):
        """Test toggle con task_id incorrecto"""
        response = self.app.patch(f'/api/tasks/99999/subtasks/{self.subtask_id}/toggle')
        self.assertEqual(response.status_code, 400)


class TestSubtasksUpdate(unittest.TestCase):
    """Tests para actualización de subtareas"""
    
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

    def test_update_task_replaces_subtasks(self):
        """Test que actualizar tarea con subtasks reemplaza las existentes"""
        # Crear tarea con subtareas
        data = {
            'titulo': 'Original Task',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat(),
            'subtasks': [
                {'titulo': 'Original 1'},
                {'titulo': 'Original 2'}
            ]
        }
        response = self.app.post('/api/tasks/', json=data)
        task_id = response.get_json()['task']['id']
        
        # Actualizar con nuevas subtareas
        update_data = {
            'subtasks': [
                {'titulo': 'New 1'},
                {'titulo': 'New 2'},
                {'titulo': 'New 3'}
            ]
        }
        response = self.app.put(f'/api/tasks/{task_id}', json=update_data)
        self.assertEqual(response.status_code, 200)
        
        task = response.get_json()['task']
        self.assertEqual(len(task['subtasks']), 3)
        
        # Verificar que son las nuevas
        titles = [s['titulo'] for s in task['subtasks']]
        self.assertIn('New 1', titles)
        self.assertIn('New 2', titles)
        self.assertIn('New 3', titles)
        self.assertNotIn('Original 1', titles)

    def test_update_task_clears_subtasks(self):
        """Test que actualizar con array vacío elimina subtareas"""
        # Crear tarea con subtareas
        data = {
            'titulo': 'Task',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat(),
            'subtasks': [{'titulo': 'Subtask 1'}]
        }
        response = self.app.post('/api/tasks/', json=data)
        task_id = response.get_json()['task']['id']
        
        # Actualizar con array vacío
        update_data = {'subtasks': []}
        response = self.app.put(f'/api/tasks/{task_id}', json=update_data)
        self.assertEqual(response.status_code, 200)
        
        task = response.get_json()['task']
        self.assertEqual(len(task['subtasks']), 0)


class TestSubtasksDelete(unittest.TestCase):
    """Tests para eliminación de subtareas (cascade)"""
    
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

    def test_delete_task_cascades_subtasks(self):
        """Test que eliminar tarea elimina sus subtareas"""
        # Crear tarea con subtareas
        with self.app_instance.app_context():
            task = Task(
                titulo='Parent',
                fecha_inicio=date.today(),
                fecha_fin=date.today()
            )
            db.session.add(task)
            db.session.commit()
            
            subtask1 = Subtask(task_id=task.id, titulo='Child 1')
            subtask2 = Subtask(task_id=task.id, titulo='Child 2')
            db.session.add_all([subtask1, subtask2])
            db.session.commit()
            
            task_id = task.id

        # Eliminar tarea
        response = self.app.delete(f'/api/tasks/{task_id}')
        self.assertEqual(response.status_code, 200)
        
        # Verificar que las subtareas también fueron eliminadas
        with self.app_instance.app_context():
            subtasks = Subtask.query.filter_by(task_id=task_id).all()
            self.assertEqual(len(subtasks), 0)


class TestSubtasksRetrieval(unittest.TestCase):
    """Tests para obtención de subtareas"""
    
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

    def test_get_task_includes_subtasks(self):
        """Test que obtener tarea incluye sus subtareas"""
        # Crear tarea con subtareas
        with self.app_instance.app_context():
            task = Task(
                titulo='Task',
                fecha_inicio=date.today(),
                fecha_fin=date.today()
            )
            db.session.add(task)
            db.session.commit()
            
            subtask = Subtask(task_id=task.id, titulo='Included')
            db.session.add(subtask)
            db.session.commit()
            
            task_id = task.id

        # Obtener tarea
        response = self.app.get(f'/api/tasks/{task_id}')
        self.assertEqual(response.status_code, 200)
        
        task_data = response.get_json()['task']
        self.assertIn('subtasks', task_data)
        self.assertEqual(len(task_data['subtasks']), 1)
        self.assertEqual(task_data['subtasks'][0]['titulo'], 'Included')

    def test_get_all_tasks_includes_subtasks(self):
        """Test que obtener todas las tareas incluye subtareas"""
        # Crear tarea con subtarea
        with self.app_instance.app_context():
            task = Task(
                titulo='Listed Task',
                fecha_inicio=date.today(),
                fecha_fin=date.today()
            )
            db.session.add(task)
            db.session.commit()
            
            subtask = Subtask(task_id=task.id, titulo='In List')
            db.session.add(subtask)
            db.session.commit()

        # Obtener lista de tareas
        response = self.app.get('/api/tasks/')
        self.assertEqual(response.status_code, 200)
        
        tasks = response.get_json()['tasks']
        self.assertEqual(len(tasks), 1)
        self.assertEqual(len(tasks[0]['subtasks']), 1)

    def test_subtask_data_structure(self):
        """Test estructura de datos de subtarea"""
        # Crear tarea con subtarea
        data = {
            'titulo': 'Parent',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat(),
            'subtasks': [{'titulo': 'Check Structure', 'completada': True}]
        }
        response = self.app.post('/api/tasks/', json=data)
        task = response.get_json()['task']
        
        subtask = task['subtasks'][0]
        
        # Verificar campos requeridos
        self.assertIn('id', subtask)
        self.assertIn('task_id', subtask)
        self.assertIn('titulo', subtask)
        self.assertIn('completada', subtask)
        
        self.assertEqual(subtask['titulo'], 'Check Structure')
        self.assertTrue(subtask['completada'])
        self.assertEqual(subtask['task_id'], task['id'])


if __name__ == '__main__':
    unittest.main()
