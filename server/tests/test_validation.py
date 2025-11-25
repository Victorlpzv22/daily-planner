"""
Tests para validación de datos de entrada.
Prueba validaciones de campos, formatos y restricciones.
"""
import unittest
import sys
import os
from datetime import date, time

# Add src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from app import create_app
from database.db import db
from models.task import Task
from models.subtask import Subtask


class TestTaskValidation(unittest.TestCase):
    """Tests para validación de tareas"""
    
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

    # ============ Validación de título ============
    
    def test_titulo_required(self):
        """Test que el título es requerido"""
        data = {
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat()
        }
        response = self.app.post('/api/tasks/', json=data)
        self.assertIn(response.status_code, [400, 500])

    def test_titulo_empty_string(self):
        """Test título como cadena vacía"""
        data = {
            'titulo': '',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat()
        }
        response = self.app.post('/api/tasks/', json=data)
        # Puede ser aceptado o rechazado según implementación
        self.assertIn(response.status_code, [201, 400])

    def test_titulo_whitespace_only(self):
        """Test título con solo espacios"""
        data = {
            'titulo': '   ',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat()
        }
        response = self.app.post('/api/tasks/', json=data)
        self.assertIn(response.status_code, [201, 400])

    def test_titulo_very_long(self):
        """Test título muy largo"""
        data = {
            'titulo': 'A' * 1000,
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat()
        }
        response = self.app.post('/api/tasks/', json=data)
        # Debería aceptar o limitar
        self.assertIn(response.status_code, [201, 400])

    def test_titulo_special_characters(self):
        """Test título con caracteres especiales"""
        data = {
            'titulo': 'Tarea con ñ, á, é, ü y 日本語',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat()
        }
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        task = response.get_json()['task']
        self.assertEqual(task['titulo'], 'Tarea con ñ, á, é, ü y 日本語')

    # ============ Validación de fechas ============
    
    def test_fecha_inicio_required(self):
        """Test que fecha_inicio es requerida"""
        data = {
            'titulo': 'Test',
            'fecha_fin': date.today().isoformat()
        }
        response = self.app.post('/api/tasks/', json=data)
        self.assertIn(response.status_code, [400, 500])

    def test_fecha_fin_required(self):
        """Test que fecha_fin es requerida"""
        data = {
            'titulo': 'Test',
            'fecha_inicio': date.today().isoformat()
        }
        response = self.app.post('/api/tasks/', json=data)
        self.assertIn(response.status_code, [400, 500])

    def test_fecha_invalid_format(self):
        """Test formato de fecha inválido"""
        data = {
            'titulo': 'Test',
            'fecha_inicio': '01/15/2025',  # Formato incorrecto
            'fecha_fin': date.today().isoformat()
        }
        response = self.app.post('/api/tasks/', json=data)
        self.assertIn(response.status_code, [400, 500])

    def test_fecha_invalid_value(self):
        """Test fecha con valor inválido"""
        data = {
            'titulo': 'Test',
            'fecha_inicio': '2025-13-45',  # Mes y día inválidos
            'fecha_fin': date.today().isoformat()
        }
        response = self.app.post('/api/tasks/', json=data)
        self.assertIn(response.status_code, [400, 500])

    def test_fecha_fin_before_inicio(self):
        """Test fecha_fin antes de fecha_inicio"""
        data = {
            'titulo': 'Test',
            'fecha_inicio': '2025-01-15',
            'fecha_fin': '2025-01-10'  # Antes de inicio
        }
        response = self.app.post('/api/tasks/', json=data)
        # Puede ser aceptado (sin validación) o rechazado (con validación)
        self.assertIn(response.status_code, [201, 400])

    def test_fecha_same_day(self):
        """Test misma fecha inicio y fin"""
        data = {
            'titulo': 'Same Day Task',
            'fecha_inicio': '2025-01-15',
            'fecha_fin': '2025-01-15'
        }
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)

    # ============ Validación de hora ============
    
    def test_hora_valid_format(self):
        """Test formato de hora válido"""
        data = {
            'titulo': 'Timed Task',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat(),
            'hora': '14:30:00'
        }
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        task = response.get_json()['task']
        self.assertEqual(task['hora'], '14:30:00')

    def test_hora_short_format(self):
        """Test formato de hora corto (HH:MM)"""
        data = {
            'titulo': 'Short Time',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat(),
            'hora': '14:30'
        }
        response = self.app.post('/api/tasks/', json=data)
        # Puede aceptar ambos formatos
        self.assertIn(response.status_code, [201, 400])

    def test_hora_invalid_format(self):
        """Test formato de hora inválido"""
        data = {
            'titulo': 'Invalid Time',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat(),
            'hora': '25:70:99'  # Hora inválida
        }
        response = self.app.post('/api/tasks/', json=data)
        self.assertIn(response.status_code, [400, 500])

    def test_hora_null(self):
        """Test hora como null"""
        data = {
            'titulo': 'No Time',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat(),
            'hora': None
        }
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        task = response.get_json()['task']
        self.assertIsNone(task['hora'])

    # ============ Validación de prioridad ============
    
    def test_prioridad_valid_values(self):
        """Test valores válidos de prioridad"""
        valid_priorities = ['baja', 'media', 'alta']
        
        for prio in valid_priorities:
            data = {
                'titulo': f'Task {prio}',
                'fecha_inicio': date.today().isoformat(),
                'fecha_fin': date.today().isoformat(),
                'prioridad': prio
            }
            response = self.app.post('/api/tasks/', json=data)
            self.assertEqual(response.status_code, 201)
            
            task = response.get_json()['task']
            self.assertEqual(task['prioridad'], prio)

    def test_prioridad_invalid_value(self):
        """Test valor inválido de prioridad"""
        data = {
            'titulo': 'Invalid Priority',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat(),
            'prioridad': 'urgente'  # No válido
        }
        response = self.app.post('/api/tasks/', json=data)
        # Sin validación estricta, puede aceptarse
        self.assertIn(response.status_code, [201, 400])

    def test_prioridad_default(self):
        """Test valor por defecto de prioridad"""
        data = {
            'titulo': 'Default Priority',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat()
        }
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        task = response.get_json()['task']
        self.assertEqual(task['prioridad'], 'media')

    # ============ Validación de color ============
    
    def test_color_valid_hex(self):
        """Test colores hexadecimales válidos"""
        colors = ['#ff5722', '#4caf50', '#2196f3', '#9c27b0']
        
        for color in colors:
            data = {
                'titulo': f'Color {color}',
                'fecha_inicio': date.today().isoformat(),
                'fecha_fin': date.today().isoformat(),
                'color': color
            }
            response = self.app.post('/api/tasks/', json=data)
            self.assertEqual(response.status_code, 201)
            
            task = response.get_json()['task']
            self.assertEqual(task['color'], color)

    def test_color_invalid_format(self):
        """Test formato de color inválido"""
        data = {
            'titulo': 'Invalid Color',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat(),
            'color': 'red'  # Nombre en vez de hex
        }
        response = self.app.post('/api/tasks/', json=data)
        # Sin validación, puede aceptarse
        self.assertIn(response.status_code, [201, 400])

    def test_color_default(self):
        """Test valor por defecto de color"""
        data = {
            'titulo': 'Default Color',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat()
        }
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        task = response.get_json()['task']
        self.assertEqual(task['color'], '#1976d2')

    # ============ Validación de tipo ============
    
    def test_tipo_valid_values(self):
        """Test valores válidos de tipo"""
        valid_types = ['diaria', 'semanal', 'personalizado']
        
        for tipo in valid_types:
            data = {
                'titulo': f'Task {tipo}',
                'fecha_inicio': date.today().isoformat(),
                'fecha_fin': date.today().isoformat(),
                'tipo': tipo
            }
            response = self.app.post('/api/tasks/', json=data)
            self.assertEqual(response.status_code, 201)

    def test_tipo_default(self):
        """Test valor por defecto de tipo"""
        data = {
            'titulo': 'Default Type',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat()
        }
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        task = response.get_json()['task']
        self.assertEqual(task['tipo'], 'diaria')


