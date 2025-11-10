from flask import jsonify, request
from database.db import db
from models.task import Task
from datetime import datetime, date, time
from sqlalchemy.exc import SQLAlchemyError

class TaskController:
    
    @staticmethod
    def get_all_tasks():
        """Obtener todas las tareas"""
        try:
            tasks = Task.query.order_by(Task.fecha.desc(), Task.hora.desc()).all()
            return jsonify([task.to_dict() for task in tasks]), 200
        except SQLAlchemyError as e:
            return jsonify({'error': 'Error al obtener tareas', 'details': str(e)}), 500
    
    @staticmethod
    def get_task_by_id(task_id):
        """Obtener una tarea específica"""
        try:
            task = Task.query.get(task_id)
            if not task:
                return jsonify({'error': 'Tarea no encontrada'}), 404
            return jsonify(task.to_dict()), 200
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
            
            if 'fecha' not in data:
                return jsonify({'error': 'La fecha es obligatoria'}), 400
            
            # Parsear fecha
            try:
                fecha_obj = datetime.strptime(data['fecha'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}), 400
            
            # Parsear hora (opcional)
            hora_obj = None
            if 'hora' in data and data['hora']:
                try:
                    hora_obj = datetime.strptime(data['hora'], '%H:%M:%S').time()
                except ValueError:
                    try:
                        hora_obj = datetime.strptime(data['hora'], '%H:%M').time()
                    except ValueError:
                        return jsonify({'error': 'Formato de hora inválido. Use HH:MM o HH:MM:SS'}), 400
            
            # Validar prioridad
            prioridad = data.get('prioridad', 'media').lower()
            if prioridad not in ['alta', 'media', 'baja']:
                return jsonify({'error': 'Prioridad inválida. Use: alta, media o baja'}), 400
            
            # Validar tipo
            tipo = data.get('tipo', 'diaria').lower()
            if tipo not in ['diaria', 'semanal']:
                return jsonify({'error': 'Tipo inválido. Use: diaria o semanal'}), 400
            
            # Crear tarea
            new_task = Task(
                titulo=data['titulo'].strip(),
                descripcion=data.get('descripcion', '').strip() if data.get('descripcion') else None,
                fecha=fecha_obj,
                hora=hora_obj,
                completada=data.get('completada', False),
                prioridad=prioridad,
                tipo=tipo
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
            
            # Actualizar campos si están presentes
            if 'titulo' in data:
                if not data['titulo'].strip():
                    return jsonify({'error': 'El título no puede estar vacío'}), 400
                task.titulo = data['titulo'].strip()
            
            if 'descripcion' in data:
                task.descripcion = data['descripcion'].strip() if data['descripcion'] else None
            
            if 'fecha' in data:
                try:
                    task.fecha = datetime.strptime(data['fecha'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}), 400
            
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
                if prioridad not in ['alta', 'media', 'baja']:
                    return jsonify({'error': 'Prioridad inválida'}), 400
                task.prioridad = prioridad
            
            if 'tipo' in data:
                tipo = data['tipo'].lower()
                if tipo not in ['diaria', 'semanal']:
                    return jsonify({'error': 'Tipo inválido'}), 400
                task.tipo = tipo
            
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
    def toggle_task_completion(task_id):
        """Marcar/desmarcar tarea como completada"""
        try:
            task = Task.query.get(task_id)
            if not task:
                return jsonify({'error': 'Tarea no encontrada'}), 404
            
            task.completada = not task.completada
            task.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                'message': f'Tarea marcada como {"completada" if task.completada else "pendiente"}',
                'task': task.to_dict()
            }), 200
            
        except SQLAlchemyError as e:
            db.session.rollback()
            return jsonify({'error': 'Error al actualizar tarea', 'details': str(e)}), 500
    
    @staticmethod
    def get_tasks_by_date(fecha_str):
        """Obtener tareas de una fecha específica"""
        try:
            fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
            tasks = Task.query.filter_by(fecha=fecha).order_by(Task.hora).all()
            return jsonify([task.to_dict() for task in tasks]), 200
        except ValueError:
            return jsonify({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}), 400
        except SQLAlchemyError as e:
            return jsonify({'error': 'Error al obtener tareas', 'details': str(e)}), 500
    
    @staticmethod
    def get_pending_tasks():
        """Obtener tareas pendientes"""
        try:
            tasks = Task.query.filter_by(completada=False).order_by(Task.fecha, Task.hora).all()
            return jsonify([task.to_dict() for task in tasks]), 200
        except SQLAlchemyError as e:
            return jsonify({'error': 'Error al obtener tareas', 'details': str(e)}), 500