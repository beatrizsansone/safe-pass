# Arquitetura

Next.js App Router, React, TypeScript estrito, PostgreSQL 17, Prisma 7 com adaptador pg, Zod, Lucide, Vitest e Playwright. O produto usa CSS responsivo próprio com tokens de cor, componentes reutilizáveis e fontes locais do sistema. Tailwind, shadcn, React Hook Form e TanStack Query não foram adicionados porque os formulários atuais usam Server Actions e `useActionState`, sem necessidade de cache ou estado remoto adicional.

- `src/app`: páginas de servidor, fronteiras de erro/loading e layouts. O grupo `(workspace)` exige autenticação. Cada página também chama os validadores de acesso necessários; o layout sozinho não é considerado autorização.
- `src/components`: formulários com validação HTML, mensagens acessíveis, pending e navegação adaptável.
- `src/server`: autenticação, escopos e mutações. Entradas são validadas novamente por Zod. Alteração e atividade são gravadas na mesma transação.
- `src/lib`: banco, políticas de autorização puras, senha e formatação.
- `prisma`: modelo relacional e migrations SQL.
- `scripts`: geração WASM, migração transacional e bootstrap administrativo.

## Sessões e segurança

Senhas usam scrypt com salt aleatório e comparação de tempo constante. Tokens de sessão e recuperação têm 256 bits aleatórios; somente hashes SHA-256 ficam no banco. A sessão tem duração absoluta de 12 horas. Logout remove a sessão; recuperação remove todas. Usuário desativado não autentica. Não existe inscrição pública ou senha padrão.

Tentativas de login e recuperação são limitadas no PostgreSQL por chave de e-mail/token, com UPSERT atômico e janela de 15 minutos. Produção também deve limitar tráfego e tentativas por origem na borda. Nenhum cabeçalho fornecido arbitrariamente pelo usuário é considerado IP confiável.

Server Actions usam as verificações de Origin/Host do Next.js, SameSite=Lax e cookie HttpOnly. Cookie Secure é obrigatório no runtime de produção. `currentUser` devolve somente um DTO de identidade, sem hash de senha. Autorização é aplicada em cada consulta/mutação; IDs de campos ocultos não são confiáveis. SQL bruto é parametrizado.

O CSP atual permite scripts inline exigidos pelo runtime do Next e `unsafe-eval` para desenvolvimento; aplicar nonces e uma política mais restrita em produção é uma melhoria documentada, não uma garantia de CSP estrito nesta versão.

## Política de acesso entregue

ADMIN administra tudo. PROJECT_MANAGER usa CRM somente nas marcas que possui e gerencia um projeto apenas com associação `canManage`. TEAM_MEMBER e FREELANCER leem projetos atribuídos, sem acesso ao CRM. CLIENT não lê projetos internos mesmo se existir associação acidental. Não há financeiro implementado; sua política pura permite somente ADMIN ou PROJECT_MANAGER explicitamente autorizado. A existência da flag não significa implementação do módulo financeiro.

A concessão de permissões administrativas de projeto é feita apenas por ADMIN. O portal do cliente, suas ACLs granulares e a compartilhamento de documentos serão adicionados separadamente. O acesso fica fechado até a implementação dessas regras.

## Limites desta entrega

Sem propostas/versionamento, financeiro, uploads, parceiros, notificações ou portal. Tarefas ainda não têm responsável individual, prazo, subtarefas ou comentários. Dashboard não tem preferências de widgets. Não há integração com WhatsApp ou redes sociais. Os módulos ausentes não aparecem como botões sem função.

As listas principais têm busca e paginação de 20 itens. Contatos, tarefas e membros possuem limites defensivos (100–200), ainda sem paginação própria. Campos e recursos adicionais devem entrar incrementalmente, acompanhados de migração e testes de acesso. Consulte ROADMAP.md.
