#!/usr/bin/env python3
"""
Build script for creating a standalone executable of the Flask server.
Uses PyInstaller to package the server and all dependencies.
"""
import os
import sys
import shutil
import subprocess
from pathlib import Path

def main():
    """Build the Flask server as a standalone executable"""
    
    # Get paths
    server_dir = Path(__file__).parent.absolute()
    dist_dir = server_dir / 'dist'
    build_dir = server_dir / 'build'
    spec_file = server_dir / 'server.spec'
    
    print("="*60)
    print("🔨 Building Daily Planner Server")
    print("="*60)
    print(f"📂 Server directory: {server_dir}")
    print(f"📄 Spec file: {spec_file}")
    print()
    
    # Check if spec file exists
    if not spec_file.exists():
        print("❌ Error: server.spec not found!")
        print(f"   Expected at: {spec_file}")
        sys.exit(1)
    
    # Clean previous builds
    print("🧹 Cleaning previous builds...")
    if dist_dir.exists():
        shutil.rmtree(dist_dir)
        print(f"   Removed: {dist_dir}")
    if build_dir.exists():
        shutil.rmtree(build_dir)
        print(f"   Removed: {build_dir}")
    print()
    
    # Run PyInstaller
    print("🚀 Running PyInstaller...")
    print("-" * 60)
    
    try:
        result = subprocess.run(
            ['pyinstaller', '--clean', str(spec_file)],
            cwd=server_dir,
            check=True,
            capture_output=False
        )
        
        print("-" * 60)
        print()
        
        # Check if executable was created
        executable_name = 'daily-planner-server'
        if sys.platform == 'win32':
            executable_name += '.exe'
        
        executable_path = dist_dir / executable_name
        
        if executable_path.exists():
            file_size = executable_path.stat().st_size / (1024 * 1024)  # MB
            print("✅ Build successful!")
            print()
            print(f"📦 Executable created: {executable_path}")
            print(f"📊 Size: {file_size:.2f} MB")
            print()
            print("🧪 Testing executable...")
            print("-" * 60)
            
            # Test the executable (run for 3 seconds then kill)
            test_process = subprocess.Popen(
                [str(executable_path)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            try:
                # Wait a bit to see if it starts
                stdout, stderr = test_process.communicate(timeout=3)
                print(stdout)
                if stderr:
                    print("Stderr:", stderr)
            except subprocess.TimeoutExpired:
                # This is expected - server runs indefinitely
                test_process.terminate()
                test_process.wait()
                print("✅ Server started successfully (terminated after test)")
            
            print("-" * 60)
            print()
            print("✨ Build complete!")
            print()
            print("Next steps:")
            print("1. Test the executable manually:")
            print(f"   {executable_path}")
            print("2. The executable will be included in the Electron app")
            print()
            
        else:
            print("❌ Error: Executable not found after build!")
            print(f"   Expected at: {executable_path}")
            sys.exit(1)
            
    except subprocess.CalledProcessError as e:
        print()
        print("❌ Build failed!")
        print(f"   Error: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print()
        print("❌ PyInstaller not found!")
        print("   Please install it: pip install pyinstaller")
        sys.exit(1)

if __name__ == '__main__':
    main()
