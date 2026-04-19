import os

from flask import Flask, send_from_directory

app = Flask(__name__)


@app.route('/healthz')
def healthz():
    return {'status': 'ok'}, 200

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/script.js')
def script():
    return send_from_directory('static', 'script.js')

@app.route('/style.css')
def style():
    return send_from_directory('static', 'style.css')

if __name__ == '__main__':
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', '5000'))
    debug = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(debug=debug, host=host, port=port)