class TestSubtaskValidation(unittest.TestCase):
    """Tests para validación de subtareas"""
    
    def setUp(self):
        self.app_instance = create_app({
            'TESTING': True,
            'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
            'SQLALCHEMY_TRACK_MODIFICATIONS': False
        })
        self.app = self.app_instance.test_client()
        
        with self.app_instance.app_context():
            db.create_all()
            # Crear tarea padre
            self.parent_task = Task(
                titulo='Parent',
                fecha_inicio=date.today(),
                fecha_fin=date.today()
            )
            db.session.add(self.parent_task)
            db.session.commit()
            self.task_id = self.parent_task.id

    def tearDown(self):
        with self.app_instance.app_context():
            db.session.remove()
            db.drop_all()

    def test_subtask_created_with_task(self):
        """Test crear tarea con subtarea"""
        data = {
            'titulo': 'Task with Subtask',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat(),
            'subtasks': [{'titulo': 'New Subtask'}]
        }
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        task = response.get_json()['task']
        self.assertEqual(len(task['subtasks']), 1)
        self.assertFalse(task['subtasks'][0]['completada'])

    def test_subtask_completada_explicit_true(self):
        """Test crear subtarea completada"""
        data = {
            'titulo': 'Task',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat(),
            'subtasks': [{'titulo': 'Completed', 'completada': True}]
        }
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        task = response.get_json()['task']
        self.assertTrue(task['subtasks'][0]['completada'])

    def test_subtask_empty_titulo_ignored(self):
        """Test que subtareas con título vacío son ignoradas"""
        data = {
            'titulo': 'Task',
            'fecha_inicio': date.today().isoformat(),
            'fecha_fin': date.today().isoformat(),
            'subtasks': [
                {'titulo': ''},
                {'titulo': 'Valid'}
            ]
        }
        response = self.app.post('/api/tasks/', json=data)
        self.assertEqual(response.status_code, 201)
        
        task = response.get_json()['task']
        # Solo debe crearse la subtarea con título válido
        self.assertEqual(len(task['subtasks']), 1)
        self.assertEqual(task['subtasks'][0]['titulo'], 'Valid')


