@echo off
:: Check for admin rights
net session >nul 2>&1
if %errorLevel% == 0 (
    echo 127.0.0.1    edusphere >> %SystemRoot%\System32\drivers\etc\hosts
    echo Done! edusphere added to hosts file.
    pause
) else (
    echo Requesting Administrator privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
)
