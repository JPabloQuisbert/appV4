from flask import Blueprint, render_template, redirect, url_for, session, request

main_bp = Blueprint('main', __name__)

PASSWORD_CORRECTO = 'admin123'  # puedes mover esto a config.py

@main_bp.route('/')
def index():
    return render_template('index.html')

@main_bp.route('/registro')
def registro():
    if not session.get('autenticado'):
        return redirect(url_for('main.ingresar_password', next='registro'))
    return render_template('registro.html')

@main_bp.route('/calificar')
def calificar():
    if not session.get('autenticado'):
        return redirect(url_for('main.ingresar_password', next='calificar'))
    return render_template('calificar.html')

@main_bp.route('/graficos')
def graficos():
    return render_template('graficos.html')

@main_bp.route('/posiciones')
def posiciones():
    return render_template('posiciones.html')

@main_bp.route('/login', methods=['GET', 'POST'])
def ingresar_password():
    if request.method == 'POST':
        pw = request.form.get('password')
        next_page = request.form.get('next', 'index')
        if pw == PASSWORD_CORRECTO:
            session['autenticado'] = True
            return redirect(url_for(f'main.{next_page}'))
        else:
            return render_template('login.html', error="❌ Contraseña incorrecta", next=next_page)

    next_page = request.args.get('next', 'index')
    return render_template('login.html', next=next_page)

@main_bp.route('/logout')
def logout():
    session.pop('autenticado', None)
    return redirect(url_for('main.index'))

