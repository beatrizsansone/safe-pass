# PROMPT PARA CODEX — OFFGRID WORKSPACE

## SUA MISSÃO

Atue como um time sênior de desenvolvimento composto por arquiteto de software, engenheiro full-stack, designer de produto, especialista em banco de dados e engenheiro de segurança.

Sua missão é **construir uma aplicação web funcional chamada OFFGRID Workspace**, destinada à gestão de uma empresa brasileira B2B de experiências e eventos wellness.

Não quero apenas um protótipo, mockup, landing page ou dashboard ilustrativo.

Quero um sistema real, com código organizado, autenticação, banco de dados persistente, controle de permissões, regras de negócio, formulários funcionais, arquivos, histórico de atividades e testes.

**Execute a implementação no repositório disponível. Não se limite a explicar como faria.**

Se o repositório estiver vazio, inicialize o projeto. Se já existir uma aplicação, inspecione sua estrutura e aproveite o que estiver adequado, evitando alterações destrutivas desnecessárias.

Trabalhe por etapas, priorizando um MVP utilizável. Não sacrifique segurança e integridade dos dados para implementar mais funcionalidades.

---

# 1. CONTEXTO DA OFFGRID

A OFFGRID é uma empresa B2B especializada em desenvolver experiências wellness para marcas.

A empresa conecta marcas, influenciadores, comunidades e fornecedores para criar eventos e ativações.

Exemplos:

- Eventos de pilates, yoga e fitness.
- Corridas e experiências de run club.
- Bootcamps e treinos funcionais.
- Eventos de boxe.
- Lançamentos de produtos com influenciadores.
- Ativações de marketing.
- Experiências para comunidades.
- Eventos exclusivos para creators.

O cliente principal da OFFGRID é sempre a marca contratante.

A marca pode procurar a empresa com uma ideia pronta ou sem uma ideia definida.

Em ambos os casos, a OFFGRID solicita um briefing antes de desenvolver a proposta.

O briefing pode ser feito por formulário, reunião, arquivo, referências visuais ou áudio enviado por WhatsApp.

Após o briefing, a OFFGRID desenvolve o conceito, cria a proposta comercial, apresenta o projeto, negocia, formaliza a contratação e produz o evento.

Cada marca deve ter uma pessoa da OFFGRID responsável pelo relacionamento desde o primeiro contato até a entrega final.

A empresa opera com uma equipe fixa pequena e freelancers por evento.

Cada evento possui necessidades diferentes. O sistema precisa ser flexível e permitir personalização.

---

# 2. OBJETIVO DO PRODUTO

Construir uma plataforma que permita:

1. Gerenciar marcas e contatos.
2. Controlar oportunidades comerciais.
3. Registrar reuniões e briefings.
4. Criar e acompanhar propostas comerciais.
5. Converter oportunidades fechadas em projetos.
6. Planejar e produzir eventos.
7. Gerenciar tarefas e cronogramas.
8. Gerenciar fornecedores e creators.
9. Controlar orçamentos, despesas e pagamentos.
10. Administrar documentos.
11. Registrar aprovações e mudanças.
12. Oferecer um portal exclusivo para as marcas.
13. Acompanhar indicadores em um dashboard.
14. Controlar permissões por usuário e projeto.

A plataforma deve funcionar bem no desktop e no celular.

Todo o sistema deve estar em português brasileiro.

Padrões:

- Idioma: pt-BR.
- Moeda: BRL.
- Datas: DD/MM/AAAA.
- Fuso horário padrão: America/Sao_Paulo.

---

# 3. STACK TECNOLÓGICA

Utilize preferencialmente:

- Next.js com App Router.
- React.
- TypeScript com tipagem estrita.
- Tailwind CSS.
- shadcn/ui.
- Lucide Icons.
- PostgreSQL.
- Prisma ORM ou alternativa tecnicamente justificada.
- Zod para validação.
- React Hook Form para formulários.
- TanStack Query quando adequado.
- Autenticação segura compatível com a stack escolhida.
- Vitest para testes unitários.
- Playwright para testes end-to-end.

Escolha versões estáveis e compatíveis das dependências.

Não utilize bibliotecas desnecessárias.

Estruture o projeto para permitir deploy futuro em ambiente de produção.

