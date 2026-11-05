# Banco de dados

PostgreSQL 17. UUIDs, chaves estrangeiras, timestamps e índices protegem o modelo. O Prisma gera UUIDs nas operações ORM; a migration também usa `gen_random_uuid()` para inserções SQL. Datas representam instantes UTC e são exibidas em America/Sao_Paulo. Reuniões recebem horário local de Brasília e são convertidas para UTC no servidor.

## Entidades implementadas

- User → Session e PasswordReset: credenciais/sessões, cascata ao remover usuário.
- AuthAttempt: janela de limite de tentativas, chave com hash.
- User → Brand: responsável único pelo relacionamento; BrandAccess reserva a associação com clientes, ainda não utilizada para liberar dados.
- Brand → Contact, Opportunity e Project: referências restritas para evitar remoção acidental.
- Opportunity → Briefing (único) e Meeting.
- Project → ProjectMember (único por usuário/projeto) e Task.
- Activity → User: histórico com autor, entidade e timestamp; sem conteúdo sensível de formulário.

Marcas usam `archivedAt`, preservando vínculos e histórico. A etapa comercial tem constraint 0–11. O orçamento futuro do briefing é inteiro em centavos, com constraint de não negatividade; ainda não tem formulário nesta versão. Nenhum cálculo financeiro é feito com ponto flutuante.

O schema inclui apenas entidades usadas ou necessárias ao isolamento inicial. Não existem tabelas vazias que pretendam implementar módulos ainda ausentes.

## Migrations

O runner `scripts/migrate.cjs` usa SQL versionado em `prisma/migrations/*/migration.sql`, ordena os diretórios e adquire um lock consultivo para serializar execuções. Registra checksum SHA-256 em `offgrid_migrations`; recusa arquivo aplicado que tenha sido alterado. Cada arquivo e seu registro no histórico são transacionais. Nunca edite migration aplicada.

Não use o runner de migrations do Prisma nesse mesmo histórico. A escolha do runner SQL permite executar desenvolvimento/deploy sem um binário remoto do Prisma. O schema Prisma continua sendo o contrato do cliente; atualize schema e SQL juntos. O gerador WASM é versionado com pacotes oficiais fixados em 7.10.1 e precisa ser validado a cada upgrade.

O volume Docker `safe-pass_offgrid-db` mantém o desenvolvimento local. Para produção, use banco gerenciado ou volume durável, backup e uma conta de aplicação com privilégios mínimos após aplicar migrations. Nenhuma migration destrutiva é necessária para esta entrega.

## Futuro

Propostas e aprovações precisarão de versões imutáveis e vínculo exato com a versão aprovada. Financeiro precisa separar orçamento/custos, caixa e receita própria, com aprovação transacional de excedentes. Documentos precisarão de metadados e armazenamento privado com autorização por download. Essas invariantes ainda não são implementadas e não devem ser inferidas do schema inicial.
