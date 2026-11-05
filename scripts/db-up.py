"""Start only the local development DB, without logging credentials."""
import os
import pathlib
import subprocess
import urllib.parse

settings = dict(
    line.split('=', 1) for line in pathlib.Path('.env').read_text().splitlines()
    if '=' in line and not line.startswith('#')
)
url = urllib.parse.urlparse(os.environ.get('DATABASE_URL') or settings['DATABASE_URL'])
if url.hostname not in ('localhost', '127.0.0.1') or url.username != 'offgrid' or url.path != '/offgrid':
    raise SystemExit('Este helper só inicia o banco local offgrid. Para banco externo, use DATABASE_URL diretamente.')
password = urllib.parse.unquote(url.password or '')
if not password or password == 'SUBSTITUA_POR_SENHA_ALEATORIA':
    raise SystemExit('Configure uma senha aleatória antes de iniciar o banco.')
runtime_env = {**os.environ, 'POSTGRES_PASSWORD': password}
for selector in ['DOCKER_HOST', 'DOCKER_CONTEXT', 'DOCKER_TLS', 'DOCKER_TLS_VERIFY', 'DOCKER_CERT_PATH']:
    runtime_env.pop(selector, None)
subprocess.run(
    ['docker', '--host=unix:///var/run/docker.sock', 'compose', 'up', '-d', '--wait', 'db'],
    env=runtime_env, check=True,
)
