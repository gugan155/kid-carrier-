#!/usr/bin/env python3
"""
КарьераЛаб — Local server with Ani API proxy.
Serves static files and proxies /api/ani to Claude (key stays server-side).
Requires Python 3.x — no pip installs needed.
"""
import http.server
import urllib.request
import urllib.error
import json
import os

def load_env():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(env_path):
        with open(env_path, encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, _, val = line.partition('=')
                    os.environ.setdefault(key.strip(), val.strip())

load_env()
API_KEY = os.environ.get('GROQ_API_KEY', '')

GROQ_URL    = 'https://api.groq.com/openai/v1/chat/completions'
GROQ_MODEL  = 'llama-3.1-8b-instant'


class CareerLabHandler(http.server.SimpleHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/ani':
            self._proxy_ani()
        else:
            self.send_error(404)

    def _proxy_ani(self):
        if not API_KEY:
            self._json(503, {'error': {'message': 'GROQ_API_KEY not set. Get a free key at console.groq.com and add it to .env'}})
            return

        length = int(self.headers.get('Content-Length', 0))
        payload = json.loads(self.rfile.read(length))

        # Convert from Anthropic format to Groq/OpenAI format
        messages = []
        if payload.get('system'):
            messages.append({'role': 'system', 'content': payload['system']})
        messages.extend(payload.get('messages', []))

        groq_body = json.dumps({
            'model': GROQ_MODEL,
            'max_tokens': payload.get('max_tokens', 300),
            'messages': messages,
            'temperature': 0.7,
        }).encode()

        req = urllib.request.Request(
            GROQ_URL,
            data=groq_body,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {API_KEY}',
                'User-Agent': 'CareerLab/1.0',
            },
            method='POST'
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                groq_data = json.loads(resp.read())
                text = groq_data['choices'][0]['message']['content']
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
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:8000')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def log_message(self, fmt, *args):
        pass  # quiet — only errors will print


if __name__ == '__main__':
    PORT = 8000
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    print()
    print('  ================================================')
    print('    KareerLab — server started!')
    print('  ================================================')
    print()
    print(f'  Browser: http://localhost:{PORT}')
    print()
    print(f'  Ani chat proxy: {"ACTIVE (Groq free)" if API_KEY else "DISABLED — get free key at console.groq.com and add GROQ_API_KEY to .env"}')
    print()
    print('  Press Ctrl+C to stop.')
    print()

    with http.server.HTTPServer(('', PORT), CareerLabHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\n  Server stopped.')
