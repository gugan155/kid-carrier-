from http.server import BaseHTTPRequestHandler
import json
import urllib.request
import urllib.error
import os

GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions'
GROQ_MODEL = 'llama-3.1-8b-instant'
API_KEY    = os.environ.get('GROQ_API_KEY', '')


class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        if not API_KEY:
            self._json(503, {'error': {'message': 'GROQ_API_KEY not configured on server.'}})
            return

        length  = int(self.headers.get('Content-Length', 0))
        payload = json.loads(self.rfile.read(length))

        messages = []
        if payload.get('system'):
            messages.append({'role': 'system', 'content': payload['system']})
        messages.extend(payload.get('messages', []))

        body = json.dumps({
            'model': GROQ_MODEL,
            'max_tokens': payload.get('max_tokens', 300),
            'messages': messages,
            'temperature': 0.7,
        }).encode()

        req = urllib.request.Request(
            GROQ_URL,
            data=body,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {API_KEY}',
                'User-Agent': 'CareerLab/1.0',
            },
            method='POST'
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read())
                text = data['choices'][0]['message']['content']
                self._json(200, {'content': [{'type': 'text', 'text': text}]})
        except urllib.error.HTTPError as e:
            raw = e.read()
            try:
                err = json.loads(raw)
            except Exception:
                err = {'message': f'Groq error {e.code}: {e.reason}'}
            self._json(e.code, {'error': err.get('error', err)})
        except Exception as e:
            self._json(500, {'error': {'message': str(e)}})

    def _json(self, code, data):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def log_message(self, fmt, *args):
        pass
