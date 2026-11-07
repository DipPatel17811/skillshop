@echo off
cd /d "%~dp0"
start "" http://localhost:8000
echo Skillshop is running at http://localhost:8000
echo Press Ctrl+C to stop the server.
python -m http.server 8000
