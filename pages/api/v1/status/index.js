function status(request, response) {
  response.status(200).json({ chave: " Eu sou um aluno acima da média!" });
}

export default status;
