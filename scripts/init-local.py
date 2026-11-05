"""Create development settings once, without overwriting configuration or logging secrets."""
import os
import pathlib
import secrets

path = pathlib.Path('.env')
try:
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
except FileExistsError:
    print('.env existente preservado.')
else:
    with os.fdopen(fd, 'w') as stream:
        password = secrets.token_hex(24)
        stream.write(
            f'DATABASE_URL=postgresql://offgrid:{password}@127.0.0.1:5432/offgrid\n'
            'APP_URL=http://localhost:3000\nCOOKIE_SECURE=false\n'
        )
    print('Configuração local criada; nenhum segredo exibido.')