### Requisitos de engenharia

- Separação clara entre frontend, backend, persistência e regras de negócio.
- Componentes reutilizáveis.
- Tipagem consistente.
- Validação no cliente e no servidor.
- Controle de acesso aplicado no servidor.
- Tratamento de erros.
- Paginação nas listas.
- Busca e filtros.
- Migrations do banco.
- Variáveis de ambiente.
- Arquivo `.env.example`.
- README com instruções de instalação e execução.
- Testes automatizados dos fluxos críticos.
- Logs adequados, sem exposição de dados sensíveis.

Não inserir credenciais reais no código.

Para valores monetários, usar centavos inteiros ou Decimal, nunca floating point para cálculos financeiros.

---

# 4. IDENTIDADE VISUAL

Criar uma interface premium, minimalista e sofisticada.

Referências de experiência:

- Linear.
- Notion.
- Attio.
- Monday.com.

Essas referências servem apenas como inspiração de usabilidade e organização.

A estética deve combinar tecnologia, criatividade e wellness.

Utilizar inicialmente:

- Off-white.
- Bege claro.
- Areia.
- Cinza.
- Preto suave.
- Verde-sálvia discreto.

Se existirem arquivos de identidade visual da OFFGRID no repositório, priorizá-los.

### Interface

Criar sidebar lateral no desktop com:

- Dashboard.
- CRM.
- Marcas.
- Projetos.
- Calendário.
- Financeiro.
- Parceiros.
- Documentos.
- Configurações.

Adicionar menu de usuário e notificações.

Criar navegação adaptada para celular.

Todos os elementos interativos devem ter funcionamento real.

Implementar:

- Loading states.
- Empty states.
- Toasts.
- Confirmações de exclusão ou arquivamento.
- Mensagens de erro.
- Validação visual.
- Feedback após salvar dados.

---

# 5. AUTENTICAÇÃO E PERMISSÕES

Implementar autenticação real por e-mail e senha, recuperação de acesso e sessões seguras.

Criar cinco perfis:

### ADMIN / SÓCIO

Acesso completo à plataforma, projetos, financeiro e usuários.

### PROJECT_MANAGER

Responsável por determinados projetos.

Pode visualizar e administrar os projetos atribuídos, incluindo seu financeiro interno.

### TEAM_MEMBER

Pode acessar projetos e tarefas autorizados.

Não possui acesso automático ao financeiro interno.

### FREELANCER

Pode visualizar apenas tarefas, arquivos e projetos especificamente autorizados.

### CLIENT

Usuário vinculado a uma marca.

Pode acessar exclusivamente informações compartilhadas da própria marca.

Dentro do portal, criar permissões adicionais para:

- Visualização de projeto.
- Visualização de documentos.
- Visualização de proposta e orçamento comercial.
- Aprovação de propostas.
- Aprovação de alterações.

As permissões do cliente devem ser configuráveis por marca, projeto e usuário, conforme necessário.

**Regra crítica: o financeiro interno da OFFGRID deve ser visível apenas aos sócios e ao responsável autorizado pelo projeto.**

Implementar autorização no backend para todas as operações e consultas sensíveis.

Não confiar apenas na ocultação de botões.

Testar acesso indevido entre marcas e projetos.

---

# 6. DASHBOARD

A página inicial deve ser um dashboard personalizável.

Exibir indicadores reais como:

- Projetos ativos.
- Propostas em negociação.
- Reuniões futuras.
- Eventos próximos.
- Tarefas atrasadas.
- Tarefas pendentes.
- Aprovações aguardando resposta.
- Atualizações recentes.
- Recebimentos e pagamentos, para usuários autorizados.

Permitir personalização básica dos widgets por usuário.

Não apresentar métricas financeiras confidenciais a usuários sem permissão.

Não utilizar números demonstrativos fixos como se fossem dados reais.

---

# 7. CRM E MARCAS

Criar um CRM com cadastro de marcas, contatos e oportunidades.

### Marca

Campos:

- ID.
- Nome comercial.
- Razão social.
- CNPJ opcional.
- Segmento.
- Website.
- Instagram.
- E-mail.
- Telefone.
- Cidade.
- Observações.
- Responsável OFFGRID.
- Data de criação.

