"""
Direct Python launcher for PollyGlot (Windows compatibility)
Run this file directly if uvicorn command is not available
"""
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    try:
        import uvicorn
        from app.main import app
        
        print("Starting PollyGlot development server...")
        print("Open http://localhost:8000 in your browser")
        print("Press Ctrl+C to stop the server")
        
        uvicorn.run(
            app, 
            host="127.0.0.1", 
            port=8000, 
            reload=True
        )
    except ImportError as e:
        print(f"Error: {e}")
        print("Please install required dependencies:")
        print("pip install fastapi uvicorn[standard]")
    except Exception as e:
        print(f"Error starting server: {e}")