from flask import request, jsonify
from models.task import Task
from database.db import db
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, date, time, timedelta, timezone
from dateutil.rrule import rrule, DAILY, WEEKLY, MONTHLY, YEARLY, MO, TU, WE, TH, FR, SA, SU
import uuid

class TaskController:
    
    @staticmethod
    def get_all_tasks():
        """Obtener todas las tareas"""
        try:
            tasks = Task.query.order_by(Task.fecha_inicio.desc()).all()
            return jsonify({
                'tasks': [task.to_dict() for task in tasks]
            }), 200
        except SQLAlchemyError as e:
            return jsonify({'error': 'Error al obtener tareas', 'details': str(e)}), 500
    
    @staticmethod
    def get_task(task_id):
        """Obtener una tarea por ID"""
        try:
            task = db.session.get(Task, task_id)
            if not task:
                return jsonify({'error': 'Tarea no encontrada'}), 404
            return jsonify({'task': task.to_dict()}), 200
        except SQLAlchemyError as e:
            return jsonify({'error': 'Error al obtener tarea', 'details': str(e)}), 500
    
    @staticmethod
    def create_task():
        """Crear una nueva tarea"""
        try:
            data = request.get_json()
            
            # Validaciones
            if not data:
                return jsonify({'error': 'No se enviaron datos'}), 400
            
            if 'titulo' not in data or not data['titulo'].strip():
                return jsonify({'error': 'El título es obligatorio'}), 400
            
            if 'fecha_inicio' not in data:
                return jsonify({'error': 'La fecha de inicio es obligatoria'}), 400
            
            if 'fecha_fin' not in data:
                return jsonify({'error': 'La fecha de fin es obligatoria'}), 400
            
            # Parsear fecha_inicio
            try:
                fecha_inicio_obj = datetime.strptime(data['fecha_inicio'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Formato de fecha_inicio inválido. Use YYYY-MM-DD'}), 400
            
            # Parsear fecha_fin
            try:
                fecha_fin_obj = datetime.strptime(data['fecha_fin'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Formato de fecha_fin inválido. Use YYYY-MM-DD'}), 400
            
            # Validar que fecha_fin >= fecha_inicio
            if fecha_fin_obj < fecha_inicio_obj:
                return jsonify({'error': 'La fecha de fin debe ser posterior o igual a la fecha de inicio'}), 400
            
            # Parsear hora (opcional)
            hora_obj = None
            if data.get('hora'):
                try:
                    hora_obj = datetime.strptime(data['hora'], '%H:%M:%S').time()
                except ValueError:
                    try:
                        hora_obj = datetime.strptime(data['hora'], '%H:%M').time()
                    except ValueError:
                        return jsonify({'error': 'Formato de hora inválido. Use HH:MM:SS o HH:MM'}), 400
            
            # Validar prioridad
            prioridad = data.get('prioridad', 'media').lower()
            if prioridad not in ['baja', 'media', 'alta']:
                return jsonify({'error': 'Prioridad inválida. Debe ser: baja, media o alta'}), 400
            
            # Validar tipo
            tipo = data.get('tipo', 'diaria').lower()
            if tipo not in ['diaria', 'semanal', 'personalizado']:
                return jsonify({'error': 'Tipo inválido. Debe ser: diaria, semanal o personalizado'}), 400
            
            # Validar color (opcional)
            color = data.get('color', '#1976d2')
            if color and not color.startswith('#'):
                return jsonify({'error': 'Formato de color inválido. Use formato hexadecimal (#RRGGBB)'}), 400
            if color and len(color) not in [4, 7]:  # #RGB o #RRGGBB
                return jsonify({'error': 'Formato de color inválido. Use #RGB o #RRGGBB'}), 400
            
            # Manejo de recurrencia
            recurrence = data.get('recurrence')
            tasks_to_create = []
            group_id = None
            
            if recurrence and recurrence.get('enabled'):
                group_id = str(uuid.uuid4())
                
                freq_map = {
                    'daily': DAILY,
                    'weekly': WEEKLY,
                    'monthly': MONTHLY,
                    'yearly': YEARLY
                }
                
                freq = freq_map.get(recurrence.get('frequency', 'daily'))
                interval = int(recurrence.get('interval', 1))
                
                # Días de la semana para semanal
                # NOTA: Para tareas de tipo "semanal", NO usar weekdays del frontend
                # Las tareas semanales siempre se repiten comenzando el lunes
                weekdays = None
                if recurrence.get('frequency') == 'weekly' and tipo != 'semanal' and recurrence.get('weekdays'):
                    day_map = {'MO': MO, 'TU': TU, 'WE': WE, 'TH': TH, 'FR': FR, 'SA': SA, 'SU': SU}
                    weekdays = [day_map[d] for d in recurrence['weekdays'] if d in day_map]
                
                # Para tareas semanales con recurrencia, forzar inicio en lunes
                if tipo == 'semanal':
                    # Ajustar fecha_inicio al lunes de esa semana
                    days_since_monday = fecha_inicio_obj.weekday()
                    fecha_inicio_obj = fecha_inicio_obj - timedelta(days=days_since_monday)
                    # La fecha_fin es el domingo de esa semana (6 días después del lunes)
                    fecha_fin_obj = fecha_inicio_obj + timedelta(days=6)
                
                # Fecha fin o conteo
                until = None
                count = None
                
                if recurrence.get('endType') == 'date' and recurrence.get('endDate'):
                    try:
                        until = datetime.strptime(recurrence['endDate'], '%Y-%m-%d').date()
                    except ValueError:
                        pass
                elif recurrence.get('endType') == 'count' and recurrence.get('count'):
                    count = int(recurrence['count'])
                
                # Límite de seguridad: si no hay until ni count, limitar a 1 año o 52 ocurrencias
                if not until and not count:
                    until = fecha_inicio_obj + timedelta(days=365)
                
                # Limitar count máximo para evitar overflow
                if count and count > 365:
                    count = 365
                
                # Generar fechas
                # Nota: rrule usa datetime, no date
                start_dt = datetime.combine(fecha_inicio_obj, datetime.min.time())
                
                rule_kwargs = {
                    'freq': freq,
                    'interval': interval,
                    'dtstart': start_dt,
                }
                
                # Para tareas semanales, siempre usar lunes como día de inicio
                if tipo == 'semanal' and freq == WEEKLY:
                    rule_kwargs['byweekday'] = MO
                elif weekdays:
                    rule_kwargs['byweekday'] = weekdays
                if until:
                    rule_kwargs['until'] = datetime.combine(until, datetime.max.time())
                if count:
                    rule_kwargs['count'] = count
                    
                dates = list(rrule(**rule_kwargs))
                
                # Limitar número máximo de tareas generadas
                if len(dates) > 365:
                    dates = dates[:365]
                
                # Duración de la tarea original (mínimo 0 días)
                duration = max(0, (fecha_fin_obj - fecha_inicio_obj).days)
                
                for dt in dates:
                    task_start = dt.date()
                    # Validar que la fecha no cause overflow
                    try:
                        task_end = task_start + timedelta(days=duration)
                    except OverflowError:
                        continue  # Saltar esta fecha si causa overflow
                    
                    tasks_to_create.append({
                        'fecha_inicio': task_start,
                        'fecha_fin': task_end
                    })
            else:
                # Tarea única
                tasks_to_create.append({
                    'fecha_inicio': fecha_inicio_obj,
                    'fecha_fin': fecha_fin_obj
                })
            
            created_tasks = []
            subtasks_data = data.get('subtasks', [])
            
            for task_dates in tasks_to_create:
                new_task = Task(
                    titulo=data['titulo'].strip(),
                    descripcion=data.get('descripcion', '').strip() if data.get('descripcion') else None,
                    fecha_inicio=task_dates['fecha_inicio'],
                    fecha_fin=task_dates['fecha_fin'],
                    hora=hora_obj,
                    completada=data.get('completada', False),
                    prioridad=prioridad,
                    tipo=tipo,
                    color=color,
                    group_id=group_id
                )
                db.session.add(new_task)
                db.session.flush() # Para obtener el ID
                
                # Crear subtareas
                from models.subtask import Subtask
                for subtask_data in subtasks_data:
                    if subtask_data.get('titulo'):
                        new_subtask = Subtask(
                            task_id=new_task.id,
                            titulo=subtask_data['titulo'].strip(),
                            completada=subtask_data.get('completada', False)
                        )
                        db.session.add(new_subtask)
                
                created_tasks.append(new_task)
            
            db.session.commit()
            
            # Verificar que se crearon tareas
            if not created_tasks:
                return jsonify({'error': 'No se pudieron crear tareas. Verifique los parámetros de recurrencia.'}), 400
            
            return jsonify({
                'message': f'{len(created_tasks)} tarea(s) creada(s) exitosamente',
                'task': created_tasks[0].to_dict(),
                'count': len(created_tasks)
            }), 201
            
        except SQLAlchemyError as e:
            db.session.rollback()
            return jsonify({'error': 'Error al crear tarea', 'details': str(e)}), 500
    
    @staticmethod
    def update_task(task_id):
        """Actualizar una tarea existente"""
        try:
            task = db.session.get(Task, task_id)
            if not task:
                return jsonify({'error': 'Tarea no encontrada'}), 404
            
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No se enviaron datos'}), 400
            
            # Actualizar campos
            if 'titulo' in data:
                if not data['titulo'].strip():
                    return jsonify({'error': 'El título no puede estar vacío'}), 400
                task.titulo = data['titulo'].strip()
            
            if 'descripcion' in data:
                task.descripcion = data['descripcion'].strip() if data['descripcion'] else None
            
            if 'fecha_inicio' in data:
                try:
                    task.fecha_inicio = datetime.strptime(data['fecha_inicio'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({'error': 'Formato de fecha_inicio inválido'}), 400
            
            if 'fecha_fin' in data:
                try:
                    task.fecha_fin = datetime.strptime(data['fecha_fin'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({'error': 'Formato de fecha_fin inválido'}), 400
            
            # Validar que fecha_fin >= fecha_inicio
            if task.fecha_fin < task.fecha_inicio:
                return jsonify({'error': 'La fecha de fin debe ser posterior o igual a la fecha de inicio'}), 400
            
            if 'hora' in data:
                if data['hora']:
                    try:
                        task.hora = datetime.strptime(data['hora'], '%H:%M:%S').time()
                    except ValueError:
                        try:
                            task.hora = datetime.strptime(data['hora'], '%H:%M').time()
                        except ValueError:
                            return jsonify({'error': 'Formato de hora inválido'}), 400
                else:
                    task.hora = None
            
            if 'completada' in data:
                task.completada = bool(data['completada'])
            
            if 'prioridad' in data:
                prioridad = data['prioridad'].lower()
                if prioridad not in ['baja', 'media', 'alta']:
                    return jsonify({'error': 'Prioridad inválida'}), 400
                task.prioridad = prioridad
            
            if 'tipo' in data:
                tipo = data['tipo'].lower()
                if tipo not in ['diaria', 'semanal', 'personalizado']:
                    return jsonify({'error': 'Tipo inválido'}), 400
                task.tipo = tipo
            
            if 'color' in data:
                if data['color'] and not data['color'].startswith('#'):
                    return jsonify({'error': 'Formato de color inválido'}), 400
                if data['color'] and len(data['color']) not in [4, 7]:
                    return jsonify({'error': 'Formato de color inválido'}), 400
                task.color = data['color']
            
            # Actualizar subtareas
            if 'subtasks' in data:
                from models.subtask import Subtask
                
                # Eliminar subtareas existentes
                Subtask.query.filter_by(task_id=task.id).delete()
                
                # Crear nuevas subtareas
                for subtask_data in data['subtasks']:
                    if subtask_data.get('titulo'):
                        new_subtask = Subtask(
                            task_id=task.id,
                            titulo=subtask_data['titulo'].strip(),
                            completada=subtask_data.get('completada', False)
                        )
                        db.session.add(new_subtask)
            
            task.updated_at = datetime.now(timezone.utc)
            db.session.commit()
            
            return jsonify({
                'message': 'Tarea actualizada exitosamente',
                'task': task.to_dict()
            }), 200
            
        except SQLAlchemyError as e:
            db.session.rollback()
            return jsonify({'error': 'Error al actualizar tarea', 'details': str(e)}), 500
    
    @staticmethod
    def delete_task(task_id):
        """Eliminar una tarea"""
        try:
            task = db.session.get(Task, task_id)
            if not task:
                return jsonify({'error': 'Tarea no encontrada'}), 404
            
            db.session.delete(task)
            db.session.commit()
            
            return jsonify({'message': 'Tarea eliminada exitosamente'}), 200
            
        except SQLAlchemyError as e:
            db.session.rollback()
            return jsonify({'error': 'Error al eliminar tarea', 'details': str(e)}), 500
    
    @staticmethod
    def toggle_task(task_id):
        """Alternar el estado completada de una tarea"""
        try:
            task = db.session.get(Task, task_id)
            if not task:
                return jsonify({'error': 'Tarea no encontrada'}), 404
            
            task.completada = not task.completada
            task.updated_at = datetime.now(timezone.utc)
            db.session.commit()
            
            return jsonify({
                'message': 'Estado de tarea actualizado',
                'task': task.to_dict()
            }), 200
            
        except SQLAlchemyError as e:
            db.session.rollback()
            return jsonify({'error': 'Error al actualizar tarea', 'details': str(e)}), 500

    @staticmethod
    def toggle_subtask(task_id, subtask_id):
        """Alternar el estado completada de una subtarea"""
        try:
            from models.subtask import Subtask
            subtask = db.session.get(Subtask, subtask_id)
            
            if not subtask:
                return jsonify({'error': 'Subtarea no encontrada'}), 404
                
            if subtask.task_id != task_id:
                return jsonify({'error': 'La subtarea no pertenece a la tarea especificada'}), 400
            
            subtask.completada = not subtask.completada
            db.session.commit()
            
            return jsonify({
                'message': 'Estado de subtarea actualizado',
                'subtask': subtask.to_dict()
            }), 200
            
        except SQLAlchemyError as e:
            db.session.rollback()
            return jsonify({'error': 'Error al actualizar subtarea', 'details': str(e)}), 500