### Contato

- Nome.
- Cargo.
- Marca.
- E-mail.
- WhatsApp.
- Observações.

Uma marca pode ter vários contatos e vários projetos.

### Oportunidades

Criar funil Kanban com as etapas:

1. Novo lead.
2. Primeiro contato.
3. Reunião agendada.
4. Reunião realizada.
5. Aguardando briefing.
6. Briefing recebido.
7. Briefing validado.
8. Proposta em desenvolvimento.
9. Proposta apresentada.
10. Negociação.
11. Fechado.
12. Perdido.

Permitir mover oportunidades entre as etapas e salvar a mudança no banco.

Cada oportunidade possui responsável, marca, contatos, notas, atividades e histórico.

Permitir visualização em lista e Kanban.

---

# 8. BRIEFINGS

Criar módulo de briefings.

Cada oportunidade pode conter um briefing.

A marca pode:

- Não possuir ideia definida.
- Já possuir ideia de evento.

Registrar:

- Objetivo do evento.
- Público-alvo.
- Tipo de experiência.
- Quantidade estimada de participantes.
- Data pretendida.
- Cidade.
- Orçamento disponível.
- Referências.
- Creators desejados.
- Restrições.
- Expectativas.
- Observações.

Aceitar:

- Formulário preenchido.
- Arquivos.
- Áudios.
- Links do Pinterest.
- Referências externas.
- Informações registradas manualmente após reuniões.

O briefing terá os status:

- Rascunho.
- Recebido.
- Incompleto.
- Validado.

Permitir salvar rascunhos.

A validação do briefing deve ser registrada.

Preparar a estrutura para transcrição automática de áudio no futuro, sem implementá-la agora.

---

# 9. PROPOSTAS COMERCIAIS

Criar propostas vinculadas às oportunidades.

Campos:

- Nome.
- Marca.
- Conceito criativo.
- Objetivo.
- Descrição.
- Público.
- Formato.
- Data estimada.
- Creators sugeridos.
- Entregáveis.
- Condições comerciais.
- Valor.
- Prazo de validade.
- Arquivos.

Permitir upload de apresentações e PDFs.

### Versionamento

Criar versões V1, V2, V3 etc.

Salvar versões anteriores de maneira imutável após envio/aprovação.

Registrar:

- Autor.
- Data.
- Alterações.
- Justificativa.
- Valor anterior.
- Novo valor.
- Status.

Permitir:

- Aprovação pelo portal.
- Registro de aprovação externa recebida pelo WhatsApp.
- Anexação de comprovantes.

Toda aprovação deve ser vinculada à versão específica aprovada.

Registrar usuário, data e horário.

Quando uma proposta for aprovada, permitir sua conversão em projeto sem duplicar cadastros existentes.

---

# 10. GESTÃO DE PROJETOS

Criar módulo central de projetos.

Campos:

- Nome.
- Marca.
- Responsável.
- Tipo de evento.
- Descrição.
- Objetivo.
- Local.
- Data.
- Público estimado.
- Status.
- Equipe.
- Creators.
- Fornecedores.
- Briefing.
- Proposta.
- Contrato.
- Orçamento.
- Documentos.

### Status

- Contratação.
- Aguardando início.
- Pré-produção.
- Produção.
- Pronto para evento.
- Evento realizado.
- Pós-evento.
- Finalizado.
- Cancelado.

As condições para iniciar a produção devem ser configuráveis por projeto e contrato.

Exemplos:

- Contrato assinado.
- Sinal recebido.
- Aprovação formal.
- Condição personalizada.

Não tornar o sinal obrigatório em todos os projetos.

### Visualizações

Implementar:

- Kanban.
- Lista.
- Calendário.

As três visualizações devem compartilhar os mesmos dados persistidos.

---

# 11. TAREFAS E CRONOGRAMAS

Cada evento terá checklist personalizado, criado do zero.

Não obrigar o uso de templates.

Cada tarefa deve conter:

- Título.
- Descrição.
- Projeto.
- Responsável.
- Prazo.
- Prioridade.
- Status.
- Subtarefas.
- Anexos.
- Comentários.

Status:

