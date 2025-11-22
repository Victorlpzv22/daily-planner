#!/usr/bin/env python3
"""
Entry point for the Flask server when packaged with PyInstaller.
This script handles proper initialization and configuration for standalone execution.
"""
import sys
import os
from pathlib import Path

# Add src directory to Python path for imports
if getattr(sys, 'frozen', False):
    # Running as compiled executable
    application_path = sys._MEIPASS
else:
    # Running in normal Python environment
    application_path = os.path.dirname(os.path.abspath(__file__))

# Add src to path
src_path = os.path.join(application_path, 'src')
if src_path not in sys.path:
    sys.path.insert(0, src_path)

# Import and run the Flask app
from app import create_app

if __name__ == '__main__':
    app = create_app()
    
    print("\n" + "="*50)
    print("✅ Daily Planner Server (Standalone)")
    print("🚀 Servidor iniciado en http://127.0.0.1:5000")
    print("📡 CORS habilitado para http://localhost:3000")
    print("🔍 Health check: http://127.0.0.1:5000/api/health")
    print("="*50 + "\n")
    
    # Run without debug mode in production
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)