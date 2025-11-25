"""
Tests para los modelos de la base de datos.
Prueba la creación, validación y serialización de Task y Subtask.
"""
import unittest
import sys
import os
from datetime import date, time, datetime, timedelta

# Add src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from app import create_app
from database.db import db
from models.task import Task
from models.subtask import Subtask


class TestTaskModel(unittest.TestCase):
    """Tests para el modelo Task"""
    
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

    def test_create_task_minimal(self):
        """Test crear tarea con campos mínimos requeridos"""
        with self.app_instance.app_context():
            task = Task(
                titulo='Test Task',
                fecha_inicio=date(2025, 1, 1),
                fecha_fin=date(2025, 1, 1)
            )
            db.session.add(task)
            db.session.commit()
            
            saved_task = Task.query.first()
            self.assertIsNotNone(saved_task)
            self.assertEqual(saved_task.titulo, 'Test Task')
            self.assertEqual(saved_task.fecha_inicio, date(2025, 1, 1))
            self.assertEqual(saved_task.fecha_fin, date(2025, 1, 1))

    def test_task_default_values(self):
        """Test valores por defecto de una tarea"""
        with self.app_instance.app_context():
            task = Task(
                titulo='Default Task',
                fecha_inicio=date(2025, 1, 1),
                fecha_fin=date(2025, 1, 1)
            )
            db.session.add(task)
            db.session.commit()
            
            saved_task = Task.query.first()
            self.assertFalse(saved_task.completada)
            self.assertEqual(saved_task.prioridad, 'media')
            self.assertEqual(saved_task.tipo, 'diaria')
            self.assertEqual(saved_task.color, '#1976d2')
            self.assertIsNone(saved_task.descripcion)
            self.assertIsNone(saved_task.hora)
            self.assertIsNone(saved_task.group_id)

    def test_create_task_all_fields(self):
        """Test crear tarea con todos los campos"""
        with self.app_instance.app_context():
            task = Task(
                titulo='Full Task',
                descripcion='Descripción completa de la tarea',
                fecha_inicio=date(2025, 1, 1),
                fecha_fin=date(2025, 1, 7),
                hora=time(10, 30, 0),
                completada=True,
                prioridad='alta',
                tipo='semanal',
                color='#ff5722',
                group_id='abc-123-def'
            )
            db.session.add(task)
            db.session.commit()
            
            saved_task = Task.query.first()
            self.assertEqual(saved_task.titulo, 'Full Task')
            self.assertEqual(saved_task.descripcion, 'Descripción completa de la tarea')
            self.assertEqual(saved_task.fecha_inicio, date(2025, 1, 1))
            self.assertEqual(saved_task.fecha_fin, date(2025, 1, 7))
            self.assertEqual(saved_task.hora, time(10, 30, 0))
            self.assertTrue(saved_task.completada)
            self.assertEqual(saved_task.prioridad, 'alta')
            self.assertEqual(saved_task.tipo, 'semanal')
            self.assertEqual(saved_task.color, '#ff5722')
            self.assertEqual(saved_task.group_id, 'abc-123-def')

    def test_task_to_dict(self):
        """Test serialización de tarea a diccionario"""
        with self.app_instance.app_context():
            task = Task(
                titulo='Dict Task',
                descripcion='Test description',
                fecha_inicio=date(2025, 6, 15),
                fecha_fin=date(2025, 6, 15),
                hora=time(14, 30, 0),
                prioridad='baja',
                tipo='diaria',
                color='#4caf50'
            )
            db.session.add(task)
            db.session.commit()
            
            data = task.to_dict()
            
            self.assertIn('id', data)
            self.assertEqual(data['titulo'], 'Dict Task')
            self.assertEqual(data['descripcion'], 'Test description')
            self.assertEqual(data['fecha_inicio'], '2025-06-15')
            self.assertEqual(data['fecha_fin'], '2025-06-15')
            self.assertEqual(data['hora'], '14:30:00')
            self.assertFalse(data['completada'])
            self.assertEqual(data['prioridad'], 'baja')
            self.assertEqual(data['tipo'], 'diaria')
            self.assertEqual(data['color'], '#4caf50')
            self.assertIsNone(data['group_id'])
            self.assertIn('subtasks', data)
            self.assertEqual(data['subtasks'], [])

    def test_task_to_dict_without_hora(self):
        """Test serialización de tarea sin hora"""
        with self.app_instance.app_context():
            task = Task(
                titulo='No Time Task',
                fecha_inicio=date(2025, 1, 1),
                fecha_fin=date(2025, 1, 1)
            )
            db.session.add(task)
            db.session.commit()
            
            data = task.to_dict()
            self.assertIsNone(data['hora'])

    def test_task_timestamps(self):
        """Test que created_at y updated_at se establecen automáticamente"""
        with self.app_instance.app_context():
            task = Task(
                titulo='Timestamp Task',
                fecha_inicio=date(2025, 1, 1),
                fecha_fin=date(2025, 1, 1)
            )
            db.session.add(task)
            db.session.commit()
            
            self.assertIsNotNone(task.created_at)
            self.assertIsNotNone(task.updated_at)
            self.assertIsInstance(task.created_at, datetime)

    def test_multiple_tasks(self):
        """Test crear múltiples tareas"""
        with self.app_instance.app_context():
            for i in range(5):
                task = Task(
                    titulo=f'Task {i+1}',
                    fecha_inicio=date(2025, 1, i+1),
                    fecha_fin=date(2025, 1, i+1)
                )
                db.session.add(task)
            db.session.commit()
            
            tasks = Task.query.all()
            self.assertEqual(len(tasks), 5)

    def test_task_with_different_priorities(self):
        """Test tareas con diferentes prioridades"""
        with self.app_instance.app_context():
            priorities = ['baja', 'media', 'alta']
            for prio in priorities:
                task = Task(
                    titulo=f'Task {prio}',
                    fecha_inicio=date(2025, 1, 1),
                    fecha_fin=date(2025, 1, 1),
                    prioridad=prio
                )
                db.session.add(task)
            db.session.commit()
            
            for prio in priorities:
                task = Task.query.filter_by(prioridad=prio).first()
                self.assertIsNotNone(task)
                self.assertEqual(task.prioridad, prio)

    def test_task_with_different_types(self):
        """Test tareas con diferentes tipos"""
        with self.app_instance.app_context():
            types = ['diaria', 'semanal', 'personalizado']
            for tipo in types:
                task = Task(
                    titulo=f'Task {tipo}',
                    fecha_inicio=date(2025, 1, 1),
                    fecha_fin=date(2025, 1, 1),
                    tipo=tipo
                )
                db.session.add(task)
            db.session.commit()
            
            for tipo in types:
                task = Task.query.filter_by(tipo=tipo).first()
                self.assertIsNotNone(task)
                self.assertEqual(task.tipo, tipo)