- A fazer.
- Em andamento.
- Aguardando terceiros.
- Revisão.
- Concluída.

Permitir criar, editar, atribuir, concluir, reabrir e arquivar tarefas.

Criar calendário unificado com tarefas, reuniões e eventos.

Indicadores de progresso devem refletir tarefas e marcos reais.

---

# 12. FINANCEIRO

Implementar módulo financeiro com controle por projeto.

A OFFGRID trabalha com três modelos de remuneração:

### A. Preço fechado

A marca paga um valor total pelo evento.

### B. Fee + custos

A marca paga um fee à OFFGRID e os custos de produção são tratados separadamente.

### C. Fee + receita variável

A OFFGRID recebe fee e participação em receitas contratualmente definidas.

Cada projeto deve permitir selecionar e configurar o modelo.

### Orçamento

Criar categorias editáveis:

- Espaço.
- Creators.
- Catering.
- Ambientação.
- Audiovisual.
- Equipe.
- Logística.
- Marketing.
- Materiais.
- Outros.

Cada item deve conter:

- Descrição.
- Categoria.
- Fornecedor.
- Quantidade.
- Valor unitário.
- Valor previsto.
- Valor aprovado.
- Valor realizado.
- Pagador.
- Status.
- Comprovantes.

### Pagadores

Cada item pode ter como responsável:

- OFFGRID.
- Marca contratante.

Os dois formatos podem coexistir no mesmo projeto.

### Aprovações financeiras

Definir orçamento aprovado por categoria.

Se o valor superar o limite autorizado, gerar pendência de aprovação.

Registrar:

- Valor anterior.
- Valor novo.
- Diferença.
- Motivo.
- Responsável.
- Comprovante.
- Data da aprovação.

Não permitir que um gasto excedente seja marcado como autorizado sem a aprovação exigida.

### Pagamentos

Registrar:

- Contas a pagar.
- Contas a receber.
- Parcelas.
- Vencimentos.
- Pagamentos realizados.
- Comprovantes.
- Status.
- Contraparte.

### Indicadores

Exibir:

- Orçamento previsto.
- Orçamento aprovado.
- Custos realizados.
- Entradas previstas.
- Entradas efetivas.
- Saídas previstas.
- Saídas efetivas.
- Fee da OFFGRID.
- Receita variável.
- Resultado estimado.
- Resultado realizado.

Não confundir valores recebidos para pagamento de terceiros com faturamento próprio.

Separar fluxo de caixa de lucro.

Não tentar automatizar classificação contábil ou tributária sem regras validadas.

---

# 13. FORNECEDORES

Criar banco de fornecedores.

Campos:

- Nome.
- Empresa.
- Categoria.
- Cidade.
- Contato.
- WhatsApp.
- E-mail.
- Site.
- Instagram.
- Valores de referência.
- Observações.
- Arquivos.
- Orçamentos.
- Contratos.

Permitir vincular fornecedores a projetos.

Criar avaliações internas com:

- Qualidade.
- Cumprimento de prazo.
- Comunicação.
- Custo-benefício.
- Comentários.

---

# 14. CREATORS

Criar banco inicial de creators.

Campos:

- Nome.
- Nome profissional.
- Instagram.
- TikTok.
- Nicho.
- Cidade.
- Contato.
- E-mail.
- Valor estimado.
- Observações.

Permitir vincular creators a vários projetos.

Registrar histórico de participação.

Preparar o banco para futuras métricas de audiência e engajamento, sem desenvolver integrações com redes sociais neste MVP.

---

# 15. DOCUMENTOS E ARQUIVOS

Implementar armazenamento persistente de arquivos privados.

Permitir:

- Upload.
- Download.
- Organização por projeto.
- Categorias.
- Exclusão autorizada.
- Links do Google Drive.
- Links do Pinterest.

Categorias:

- Briefing.
- Proposta.
- Contrato.
- Orçamento.
- Referências.
- Produção.
- Fornecedores.
- Pós-evento.

Validar tamanho e tipo de arquivo.

Armazenar metadados no banco.

Não expor URLs públicas permanentes para documentos confidenciais.

Verificar autorização antes de permitir download.

---

# 16. PORTAL DA MARCA

Criar interface separada para clientes.

Acesso mediante login e permissão.

