# Estado e próximas etapas

## Entregue

- Fundação Next.js/TypeScript e visual responsivo em pt-BR.
- PostgreSQL persistente, migrations SQL com checksum/lock e geração Prisma WASM.
- Login por senha, sessão persistente, logout e recuperação por token. Envio exige configuração de SMTP.
- Cinco perfis, escopo de marcas/projetos aplicado no servidor, criação de usuários e associação de equipe pelo sócio.
- Dashboard com contagens e histórico do banco, sem seed ou números fictícios.
- Marcas e contatos: cadastro, consulta, busca/paginação de marcas, arquivamento com confirmação.
- Oportunidades: cadastro, lista/Kanban, 12 etapas persistidas e histórico das mudanças.
- Briefing básico: objetivo, público, tipo, cidade, referências, restrições, notas e status; rascunhos persistidos.
- Reuniões: registro e agenda de reuniões futuras.
- Projetos: cadastro manual, status, lista, membros autorizados.
- Tarefas: cadastro, descrição, prioridade, mudança de status e reabertura.
- Logs transacionais das alterações implementadas; feedback de formulários e estados vazios/carregamento.

## Pendências — em ordem

1. Completar Fase 1: personalização dos widgets, troca de senha autenticada, revogação/desativação de usuários pela UI, CSP com nonce. Validar SMTP externo em homologação.
2. Completar CRM: editar marcas/contatos/oportunidades, atribuir ou transferir responsável da marca, contatos e responsáveis por oportunidade, reuniões editáveis, todos os campos restantes do briefing, anexos e trilha de validação detalhada. Paginar listas subordinadas e seletores maiores.
3. Propostas: criação, versões imutáveis, justificativa, valor em centavos, envio, aprovação vinculada à versão e comprovantes externos. Conversão idempotente em projeto, sem duplicações.
4. Projetos: condições configuráveis de produção, data/evento e todas as informações complementares, Kanban/calendário, tarefas com responsável individual, prazos, subtarefas, comentários, arquivos, arquivamento e políticas específicas para freelancers.
5. Arquivos: armazenamento privado persistente, validação de tamanho/MIME/conteúdo, metadados, autorização por download e exclusão. Não usar URLs públicas para documentos privados.
6. Financeiro: três modelos contratuais, categorias, pagadores mistos, orçamento aprovado/versionado, aprovações transacionais de excedentes, contas/parcelas, pagamentos, comprovantes e indicadores que separem caixa e lucro.
7. Parceiros: fornecedores/creators, associação a projetos, avaliações e histórico.
8. Portal: ACLs por marca/projeto/usuário, visualização compartilhada, aprovações, comentários e pedidos de ajuste. Clientes permanecem sem acesso a dados internos até essa entrega.
9. Notificações internas e preferências; e-mail/WhatsApp automático e transcrição de áudio são futuros.
10. Ampliar qualidade com testes de versões aprovadas, orçamento excedente e download privado quando os módulos existirem; auditoria de produção, desempenho e acessibilidade.

## Cobertura e limites

Os testes atuais não demonstram os 23 passos completos de aceitação do produto: propostas, aprovações, financeiro, parceiros, documentos e portal ainda não existem. Não há testes fictícios para esses módulos. A recuperação por token é testada; entrega por SMTP não foi validada. Publicação externa e restauração da imagem em uma nova tarefa não foram executadas.
