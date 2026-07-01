@echo off
title KarieraLab Server
echo.
echo  Starting KarieraLab server...
echo.

:: Check if node_modules exists, install if not
if not exist "node_modules\" (
  echo  Installing dependencies...
  npm install
  echo.
)

:: Start server
node server.js

:: Keep window open if server crashes
pause
