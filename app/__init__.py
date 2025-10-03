from flask import Flask
from flask_socketio import SocketIO
import socket

# 🔍 Función para obtener la IP local del servidor, se crea aqui para que 
#todas las paginasl lo vean 
def obtener_ip_local():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip

socketio = SocketIO(cors_allowed_origins="*")  # o socketio = SocketIO(app)

def create_app():
    app = Flask(__name__)
    app.secret_key = 'tu_clave_secreta_segura'  # Necesaria para usar sesiones

    from .routes import main_bp
    from .api import api_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Inicializa socketio después de crear la app
    socketio.init_app(app)

    @app.context_processor
    def inject_ip_local():
        return {'ip_local': obtener_ip_local()}

    return app

import sys
import os

def resource_path(relative_path):
    """ Obtener ruta absoluta al recurso, funciona para dev y PyInstaller """
    try:
        # PyInstaller crea esta variable temporal
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)
