import requests
import json
from datetime import date, timedelta

BASE_URL = 'http://localhost:5000/api/tasks'

def test_create_task_with_subtasks():
    print("\nTesting create task with subtasks...")
    today = date.today().isoformat()
    payload = {
        'titulo': 'Task with Subtasks',
        'descripcion': 'Testing subtasks creation',
        'fecha_inicio': today,
        'fecha_fin': today,
        'subtasks': [
            {'titulo': 'Subtask 1'},
            {'titulo': 'Subtask 2', 'completada': True}
        ]
    }
    
    response = requests.post(BASE_URL, json=payload)
    if response.status_code == 201:
        data = response.json()
        task = data['task']
        print(f"✓ Task created with ID: {task['id']}")
        
        if len(task['subtasks']) == 2:
            print("✓ Correct number of subtasks")
            print(f"  - Subtask 1: {task['subtasks'][0]['titulo']} (Completed: {task['subtasks'][0]['completada']})")
            print(f"  - Subtask 2: {task['subtasks'][1]['titulo']} (Completed: {task['subtasks'][1]['completada']})")
            return task['id'], task['subtasks'][0]['id']
        else:
            print(f"✗ Incorrect number of subtasks: {len(task['subtasks'])}")
    else:
        print(f"✗ Failed to create task: {response.text}")
    return None, None

def test_toggle_subtask(task_id, subtask_id):
    print(f"\nTesting toggle subtask {subtask_id} for task {task_id}...")
    url = f"{BASE_URL}/{task_id}/subtasks/{subtask_id}/toggle"
    response = requests.patch(url)
    
    if response.status_code == 200:
        data = response.json()
        subtask = data['subtask']
        print(f"✓ Subtask toggled. New status: {subtask['completada']}")
    else:
        print(f"✗ Failed to toggle subtask: {response.text}")

def test_update_task_subtasks(task_id):
    print(f"\nTesting update task subtasks for task {task_id}...")
    payload = {
        'subtasks': [
            {'titulo': 'Updated Subtask 1', 'completada': True},
            {'titulo': 'New Subtask 3'}
        ]
    }
    
    response = requests.put(f"{BASE_URL}/{task_id}", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        task = data['task']
        print("✓ Task updated")
        if len(task['subtasks']) == 2:
             print("✓ Correct number of subtasks after update")
             for st in task['subtasks']:
                 print(f"  - {st['titulo']} ({st['completada']})")
        else:
             print(f"✗ Incorrect number of subtasks after update: {len(task['subtasks'])}")
    else:
        print(f"✗ Failed to update task: {response.text}")

def main():
    try:
        task_id, subtask_id = test_create_task_with_subtasks()
        if task_id and subtask_id:
            test_toggle_subtask(task_id, subtask_id)
            test_update_task_subtasks(task_id)
            
            # Cleanup
            print(f"\nCleaning up task {task_id}...")
            requests.delete(f"{BASE_URL}/{task_id}")
            print("✓ Task deleted")
            
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == '__main__':
    main()
