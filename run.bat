@echo off
setlocal enabledelayedexpansion

for /f "usebackq eol=# tokens=1,* delims==" %%A in (".env") do (
    if not "%%A"=="" set "%%A=%%B"
)

echo Iniciando Backend.....
start "Hackatec - Backend" cmd /k "cd "%BackendDir%" && npm run dev"

timeout /t 3 /nobreak >nul

echo Iniciando Frontend.....
start "Hackatec - Frontend" cmd /k "cd "%FrontendDir%" && npm run dev"

endlocal