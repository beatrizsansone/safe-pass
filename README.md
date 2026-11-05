# OFFGRID Workspace

Aplicação em português para gestão B2B de experiências wellness. Esta entrega implementa a fundação e um primeiro fluxo de CRM/projetos persistente. Não representa as sete fases completas: veja [o roadmap](docs/ROADMAP.md).

## Requisitos

- Node.js 24 LTS e npm 11.
- PostgreSQL 17; Docker para o banco local, ou um PostgreSQL administrado externamente.
- Chromium em `/usr/bin/chromium` para os testes E2E; alternativamente defina `CHROMIUM_PATH`.

## Executar

```bash
npm ci
python scripts/init-local.py
# Cria .env local com senha aleatória; não sobrescreve uma configuração existente.
# Para configurações externas, use .env.example como referência.
python scripts/db-up.py
npm run db:generate
npm run db:deploy
```

O helper Docker lê a senha do banco local em `.env`, sem exibi-la, e usa um volume persistente. Não execute `docker compose down -v`: isso remove os dados. Para banco remoto, não use o helper Docker; configure `DATABASE_URL` diretamente com TLS validado.

Crie o primeiro sócio sem gravar sua senha em comandos ou arquivos versionados:

```bash
read -r -p 'E-mail do administrador: ' ADMIN_EMAIL
read -r -s -p 'Senha (mínimo 12 caracteres): ' ADMIN_PASSWORD
export ADMIN_EMAIL ADMIN_PASSWORD
npm run admin:create
unset ADMIN_EMAIL ADMIN_PASSWORD
npm run dev
```

Acesse a porta 3000. Não existe usuário ou senha padrão. O cadastro administrativo não sobrescreve usuários existentes. É possível iniciar com banco vazio; as métricas começam em zero. Os testes criam seus próprios registros isolados e os removem ao terminar normalmente.

## Fluxo disponível

1. Entre como sócio; cadastre marcas e contatos.
2. Crie oportunidades no CRM e mova-as entre as 12 etapas. Lista e Kanban usam os mesmos registros.
3. Registre reuniões (horário de Brasília) e briefings com status, referências e rascunhos.
4. Cadastre projetos e tarefas, atualize seus status e acompanhe o dashboard.
5. Crie usuários em Configurações. Sócios atribuem membros e gestores aos projetos.

Gestores visualizam apenas marcas sob sua responsabilidade e projetos atribuídos. Membros e freelancers só visualizam os projetos aos quais foram adicionados. A atualização das tarefas exige um gestor autorizado. Clientes podem autenticar, mas não recebem dados internos: o portal compartilhado ainda não está implementado.

## Verificação

```bash
npm run typecheck
npm test
npm run test:e2e
npm run build
npm audit --omit=dev
```

E2E usa PostgreSQL real e um servidor de desenvolvimento temporário na porta 3000. Execute em banco de desenvolvimento ou de testes, nunca em produção. Para ambiente isolado, configure `DATABASE_URL` antes da execução e aplique as migrations nele. O teste valida persistência após recarregar, isolamento por perfil, URL direta não autorizada, recuperação por token único e viewport móvel. O envio por SMTP não é simulado como entrega real.

## Banco e geração

`npm run db:generate` usa os pacotes oficiais do Prisma, com versões exatas, para gerar o cliente via WASM. Evita a dependência do download nativo bloqueado neste ambiente. O helper utiliza APIs internas do gerador: atualizações do Prisma exigem validar esse script. O runtime usa o adaptador oficial `@prisma/adapter-pg`.

`npm run db:deploy` aplica migrations SQL versionadas com transação, lock consultivo e checksum em `offgrid_migrations`. A segunda execução não altera o esquema. **Não misture esse histórico com `prisma migrate deploy` ou `prisma db push`.** Novas migrations devem ser incrementais, revisadas e adicionadas em novos diretórios. Veja [DATABASE.md](docs/DATABASE.md).

## E-mail e recuperação

Configure `SMTP_URL`, `MAIL_FROM` e `APP_URL` antes de habilitar recuperação para usuários reais. Os links expiram em 30 minutos, são de uso único e invalidam todas as sessões existentes. Sem SMTP, o formulário mantém a resposta genérica para não revelar contas, e o servidor registra a indisponibilidade sem dados pessoais. Nenhum token é exibido em logs. O servidor SMTP precisa estar acessível por uma rota de rede autorizada; este ambiente não ganhou acesso SMTP externo automaticamente.

## Publicação

1. Provisione PostgreSQL persistente, backup e teste de restauração. Configure TLS sem desativar a validação de certificados.
2. Configure `DATABASE_URL`, `APP_URL=https://...`, `COOKIE_SECURE=true`, `SMTP_URL` e `MAIL_FROM` por um gerenciador de segredos. Remova variáveis de bootstrap após criar o administrador.
3. Execute `npm ci`, `npm run db:generate`, `npm run db:deploy` e `npm run build`. Execute `npm start` atrás de proxy HTTPS, preservando Host e Origin corretos para a proteção CSRF.
4. Em múltiplas instâncias, compartilhe a versão do build e configure `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` de acordo com a documentação do Next.js. Configure limitação de tráfego na borda e política de retenção para sessões/logs.
5. Valide SMTP, autorização, backups e responsividade no ambiente de homologação antes de usuários reais.

Produção sempre usa cookie Secure. O banco Docker local e o servidor `next dev` são para desenvolvimento. Nenhum deploy, push Git ou publicação foi executado nesta entrega. Arquivos privados e armazenamento de objetos serão configurados na fase correspondente; não há upload público ou upload fictício nesta versão.

[Arquitetura](docs/ARCHITECTURE.md) · [Banco](docs/DATABASE.md) · [Pendências](docs/ROADMAP.md)

[Requisitos completos](docs/PRODUCT_REQUIREMENTS.md) · [Resultados da validação](docs/VALIDATION.md)
