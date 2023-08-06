from flask import Flask, request
from flask_cors import CORS
from simulate_keypress import press_key

app = Flask(__name__)
CORS(app)

@app.route('/keypress', methods=['POST'])
def handle_request():
    try:
        data = request.get_json()
        key = data['key']
        press_key(key)
        print(f"Received key from JavaScript: {key}")
        return 'Request handled successfully.'
    except Exception as e:
        return str(e), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080)
