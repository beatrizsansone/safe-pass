# Validação desta entrega

Validação executada no ambiente cloud em 05/11/2026:

- Instalação com `npm ci`: concluída.
- `npm run db:generate`: cliente Prisma gerado pelos pacotes oficiais via WASM, sem desativar TLS/checksums.
- `npm run db:deploy`: migration inicial aplicada; execuções posteriores confirmaram idempotência.
- PostgreSQL 17 em Docker: healthcheck saudável e consultas/mutações reais nos E2E.
- `npm run typecheck`: passou.
- `npm test`: 9 testes unitários passaram.
- `npm run test:e2e`: 9 cenários passaram em Chromium com PostgreSQL real.
- `npm run build`: passou, com páginas e rotas geradas pelo Next.js.
- `npm audit --omit=dev --audit-level=high`: nenhuma vulnerabilidade reportada na execução final.
- Bootstrap `admin:create`: executado com credenciais temporárias aleatórias; usuário de teste removido.

Os E2E cobrem login obrigatório, cadastro de marca/contato/oportunidade/briefing/projeto/tarefa, reuniões na agenda, persistência após recarregar, bloqueio entre responsáveis/marcas, bloqueio de cliente e freelancer, adulteração de IDs em formulário, recuperação com token único, invalidação de sessões, cookie HttpOnly/SameSite, logout e viewport móvel.

Ainda não validados: entrega externa por SMTP, deploy externo, backup/restauração e restauração do snapshot em nova tarefa. Módulos do roadmap ausentes não possuem testes de aceitação executados: não inferir cobertura de propostas aprovadas, orçamento excedente ou download privado.

As configurações reutilizáveis `install_script` e `start_skill` foram salvas como rascunho. Salvamento não equivale a publicação do ambiente ou push do código para GitHub.
