from flask import Blueprint
from controllers.task_controller import TaskController

task_bp = Blueprint('tasks', __name__)

# CRUD básico
task_bp.route('/', methods=['GET'])(TaskController.get_all_tasks)
task_bp.route('/<int:task_id>', methods=['GET'])(TaskController.get_task_by_id)
task_bp.route('/', methods=['POST'])(TaskController.create_task)
task_bp.route('/<int:task_id>', methods=['PUT'])(TaskController.update_task)
task_bp.route('/<int:task_id>', methods=['DELETE'])(TaskController.delete_task)

# Rutas adicionales
task_bp.route('/<int:task_id>/toggle', methods=['PATCH'])(TaskController.toggle_task_completion)
task_bp.route('/date/<string:fecha_str>', methods=['GET'])(TaskController.get_tasks_by_date)
task_bp.route('/pending', methods=['GET'])(TaskController.get_pending_tasks)