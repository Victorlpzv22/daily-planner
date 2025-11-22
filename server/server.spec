# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec file for Daily Planner Flask Server
This configuration packages the Flask server as a standalone executable.
"""

import sys
from pathlib import Path

block_cipher = None

# Define paths
server_dir = Path('.').absolute()
src_dir = server_dir / 'src'

# Collect all Python files from src and its subdirectories
def get_all_py_files(directory):
    """Recursively get all .py files from a directory"""
    py_files = []
    for path in Path(directory).rglob('*.py'):
        if '__pycache__' not in str(path):
            py_files.append(str(path))
    return py_files

# Get all source files
src_files = get_all_py_files(src_dir)

# Analysis: what to include
a = Analysis(
    ['start_server.py'],
    pathex=[str(server_dir), str(src_dir)],
    binaries=[],
    datas=[
        # Include all source files as data
        (str(src_dir), 'src'),
        (str(server_dir / 'migrations'), 'migrations'),
    ],
    hiddenimports=[
        'flask',
        'flask_cors',
        'flask_migrate',
        'flask_sqlalchemy',
        'sqlalchemy',
        'sqlalchemy.ext.declarative',
        'sqlalchemy.orm',
        'werkzeug',
        'werkzeug.security',
        'jinja2',
        'click',
        'itsdangerous',
        'markupsafe',
        'dateutil',
        'dateutil.rrule',
        'dateutil.parser',
        # Import all our modules
        'database',
        'database.db',
        'models',
        'models.task',
        'routes',
        'routes.task_routes',
        'controllers',
        'controllers.task_controller',
        'utils',
        'utils.recurrence',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'pytest',
        'unittest',
        'test',
        'tests',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

# PYZ: Python zip archive
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

# EXE: Executable
exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='daily-planner-server',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,  # Show console for server logs
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
