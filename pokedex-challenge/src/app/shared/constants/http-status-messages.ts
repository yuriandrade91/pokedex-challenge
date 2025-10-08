export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'Parece que houve um problema com sua solicitação. Por favor, verifique os dados informados.',
  401: 'Você precisa estar autenticado para acessar esta funcionalidade.',
  403: 'Você não tem permissão para acessar este recurso.',
  404: 'Não encontramos o que você está procurando.',
  409: 'Já existe um registro semelhante. Verifique as informações enviadas.',
  422: 'Não foi possível processar os dados enviados. Por favor, revise e tente novamente.',
  500: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
  503: 'O serviço está temporariamente indisponível. Por favor, tente novamente em alguns minutos.',
};