class TestSubtaskModel(unittest.TestCase):
    """Tests para el modelo Subtask"""
    
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

    def test_create_subtask(self):
        """Test crear subtarea"""
        with self.app_instance.app_context():
            # Primero crear tarea padre
            task = Task(
                titulo='Parent Task',
                fecha_inicio=date(2025, 1, 1),
                fecha_fin=date(2025, 1, 1)
            )
            db.session.add(task)
            db.session.commit()
            
            subtask = Subtask(
                task_id=task.id,
                titulo='Subtask 1'
            )
            db.session.add(subtask)
            db.session.commit()
            
            saved_subtask = Subtask.query.first()
            self.assertIsNotNone(saved_subtask)
            self.assertEqual(saved_subtask.titulo, 'Subtask 1')
            self.assertEqual(saved_subtask.task_id, task.id)
            self.assertFalse(saved_subtask.completada)

    def test_subtask_default_completada(self):
        """Test que subtarea no está completada por defecto"""
        with self.app_instance.app_context():
            task = Task(
                titulo='Parent',
                fecha_inicio=date(2025, 1, 1),
                fecha_fin=date(2025, 1, 1)
            )
            db.session.add(task)
            db.session.commit()
            
            subtask = Subtask(task_id=task.id, titulo='Test')
            db.session.add(subtask)
            db.session.commit()
            
            self.assertFalse(subtask.completada)

    def test_subtask_to_dict(self):
        """Test serialización de subtarea a diccionario"""
        with self.app_instance.app_context():
            task = Task(
                titulo='Parent',
                fecha_inicio=date(2025, 1, 1),
                fecha_fin=date(2025, 1, 1)
            )
            db.session.add(task)
            db.session.commit()
            
            subtask = Subtask(
                task_id=task.id,
                titulo='Subtask Test',
                completada=True
            )
            db.session.add(subtask)
            db.session.commit()
            
            data = subtask.to_dict()
            
            self.assertIn('id', data)
            self.assertEqual(data['task_id'], task.id)
            self.assertEqual(data['titulo'], 'Subtask Test')
            self.assertTrue(data['completada'])

    def test_multiple_subtasks_per_task(self):
        """Test múltiples subtareas por tarea"""
        with self.app_instance.app_context():
            task = Task(
                titulo='Parent',
                fecha_inicio=date(2025, 1, 1),
                fecha_fin=date(2025, 1, 1)
            )
            db.session.add(task)
            db.session.commit()
            
            for i in range(5):
                subtask = Subtask(
                    task_id=task.id,
                    titulo=f'Subtask {i+1}'
                )
                db.session.add(subtask)
            db.session.commit()
            
            subtasks = Subtask.query.filter_by(task_id=task.id).all()
            self.assertEqual(len(subtasks), 5)

    def test_task_subtasks_relationship(self):
        """Test relación entre Task y Subtasks"""
        with self.app_instance.app_context():
            task = Task(
                titulo='Parent Task',
                fecha_inicio=date(2025, 1, 1),
                fecha_fin=date(2025, 1, 1)
            )
            db.session.add(task)
            db.session.commit()
            
            subtask1 = Subtask(task_id=task.id, titulo='Subtask 1')
            subtask2 = Subtask(task_id=task.id, titulo='Subtask 2')
            db.session.add_all([subtask1, subtask2])
            db.session.commit()
            
            # Verificar relación desde Task
            self.assertEqual(len(task.subtasks), 2)
            
            # Verificar que aparecen en to_dict
            data = task.to_dict()
            self.assertEqual(len(data['subtasks']), 2)

    def test_cascade_delete_subtasks(self):
        """Test que al eliminar tarea se eliminan sus subtareas"""
        with self.app_instance.app_context():
            task = Task(
                titulo='To Delete',
                fecha_inicio=date(2025, 1, 1),
                fecha_fin=date(2025, 1, 1)
            )
            db.session.add(task)
            db.session.commit()
            task_id = task.id
            
            subtask = Subtask(task_id=task_id, titulo='Will be deleted')
            db.session.add(subtask)
            db.session.commit()
            
            # Verificar que existe
            self.assertEqual(Subtask.query.count(), 1)
            
            # Eliminar tarea
            db.session.delete(task)
            db.session.commit()
            
            # Verificar cascade delete
            self.assertEqual(Subtask.query.count(), 0)