Mostrar:

- Projetos autorizados.
- Responsável OFFGRID.
- Status.
- Cronograma compartilhado.
- Entregáveis.
- Atualizações.
- Reuniões.
- Documentos.
- Aprovações pendentes.

Implementar aprovação de propostas e solicitações dentro do portal.

Permitir registrar comentários e pedidos de ajuste.

A marca não pode visualizar:

- Margem da OFFGRID.
- Custos internos confidenciais.
- Informações de outras marcas.
- Dados privados dos fornecedores.
- Projetos não autorizados.

As regras de autorização devem ser verificadas no servidor.

---

# 17. NOTIFICAÇÕES

Implementar notificações internas para:

- Nova tarefa atribuída.
- Prazo próximo.
- Tarefa atrasada.
- Aprovação solicitada.
- Aprovação recebida.
- Alteração de orçamento.
- Atualização importante.
- Pagamento próximo do vencimento.

Criar página ou painel de notificações.

Permitir marcar como lidas.

E-mail e WhatsApp automático ficam para versões futuras.

---

# 18. HISTÓRICO DE ATIVIDADES

Criar logs para alterações relevantes:

- Propostas.
- Orçamentos.
- Pagamentos.
- Aprovações.
- Status.
- Responsáveis.
- Contratos.

Registrar autor e timestamp.

Preservar históricos de versões.

Preferir soft delete ou arquivamento para registros comerciais e financeiros importantes.

---

# 19. BANCO DE DADOS

Planejar um esquema relacional normalizado com entidades equivalentes a:

- User
- Profile
- Role
- Permission
- Brand
- BrandContact
- BrandAccess
- Opportunity
- Interaction
- Meeting
- Briefing
- Proposal
- ProposalVersion
- Project
- ProjectMember
- Task
- TaskComment
- CalendarEvent
- Budget
- BudgetVersion
- BudgetCategory
- BudgetItem
- Approval
- Contract
- Receivable
- Payable
- FinancialTransaction
- Creator
- Supplier
- SupplierReview
- ProjectPartner
- File
- Notification
- ActivityLog

A estrutura exata pode ser ajustada para manter integridade, normalização e simplicidade.

Utilizar identificadores UUID, timestamps, chaves estrangeiras, índices e constraints.

---

# 20. ORGANIZAÇÃO DO REPOSITÓRIO

Criar uma estrutura clara e escalável.

Sugestão:

- `src/app` — páginas e rotas.
- `src/components` — componentes compartilhados.
- `src/features` — módulos de negócio.
- `src/lib` — serviços e utilitários.
- `src/server` — operações seguras de backend.
- `prisma` — schema e migrations, se Prisma for utilizado.
- `tests` — testes.
- `public` — assets.
- `docs` — documentação.

Criar um arquivo `AGENTS.md` na raiz do repositório com orientações sobre arquitetura, segurança, convenções de código e testes.

Criar também:

- `README.md`
- `.env.example`
- `docs/ARCHITECTURE.md`
- `docs/DATABASE.md`
- `docs/ROADMAP.md`

---

# 21. IMPLEMENTAÇÃO EM ETAPAS

Não tente desenvolver todo o produto de uma só vez se isso comprometer a qualidade.

Execute as etapas em ordem, mantendo o aplicativo executável.

### FASE 1 — Fundação funcional

- Inicializar projeto.
- Criar identidade visual inicial.
- Configurar banco de dados.
- Implementar autenticação.
- Implementar permissões básicas.
- Criar layout e navegação.
- Criar dashboard inicial baseado em dados reais.

### FASE 2 — CRM

- Marcas.
- Contatos.
- Oportunidades.
- Funil Kanban.
- Reuniões.
- Briefings.

### FASE 3 — Projetos

- Cadastro de projetos.
- Conversão de oportunidades.
- Tarefas.
- Calendário.
- Arquivos.
- Responsáveis.

### FASE 4 — Financeiro

- Modelos de remuneração.
- Orçamentos.
- Categorias.
- Pagamentos.
- Aprovações.
- Versionamento.

### FASE 5 — Parceiros

- Creators.
- Fornecedores.
- Histórico de participação.
- Documentos.

### FASE 6 — Portal

