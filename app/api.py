import os
import json
import uuid
from flask import Blueprint, request, jsonify, current_app, url_for
from app import socketio  # ✅ Importa la instancia real desde __init__.py

import sys

api_bp = Blueprint('api', __name__)



def resource_path(relative_path):
    """
    Obtiene la ruta absoluta a un recurso, incluso cuando el script está empaquetado con PyInstaller.
    """
    try:
        # PyInstaller crea una carpeta temporal y almacena el path en _MEIPASS
        base_path = sys._MEIPASS
    except AttributeError:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)

EQUIPOS_FILE = resource_path('equipos.json')
UPLOAD_FOLDER = resource_path('app/static/uploads')

def leer_equipos():
    if not os.path.exists(EQUIPOS_FILE):
        return []
    with open(EQUIPOS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def guardar_equipos(equipos):
    with open(EQUIPOS_FILE, 'w', encoding='utf-8') as f:
        json.dump(equipos, f, indent=2, ensure_ascii=False)

# 📢 Emitir actualización por SocketIO
def emitir_actualizacion(mensaje='Cambio realizado'):
    print("Emitir actualización:", mensaje)
    socketio.emit('actualizar', {'mensaje': mensaje})

# 🟢 GET /api/equipos
@api_bp.route('/equipos', methods=['GET'])
def obtener_equipos():
    equipos = leer_equipos()
    return jsonify(equipos)

# 🟡 POST /api/equipos
@api_bp.route('/equipos', methods=['POST'])
def crear_equipo():
    equipos = leer_equipos()

    nombre = request.form.get('nombre')
    imagen = request.files.get('imagen')

    if not nombre:
        return jsonify({'error': 'El nombre es requerido'}), 400

    # Validar que no exista otro equipo con el mismo nombre (case insensitive)
    if any(e['nombre'].lower() == nombre.lower() for e in equipos):
        return jsonify({'error': 'Ya existe un equipo con ese nombre'}), 400
    
    equipo_id = str(uuid.uuid4())
    filename = None

    if imagen:
        ext = os.path.splitext(imagen.filename)[1]
        filename = f"{equipo_id}{ext}"
        ruta_guardado = os.path.join(UPLOAD_FOLDER, filename)
        # Asegurarse que la carpeta exista
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        imagen.save(ruta_guardado)

    nuevo_equipo = {
        'id': equipo_id,
        'nombre': nombre,
        'imagen': url_for('static', filename=f'uploads/{filename}') if filename else None,
        'areas': {}  # Inicializamos calificaciones vacías
    }

    equipos.append(nuevo_equipo)
    guardar_equipos(equipos)
    emitir_actualizacion('Equipo guardado')

    return jsonify(nuevo_equipo), 201


# 🔵 PUT /api/equipos/<id> - actualizar calificaciones
@api_bp.route('/equipos/<equipo_id>', methods=['PUT'])
def actualizar_equipo(equipo_id):
    equipos = leer_equipos()
    equipo = next((e for e in equipos if e['id'] == equipo_id), None)

    if not equipo:
        return jsonify({'error': 'Equipo no encontrado'}), 404

    # Si viene JSON (actualización de calificaciones)
    if request.is_json:
        data = request.get_json()
        equipo['areas'] = data.get('areas', {})
        guardar_equipos(equipos)
        
        emitir_actualizacion('📝 Equipo calificado')
        return jsonify({'mensaje': 'Calificaciones actualizadas'}), 200

    # Si viene FormData (actualización de nombre/imagen)
    nombre = request.form.get('nombre')
    imagen = request.files.get('imagen')

    if nombre:
        equipo['nombre'] = nombre

    if imagen:
        ext = os.path.splitext(imagen.filename)[1]
        filename = f"{equipo_id}{ext}"
        ruta_guardado = os.path.join(UPLOAD_FOLDER, filename)
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        imagen.save(ruta_guardado)
        equipo['imagen'] = url_for('static', filename=f'uploads/{filename}')

    guardar_equipos(equipos)
    emitir_actualizacion('📝 Equipo editado')
    return jsonify({'mensaje': 'Equipo actualizado'}), 200

@api_bp.route('/equipos/<equipo_id>', methods=['DELETE'])
def eliminar_equipo(equipo_id):
    equipos = leer_equipos()
    equipo = next((e for e in equipos if e['id'] == equipo_id), None)

    if not equipo:
        return jsonify({'error': 'Equipo no encontrado'}), 404

    # Eliminar imagen del disco si existe
    if equipo.get('imagen'):
        # imagen tiene URL tipo /static/uploads/filename.ext
        filename = equipo['imagen'].split('/')[-1]
        ruta_imagen = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.exists(ruta_imagen):
            os.remove(ruta_imagen)

    equipos = [e for e in equipos if e['id'] != equipo_id]
    guardar_equipos(equipos)
    emitir_actualizacion('Equipo Eliminado')
    return jsonify({'mensaje': 'Equipo eliminado'})