class TestTaskFiltering(unittest.TestCase):
    """Tests para filtrado de tareas"""
    
    def setUp(self):
        self.app_instance = create_app({
            'TESTING': True,
            'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
            'SQLALCHEMY_TRACK_MODIFICATIONS': False
        })
        
        with self.app_instance.app_context():
            db.create_all()
            # Crear tareas de prueba
            self._create_test_tasks()

    def _create_test_tasks(self):
        """Crear tareas de prueba para filtrado"""
        tasks = [
            Task(titulo='Task 1', fecha_inicio=date(2025, 1, 1), fecha_fin=date(2025, 1, 1), 
                 completada=False, prioridad='alta'),
            Task(titulo='Task 2', fecha_inicio=date(2025, 1, 5), fecha_fin=date(2025, 1, 5), 
                 completada=True, prioridad='media'),
            Task(titulo='Task 3', fecha_inicio=date(2025, 1, 10), fecha_fin=date(2025, 1, 10), 
                 completada=False, prioridad='baja'),
            Task(titulo='Task 4', fecha_inicio=date(2025, 2, 1), fecha_fin=date(2025, 2, 1), 
                 completada=True, prioridad='alta'),
        ]
        for task in tasks:
            db.session.add(task)
        db.session.commit()

    def tearDown(self):
        with self.app_instance.app_context():
            db.session.remove()
            db.drop_all()

    def test_filter_by_completada(self):
        """Test filtrar por estado completada"""
        with self.app_instance.app_context():
            completed = Task.query.filter_by(completada=True).all()
            pending = Task.query.filter_by(completada=False).all()
            
            self.assertEqual(len(completed), 2)
            self.assertEqual(len(pending), 2)

    def test_filter_by_prioridad(self):
        """Test filtrar por prioridad"""
        with self.app_instance.app_context():
            alta = Task.query.filter_by(prioridad='alta').all()
            self.assertEqual(len(alta), 2)

    def test_filter_by_date_range(self):
        """Test filtrar por rango de fechas"""
        with self.app_instance.app_context():
            january_tasks = Task.query.filter(
                Task.fecha_inicio >= date(2025, 1, 1),
                Task.fecha_inicio <= date(2025, 1, 31)
            ).all()
            
            self.assertEqual(len(january_tasks), 3)

    def test_order_by_fecha(self):
        """Test ordenar por fecha"""
        with self.app_instance.app_context():
            tasks = Task.query.order_by(Task.fecha_inicio.asc()).all()
            
            self.assertEqual(tasks[0].fecha_inicio, date(2025, 1, 1))
            self.assertEqual(tasks[-1].fecha_inicio, date(2025, 2, 1))


if __name__ == '__main__':
    unittest.main()
