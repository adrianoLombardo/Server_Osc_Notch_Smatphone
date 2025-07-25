@echo off
:: ============================================
::  avvia-server.bat  –  Launcher portatile
::  (cartella da doppio clic)
::
::  • Se manca config.env chiede i 5 parametri
::  • Usa Node portatile in node-v18.19.0-win-x64
::  • Avvia start.cjs e lascia aperta la finestra
:: ============================================

rem — spostati nella cartella dove risiede questo .bat
cd /d "%~dp0"

rem — percorso al Node portatile
set "NODE_EXEC=node-v18.19.0-win-x64\node.exe"

if not exist "%NODE_EXEC%" (
  echo ERRORE: non trovo %NODE_EXEC%
  echo Copia la cartella node-v18.19.0-win-x64 accanto a questo file.
  pause
  exit /b
)

if not exist "config.env" (
  echo --------------
  echo  Configurazione iniziale
  echo (premi INVIO per accettare il valore di default)
  echo --------------

  set /p host=IP macchina Notch [127.0.0.1]:
  set /p port=Porta OSC Notch   [8000]:
  set /p http=Porta Web (HTTP)  [3001]:
  set /p slot=Numero slot testo [50]:
  set /p pubh=IP pubblico QR (vuoto = auto):

  if "%host%"=="" set host=127.0.0.1
  if "%port%"=="" set port=8000
  if "%http%"=="" set http=3001
  if "%slot%"=="" set slot=50

  (
    echo NOTCH_HOST=%host%
    echo NOTCH_PORT=%port%
    echo HTTP_PORT=%http%
    echo MAX_STREAMS=%slot%
    echo PUBLIC_HOST=%pubh%
  )>config.env

  echo --------------
  echo  Parametri salvati in config.env
  echo --------------
)

echo.
echo ===== Avvio server =====
"%NODE_EXEC%" start.cjs
echo.
pause
