# import os

# # Forzar a eventlet a usar un hub compatible
# os.environ["EVENTLET_HUB"] = "select"  # el hub 'select' es compatible en Windows


import eventlet
eventlet.monkey_patch()

from app import create_app, socketio

import threading
import webbrowser
import time

app = create_app()

def abrir_navegador():
    time.sleep(2)  # Espera 2 segundos
    webbrowser.open('http://127.0.0.1:5000')

if __name__ == "__main__":
    # threading.Thread(target=abrir_navegador).start()
    socketio.run(app, host='127.0.0.1', port=5000, debug=False)
