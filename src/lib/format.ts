export const date = (value: Date | string) =>
  new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short' }).format(
    new Date(value),
  );
export const stages = [
  'Novo lead',
  'Primeiro contato',
  'Reunião agendada',
  'Reunião realizada',
  'Aguardando briefing',
  'Briefing recebido',
  'Briefing validado',
  'Proposta em desenvolvimento',
  'Proposta apresentada',
  'Negociação',
  'Fechado',
  'Perdido',
];
export const projectStatuses = [
  'Contratação',
  'Aguardando início',
  'Pré-produção',
  'Produção',
  'Pronto para evento',
  'Evento realizado',
  'Pós-evento',
  'Finalizado',
  'Cancelado',
];
export const taskStatuses = [
  'A fazer',
  'Em andamento',
  'Aguardando terceiros',
  'Revisão',
  'Concluída',
];