- Acesso do cliente.
- Visualização dos projetos.
- Aprovações.
- Documentos compartilhados.

### FASE 7 — Qualidade

- Testes automatizados.
- Correção de bugs.
- Testes de autorização.
- Revisão de responsividade.
- Melhorias de performance.
- Documentação final.

Se o escopo não couber em uma única execução, conclua o máximo possível com qualidade, documente precisamente o que permanece pendente e preserve o estado do projeto para a próxima tarefa.

Não substituir funcionalidades ausentes por interfaces falsas.

---

# 22. TESTES E CRITÉRIOS DE ACEITAÇÃO

O sistema deve permitir o seguinte fluxo:

1. Administrador faz login.
2. Cadastra uma marca.
3. Cadastra contato da marca.
4. Cria oportunidade.
5. Move a oportunidade no CRM.
6. Registra reunião.
7. Registra briefing e anexa documentos.
8. Cria proposta.
9. Cria nova versão da proposta.
10. Registra aprovação.
11. Converte a oportunidade em projeto.
12. Atribui responsável.
13. Cria tarefas.
14. Vincula fornecedores e creators.
15. Registra orçamento.
16. Define pagadores.
17. Registra pagamentos.
18. Cria conta de acesso para cliente.
19. Cliente faz login e visualiza seu projeto.
20. Cliente aprova uma solicitação permitida.
21. Equipe conclui a produção.
22. Responsável finaliza o evento.
23. Sócio consulta o resultado financeiro.

Os dados devem persistir após recarregar a página.

Criar testes para impedir:

- Acesso de cliente a outra marca.
- Acesso de freelancer a projeto não autorizado.
- Consulta financeira por usuário sem permissão.
- Alteração indevida de versões aprovadas.
- Aprovação de orçamento sem autorização.
- Download não autorizado de documentos privados.

Não declarar testes como executados caso não tenham sido executados.

---

# 23. DADOS DEMONSTRATIVOS

Criar dados de demonstração separados, se necessário.

Exemplos:

- Marca Aurora.
- Wellness Experience.
- Pilates & Glow.
- Run Club Activation.

Não utilizar números fictícios no dashboard real como se fossem dados cadastrados.

Permitir iniciar a plataforma com banco vazio.

Fornecer mecanismo de seed apenas para desenvolvimento.

---

# 24. DEPLOY E OPERAÇÃO

Preparar o sistema para deploy.

Criar instruções para:

- Configurar banco de dados.
- Configurar autenticação.
- Configurar armazenamento de arquivos.
- Executar migrations.
- Configurar variáveis de ambiente.
- Iniciar o servidor.
- Executar testes.
- Gerar build.
- Publicar em ambiente de produção.

Não presumir que recursos externos ou credenciais já estejam disponíveis.

Se algum serviço exigir conta, token, pagamento ou configuração manual, documentar claramente.

Não executar migrações destrutivas nem apagar dados existentes sem autorização explícita.

---

# 25. INSTRUÇÃO FINAL — EXECUTE O TRABALHO

Você está autorizado a criar e modificar os arquivos necessários dentro do repositório de desenvolvimento.

Comece inspecionando o ambiente.

Depois:

1. Defina a arquitetura.
2. Crie o banco de dados e suas migrations.
3. Implemente a fundação do aplicativo.
4. Construa progressivamente os módulos.
5. Execute os testes disponíveis.
6. Corrija problemas identificados.
7. Documente as decisões e o que ficou pendente.

Não entregue somente uma descrição conceitual.

Não entregue apenas telas com dados mockados.

Não adicione botões sem função.

Não comprometa os controles de segurança.

Ao finalizar, apresente:

- Arquivos criados ou alterados.
- Funcionalidades implementadas.
- Funcionalidades ainda pendentes.
- Comandos para executar o sistema.
- Variáveis de ambiente necessárias.
- Testes executados e resultados.
- Próximos passos para publicação.

**O resultado esperado é a OFFGRID Workspace: uma plataforma web empresarial real, segura, elegante, integrada e preparada para escalar a operação B2B de eventos wellness da OFFGRID.**

Comece a implementar agora, dando prioridade à Fase 1 e avançando para as seguintes conforme o ambiente e as dependências permitirem.
