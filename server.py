from flask import Flask, send_from_directory

app = Flask(__name__)

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
    app.run(debug=False, host='0.0.0.0', port=5000)

