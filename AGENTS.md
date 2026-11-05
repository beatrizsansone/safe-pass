<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# OFFGRID Workspace

- Cada tarefa já tem ambiente isolado. Use o checkout existente; não crie worktree sem pedido explícito.
- Leia README.md, docs/ARCHITECTURE.md, docs/DATABASE.md e docs/ROADMAP.md antes de expandir o produto.
- Português brasileiro; BRL; America/Sao_Paulo. Valores monetários em centavos inteiros ou Decimal.
- TypeScript estrito. Código de autorização em src/server, políticas puras em src/lib/permissions.ts. Nunca confiar em botões ocultos ou IDs enviados pelo cliente.
- Sempre validar entrada e autorização em toda Server Action; cada consulta precisa de escopo explícito. Clientes nunca recebem informação interna sem ACL implementada e testada.
- Senhas e tokens nunca em logs, fixtures versionadas ou código. Sem conta/senha padrão. Segredos apenas em .env ignorado ou no gerenciador de segredos de produção.
- Alteração de negócio e Activity na mesma transação. Arquive dados comerciais em vez de apagar históricos.
- Use npm run db:generate e npm run db:deploy. Não misture offgrid_migrations com prisma migrate deploy/db push. Nunca edite migration aplicada ou apague volume/banco sem autorização.
- Não invente números de dashboard ou controles sem operação implementada. Mantenha o roadmap preciso.
- Execute npm run typecheck, npm test, npm run test:e2e e npm run build quando afetados. E2E usa banco de desenvolvimento e remove apenas seus registros, identificados por UUID próprio. Não rode em produção.
