@echo off
echo ================================================
echo   KareerLab - Local Server
echo ================================================
echo.

:: Check for .env file
if not exist .env (
    echo [WARNING] .env file not found!
    echo Copy .env.example to .env and add your free GROQ_API_KEY
    echo Get a free key at: https://console.groq.com/keys
    echo Ani chat will not work without it.
    echo.
)

:: Try Python 3 first (server.py handles static files + Ani proxy)
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting server with Python...
    echo Open: http://localhost:8000
    echo Press Ctrl+C to stop.
    echo.
    python server.py
    goto end
)

:: Try Python launcher
py --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting server with Python...
    echo Open: http://localhost:8000
    echo Press Ctrl+C to stop.
    echo.
    py server.py
    goto end
)

:: Try Node.js fallback
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting server with Node.js...
    npm install --silent
    echo Open: http://localhost:8000
    echo Press Ctrl+C to stop.
    echo.
    node server.js
    goto end
)

echo ERROR: Python and Node.js not found.
echo Install Python from: https://www.python.org/downloads/
echo.
pause

:end
