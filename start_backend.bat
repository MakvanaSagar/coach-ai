@echo off
cd backend
if not exist venv (
    py -m venv venv
)
call venv\Scripts\activate
py -m pip install -r requirements.txt
py main.py
pause
