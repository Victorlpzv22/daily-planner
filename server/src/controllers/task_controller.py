from flask import request, jsonify
from models.task import Task
from database.db import db
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, date, time

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
            task = Task.query.get(task_id)
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
            
            # Crear tarea
            new_task = Task(
                titulo=data['titulo'].strip(),
                descripcion=data.get('descripcion', '').strip() if data.get('descripcion') else None,
                fecha_inicio=fecha_inicio_obj,
                fecha_fin=fecha_fin_obj,
                hora=hora_obj,
                completada=data.get('completada', False),
                prioridad=prioridad,
                tipo=tipo,
                color=color
            )
            
            db.session.add(new_task)
            db.session.commit()
            
            return jsonify({
                'message': 'Tarea creada exitosamente',
                'task': new_task.to_dict()
            }), 201
            
        except SQLAlchemyError as e:
            db.session.rollback()
            return jsonify({'error': 'Error al crear tarea', 'details': str(e)}), 500
    
    @staticmethod
    def update_task(task_id):
        """Actualizar una tarea existente"""
        try:
            task = Task.query.get(task_id)
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
            
            task.updated_at = datetime.utcnow()
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
            task = Task.query.get(task_id)
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
            task = Task.query.get(task_id)
            if not task:
                return jsonify({'error': 'Tarea no encontrada'}), 404
            
            task.completada = not task.completada
            task.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                'message': 'Estado de tarea actualizado',
                'task': task.to_dict()
            }), 200
            
        except SQLAlchemyError as e:
            db.session.rollback()
            return jsonify({'error': 'Error al actualizar tarea', 'details': str(e)}), 500