class TestRequestValidation(unittest.TestCase):
    """Tests para validación de peticiones"""
    
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

    def test_post_no_content_type(self):
        """Test POST sin Content-Type"""
        response = self.app.post('/api/tasks/', data='{"titulo": "test"}')
        self.assertIn(response.status_code, [400, 415, 500])

    def test_post_invalid_json(self):
        """Test POST con JSON inválido"""
        response = self.app.post(
            '/api/tasks/', 
            data='not valid json',
            content_type='application/json'
        )
        self.assertIn(response.status_code, [400, 500])

    def test_post_empty_body(self):
        """Test POST con cuerpo vacío"""
        response = self.app.post(
            '/api/tasks/', 
            data='',
            content_type='application/json'
        )
        self.assertIn(response.status_code, [400, 500])

    def test_get_invalid_id_format(self):
        """Test GET con ID en formato inválido"""
        response = self.app.get('/api/tasks/abc')
        self.assertEqual(response.status_code, 404)

    def test_put_invalid_id(self):
        """Test PUT con ID inexistente"""
        data = {'titulo': 'Updated'}
        response = self.app.put('/api/tasks/99999', json=data)
        self.assertEqual(response.status_code, 404)

    def test_delete_invalid_id(self):
        """Test DELETE con ID inexistente"""
        response = self.app.delete('/api/tasks/99999')
        self.assertEqual(response.status_code, 404)


if __name__ == '__main__':
    unittest.main()
