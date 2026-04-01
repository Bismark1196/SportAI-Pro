@echo off
echo =====================================================
echo   SportAI Pro — Starting Backend Server
echo =====================================================
echo.

cd /d "%~dp0backend"

:: Check if .env exists
if not exist ".env" (
    echo [SETUP] Creating .env from template...
    copy .env.example .env >nul
    echo [SETUP] .env created. Edit backend\.env to add your API keys.
    echo.
)

:: Install dependencies if needed
echo [SETUP] Checking dependencies...
pip install -r requirements.txt -q

echo.
echo [OK] Starting Flask server on http://localhost:5000
echo [OK] Open index.html in your browser to use the app
echo [OK] Demo login: john / password123
echo.
echo Press Ctrl+C to stop the server
echo.

python app.py

pause