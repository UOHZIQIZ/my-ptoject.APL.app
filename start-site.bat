@echo off
REM Traveler's Diary - start a local web server (Windows)
REM YouTube music only plays when the site is opened from a web address.
cd /d "%~dp0"
start "" http://localhost:8000/index.html
where python >nul 2>nul && (python -m http.server 8000 & goto :eof)
where py >nul 2>nul && (py -m http.server 8000 & goto :eof)
echo Python was not found. Install it from https://www.python.org/ and run this file again.
pause
