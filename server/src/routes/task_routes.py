from flask import Blueprint
from controllers.task_controller import TaskController

task_bp = Blueprint('task', __name__)

# Obtener todas las tareas
@task_bp.route('/', methods=['GET'])
@task_bp.route('', methods=['GET'])  # Sin slash también
def get_all_tasks():
    return TaskController.get_all_tasks()

# Obtener una tarea por ID
@task_bp.route('/<int:task_id>', methods=['GET'])
def get_task(task_id):
    return TaskController.get_task(task_id)

# Crear una nueva tarea
@task_bp.route('/', methods=['POST'])
@task_bp.route('', methods=['POST'])  # Sin slash también
def create_task():
    return TaskController.create_task()

# Actualizar una tarea
@task_bp.route('/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    return TaskController.update_task(task_id)

# Eliminar una tarea
@task_bp.route('/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    return TaskController.delete_task(task_id)

# Alternar estado completada
@task_bp.route('/<int:task_id>/toggle', methods=['PATCH'])
def toggle_task(task_id):
    return TaskController.toggle_task(task_id)

# Alternar estado completada de una subtarea
@task_bp.route('/<int:task_id>/subtasks/<int:subtask_id>/toggle', methods=['PATCH'])
def toggle_subtask(task_id, subtask_id):
    return TaskController.toggle_subtask(task_id, subtask_id)