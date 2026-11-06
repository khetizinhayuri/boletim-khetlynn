/* =========================================================
   CONFIGURAÇÃO FIXA DO ALUNO
   ========================================================= */
const CONFIG_ALUNO = {
  turma: "8A",
  numeroChamada: 17,
  apiUrl: "https://boletim-api.profbt.com.br"
};

/* =========================================================
   ESTADO DA SESSÃO
   ========================================================= */
// O PIN fica somente em memória durante a sessão.
let pinSessao = null;
// Array com as disciplinas atualmente em exibição.
let disciplinasAtuais = null;

/* =========================================================
   DADOS FICTÍCIOS — 8º ANO (dados antigos do projeto)
   ========================================================= */
const dadosBrutos = [
  { disciplina: "Língua Portuguesa", tri1: 82, tri2: "7,8", tri3: 85, faltas: [2, 1, 1] },
  { disciplina: "Matemática", tri1: 52, tri2: "5,8", tri3: null, faltas: [3, 2, 1] },
  { disciplina: "Ciências", tri1: "8,1", tri2: 76, tri3: 8.0, faltas: [1, 2, 0] },
  { disciplina: "História", tri1: 7.0, tri2: 84, tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Geografia", tri1: 68, tri2: 7.3, tri3: "7,9", faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 86, tri2: "8,1", tri3: 8.7, faltas: [1, 0, 0] },
  { disciplina: "Arte", tri1: 9.0, tri2: 92, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 95, tri2: 9.0, tri3: "9,4", faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 88, tri2: 9.1, tri3: 93, faltas: [1, 0, 1] },
  { disciplina: "Educação Financeira", tri1: 74, tri2: "7,8", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Estudo Orientado", tri1: 8.0, tri2: 83, tri3: "8,5", faltas: [0, 1, 0] },
  { disciplina: "Redação e Leitura", tri1: 62, tri2: "6,8", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 48, tri2: 5.6, tri3: "6,0", faltas: [2, 2, 1] },
  { disciplina: "Literatura Arte e Movimento", tri1: "7,7", tri2: 80, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Práticas Experimentais", tri1: 58, tri2: "6,2", tri3: 6.4, faltas: [1, 1, 1] }
];

// Média mínima de referência
const MEDIA_MINIMA = 6.0;

/* =========================================================
   FUNÇÃO: normalizarNota(valor)
   ---------------------------------------------------------
   Converte qualquer formato de nota para a escala 0–10.
   Regras (dados antigos do projeto):
   - vazio / null / undefined → null (nota não lançada)
   - 0 a 10 → mantém
   - >10 até 100 → divide por 10
   - aceita ponto ou vírgula
   - fora das regras → null (inválida)
   ========================================================= */
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  let numero;
  if (typeof valor === "string") {
    numero = parseFloat(valor.replace(",", "."));
  } else {
    numero = Number(valor);
  }

  if (isNaN(numero)) {
    return null;
  }

  if (numero >= 0 && numero <= 10) {
    return numero;
  }
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  return null;
}

/* =========================================================
   FUNÇÃO: validarNotaDigitada(texto)
   ---------------------------------------------------------
   Regra do EDITOR (diferente da normalização dos dados antigos):
   - aceita número entre 0 e 10
   - aceita ponto ou vírgula decimal
   - aceita vazio → null
   - recusa 75, 82, 100, -1, 11, "abc"
   Retorna { valido: true, valor } ou { valido: false }.
   ========================================================= */
function validarNotaDigitada(texto) {
  const bruto = String(texto).trim();

  if (bruto === "") {
    return { valido: true, valor: null };
  }

  if (!/^\d+([.,]\d+)?$/.test(bruto)) {
    return { valido: false };
  }

  const numero = parseFloat(bruto.replace(",", "."));

  if (isNaN(numero) || numero < 0 || numero > 10) {
    return { valido: false };
  }

  return { valido: true, valor: numero };
}

/* =========================================================
   FUNÇÃO: validarFaltasDigitadas(texto)
   ---------------------------------------------------------
   Aceita somente número inteiro >= 0.
   Vazio é inválido.
   ========================================================= */
function validarFaltasDigitadas(texto) {
  const bruto = String(texto).trim();

  if (bruto === "") {
    return { valido: false };
  }

  if (!/^\d+$/.test(bruto)) {
    return { valido: false };
  }

  const numero = parseInt(bruto, 10);

  if (isNaN(numero) || numero < 0) {
    return { valido: false };
  }

  return { valido: true, valor: numero };
}

/* =========================================================
   FUNÇÃO: formatarNota(nota)
   ========================================================= */
function formatarNota(nota) {
  if (nota === null) return "—";
  return nota.toFixed(1).replace(".", ",");
}

/* =========================================================
   FUNÇÃO: calcularMedia(notas)
   ========================================================= */
function calcularMedia(notas) {
  const disponiveis = notas.filter((n) => n !== null);
  if (disponiveis.length === 0) return null;

  const soma = disponiveis.reduce((total, n) => total + n, 0);
  return soma / disponiveis.length;
}

/* =========================================================
   FUNÇÃO: somarFaltas(lista)
   ========================================================= */
function somarFaltas(lista) {
  return lista.reduce((total, n) => total + n, 0);
}

/* =========================================================
   FUNÇÃO: definirSituacao(media)
   ========================================================= */
function definirSituacao(media) {
  if (media === null) return { texto: "Nota ainda não disponível", classe: "indisponivel" };
  if (media >= MEDIA_MINIMA) return { texto: "Bom desempenho", classe: "bom" };
  return { texto: "Atenção", classe: "atencao" };
}

/* =========================================================
   FUNÇÃO: processarDisciplinas(lista)
   ---------------------------------------------------------
   Recebe uma lista de disciplinas (com tri1, tri2, tri3 e
   faltas como array OU número) e devolve um array já
   pronto para renderização, com n1, n2, n3, media,
   faltas e situacao.
   ========================================================= */
function processarDisciplinas(lista) {
  return lista.map((item) => {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    const media = calcularMedia([n1, n2, n3]);

    const faltasArray = Array.isArray(item.faltas)
      ? item.faltas
      : [item.faltas || 0];
    const faltas = somarFaltas(faltasArray);

    const situacao = definirSituacao(media);

    return {
      disciplina: item.disciplina,
      n1,
      n2,
      n3,
      media,
      faltas,
      situacao
    };
  });
}

/* =========================================================
   FUNÇÃO: limparTabela()
   ========================================================= */
function limparTabela() {
  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.innerHTML = "";
}

/* =========================================================
   FUNÇÃO: limparCards()
   ---------------------------------------------------------
   Remove os cards dinâmicos, preservando os cards fixos
   definidos no HTML (média geral, faltas, etc.).
   ========================================================= */
function limparCards() {
  const areaCards = document.getElementById("cards");
  const cardsFixos = areaCards.querySelectorAll(".card-resumo");
  cardsFixos.forEach((card) => {
    const strong = card.querySelector("strong");
    if (strong) strong.textContent = "—";
  });
}

/* =========================================================
   FUNÇÃO: renderizarTabela(boletim)
   ========================================================= */
function renderizarTabela(boletim) {
  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.innerHTML = "";

  boletim.forEach((linha) => {
    const tr = document.createElement("tr");

    const tdDisciplina = document.createElement("td");
    tdDisciplina.textContent = linha.disciplina;

    const tdN1 = document.createElement("td");
    tdN1.textContent = linha.n1 === null ? "Ainda não lançada" : formatarNota(linha.n1);

    const tdN2 = document.createElement("td");
    tdN2.textContent = linha.n2 === null ? "Ainda não lançada" : formatarNota(linha.n2);

    const tdN3 = document.createElement("td");
    tdN3.textContent = linha.n3 === null ? "Ainda não lançada" : formatarNota(linha.n3);

    const tdMedia = document.createElement("td");
    const strongMedia = document.createElement("strong");
    strongMedia.textContent = formatarNota(linha.media);
    tdMedia.appendChild(strongMedia);

    const tdFaltas = document.createElement("td");
    tdFaltas.textContent = linha.faltas;

    const tdSituacao = document.createElement("td");
    const spanSituacao = document.createElement("span");
    spanSituacao.className = "badge " + linha.situacao.classe;
    spanSituacao.textContent = linha.situacao.texto;
    tdSituacao.appendChild(spanSituacao);

    tr.appendChild(tdDisciplina);
    tr.appendChild(tdN1);
    tr.appendChild(tdN2);
    tr.appendChild(tdN3);
    tr.appendChild(tdMedia);
    tr.appendChild(tdFaltas);
    tr.appendChild(tdSituacao);

    corpoTabela.appendChild(tr);
  });
}

/* =========================================================
   FUNÇÃO: renderizarCards(boletim)
   ========================================================= */
function renderizarCards(boletim) {
  const mediasDisponiveis = boletim
    .map((d) => d.media)
    .filter((m) => m !== null);
  const mediaGeral =
    mediasDisponiveis.length > 0
      ? mediasDisponiveis.reduce((t, m) => t + m, 0) / mediasDisponiveis.length
      : null;

  const totalFaltas = boletim.reduce((t, d) => t + d.faltas, 0);

  const comBomDesempenho = boletim.filter(
    (d) => d.situacao.classe === "bom"
  ).length;

  const comAtencao = boletim.filter(
    (d) => d.situacao.classe === "atencao"
  ).length;

  const elMedia = document.getElementById("media-geral");
  const elFaltas = document.getElementById("total-faltas");
  const elBom = document.getElementById("bom-desempenho");
  const elAtencao = document.getElementById("precisam-atencao");

  if (elMedia) elMedia.textContent = formatarNota(mediaGeral);
  if (elFaltas) elFaltas.textContent = totalFaltas;
  if (elBom) elBom.textContent = comBomDesempenho + " disciplinas";
  if (elAtencao) elAtencao.textContent = comAtencao + " disciplinas";
}

/* =========================================================
   FUNÇÃO: renderizarBoletim(boletim)
   ========================================================= */
function renderizarBoletim(boletim) {
  limparTabela();
  limparCards();
  renderizarTabela(boletim);
  renderizarCards(boletim);
}

/* =========================================================
   FUNÇÃO: gerarCamposEdicao()
   ---------------------------------------------------------
   Constrói, para cada disciplina, os campos de nota e
   faltas dos três trimestres. O nome da disciplina NÃO
   pode ser alterado.
   ========================================================= */
function gerarCamposEdicao() {
  const container = document.getElementById("campos-edicao");
  container.innerHTML = "";

  disciplinasAtuais.forEach((disc, indice) => {
    const bloco = document.createElement("div");
    bloco.className = "bloco-edicao";

    const titulo = document.createElement("h3");
    titulo.textContent = disc.disciplina;
    bloco.appendChild(titulo);

    const linhaNotas = document.createElement("div");
    linhaNotas.className = "linha-edicao";

    const linhaFaltas = document.createElement("div");
    linhaFaltas.className = "linha-edicao";

    [1, 2, 3].forEach((tri) => {
      const notaAtual = disc["n" + tri];
      const faltasAtual = obterFaltasTrimestre(disc, tri);

      // Campo de nota
      const labelNota = document.createElement("label");
      labelNota.textContent = `${tri}º Tri (nota)`;

      const inputNota = document.createElement("input");
      inputNota.type = "text";
      inputNota.inputMode = "decimal";
      inputNota.dataset.indice = indice;
      inputNota.dataset.trimestre = tri;
      inputNota.dataset.tipo = "nota";
      inputNota.value = notaAtual === null ? "" : formatarNota(notaAtual);
      inputNota.placeholder = "0 a 10";

      labelNota.appendChild(inputNota);
      linhaNotas.appendChild(labelNota);

      // Campo de faltas
      const labelFaltas = document.createElement("label");
      labelFaltas.textContent = `${tri}º Tri (faltas)`;

      const inputFaltas = document.createElement("input");
      inputFaltas.type = "text";
      inputFaltas.inputMode = "numeric";
      inputFaltas.dataset.indice = indice;
      inputFaltas.dataset.trimestre = tri;
      inputFaltas.dataset.tipo = "faltas";
      inputFaltas.value = String(faltasAtual);
      inputFaltas.placeholder = "0 ou mais";

      labelFaltas.appendChild(inputFaltas);
      linhaFaltas.appendChild(labelFaltas);
    });

    bloco.appendChild(linhaNotas);
    bloco.appendChild(linhaFaltas);

    container.appendChild(bloco);
  });
}

/* =========================================================
   FUNÇÃO: obterFaltasTrimestre(disc, tri)
   ---------------------------------------------------------
   As faltas por trimestre podem estar guardadas em
   disc.faltasOriginal como array. Se não existir, devolve 0.
   ========================================================= */
function obterFaltasTrimestre(disc, tri) {
  if (Array.isArray(disc.faltasOriginal)) {
    return disc.faltasOriginal[tri - 1] || 0;
  }
  if (tri === 1) return disc.faltas || 0;
  return 0;
}

/* =========================================================
   FUNÇÃO: abrirBoletim(pin)
   ---------------------------------------------------------
   Envia POST para a API com turma, número de chamada e PIN.
   ========================================================= */
async function abrirBoletim(pin) {
  const resposta = await fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/abrir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      turma: CONFIG_ALUNO.turma,
      numero_chamada: CONFIG_ALUNO.numeroChamada,
      pin: pin
    })
  });

  return resposta;
}

/* =========================================================
   FUNÇÃO: salvarBoletim(dados)
   ---------------------------------------------------------
   Envia PUT para a API com os dados atualizados.
   ========================================================= */
async function salvarBoletim(dados) {
  const resposta = await fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/salvar", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      turma: CONFIG_ALUNO.turma,
      numero_chamada: CONFIG_ALUNO.numeroChamada,
      pin: pinSessao,
      dados: { disciplinas: dados }
    })
  });

  return resposta;
}

/* =========================================================
   ACESSO — FORMULÁRIO DE PIN
   ========================================================= */
const formAcesso = document.getElementById("form-acesso");
const inputPin = document.getElementById("pin-estudante");
const mensagemAcesso = document.getElementById("mensagem-acesso");
const areaAcesso = document.getElementById("area-acesso");
const conteudoBoletim = document.getElementById("conteudo-boletim");

if (formAcesso) {
  formAcesso.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const pinDigitado = inputPin.value.trim();

    if (pinDigitado === "") {
      mensagemAcesso.textContent = "Digite seu PIN para entrar.";
      mensagemAcesso.className = "mensagem-erro";
      return;
    }

    mensagemAcesso.textContent = "Conectando...";
    mensagemAcesso.className = "";

    try {
      const resposta = await abrirBoletim(pinDigitado);

      if (resposta.status === 401) {
        mensagemAcesso.textContent = "Turma, chamada ou PIN inválidos.";
        mensagemAcesso.className = "mensagem-erro";
        return;
      }

      if (resposta.status === 429) {
        mensagemAcesso.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
        mensagemAcesso.className = "mensagem-erro";
        return;
      }

      if (!resposta.ok) {
        mensagemAcesso.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
        mensagemAcesso.className = "mensagem-erro";
        return;
      }

      const json = await resposta.json();

      pinSessao = pinDigitado;
      inputPin.value = "";

      aplicarDadosRecebidos(json);

      areaAcesso.hidden = true;
      conteudoBoletim.hidden = false;
      mensagemAcesso.textContent = "";
      mensagemAcesso.className = "";
    } catch (erro) {
      mensagemAcesso.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      mensagemAcesso.className = "mensagem-erro";
    }
  });
}

/* =========================================================
   FUNÇÃO: aplicarDadosRecebidos(json)
   ---------------------------------------------------------
   Regra: DADOS DA API > DADOS LOCAIS.
   Se a API devolver disciplinas, usa somente essas.
   Se devolver null, usa os dados fictícios do projeto.
   ========================================================= */
function aplicarDadosRecebidos(json) {
  let lista = null;

  if (
    json &&
    json.dados &&
    Array.isArray(json.dados.disciplinas) &&
    json.dados.disciplinas.length > 0
  ) {
    lista = json.dados.disciplinas.map((d) => ({
      disciplina: d.disciplina,
      tri1: d.tri1,
      tri2: d.tri2,
      tri3: d.tri3,
      faltas: Array.isArray(d.faltas) ? d.faltas.slice() : [d.faltas || 0]
    }));
  } else {
    lista = dadosBrutos.map((d) => ({
      disciplina: d.disciplina,
      tri1: d.tri1,
      tri2: d.tri2,
      tri3: d.tri3,
      faltas: d.faltas.slice()
    }));
  }

  const boletim = processarDisciplinas(lista);

  // Guarda as disciplinas com o formato usado pelo editor.
  disciplinasAtuais = boletim.map((d, i) => ({
    disciplina: d.disciplina,
    n1: d.n1,
    n2: d.n2,
    n3: d.n3,
    media: d.media,
    faltas: d.faltas,
    faltasOriginal: lista[i].faltas.slice(),
    situacao: d.situacao
  }));

  renderizarBoletim(disciplinasAtuais);
}

/* =========================================================
   EDIÇÃO — BOTÃO "ALTERAR DADOS"
   ========================================================= */
const botaoAlterarDados = document.getElementById("botao-alterar-dados");
const areaEdicao = document.getElementById("area-edicao");
const formEdicao = document.getElementById("form-edicao");
const botaoCancelarEdicao = document.getElementById("botao-cancelar-edicao");
const mensagemEdicao = document.getElementById("mensagem-edicao");

if (botaoAlterarDados) {
  botaoAlterarDados.addEventListener("click", () => {
    gerarCamposEdicao();
    areaEdicao.hidden = false;
    mensagemEdicao.textContent = "";
    mensagemEdicao.className = "";
    areaEdicao.scrollIntoView({ behavior: "smooth" });
  });
}

if (botaoCancelarEdicao) {
  botaoCancelarEdicao.addEventListener("click", () => {
    areaEdicao.hidden = true;
    mensagemEdicao.textContent = "";
    mensagemEdicao.className = "";
  });
}

/* =========================================================
   EDIÇÃO — SALVAR
   ========================================================= */
if (formEdicao) {
  formEdicao.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const inputs = document.querySelectorAll("#campos-edicao input");
    const atualizacoes = {};
    let invalido = false;

    inputs.forEach((input) => {
      input.classList.remove("campo-invalido");

      const indice = Number(input.dataset.indice);
      const tri = Number(input.dataset.trimestre);
      const tipo = input.dataset.tipo;

      if (!atualizacoes[indice]) {
        atualizacoes[indice] = { notas: {}, faltas: {} };
      }

      if (tipo === "nota") {
        const resultado = validarNotaDigitada(input.value);
        if (!resultado.valido) {
          input.classList.add("campo-invalido");
          invalido = true;
          return;
        }
        atualizacoes[indice].notas[tri] = resultado.valor;
      } else {
        const resultado = validarFaltasDigitadas(input.value);
        if (!resultado.valido) {
          input.classList.add("campo-invalido");
          invalido = true;
          return;
        }
        atualizacoes[indice].faltas[tri] = resultado.valor;
      }
    });

    if (invalido) {
      mensagemEdicao.textContent = "Existem campos inválidos. Corrija antes de salvar.";
      mensagemEdicao.className = "mensagem-erro";
      return;
    }

    // Aplica as atualizações em disciplinasAtuais.
    const novasDisciplinas = disciplinasAtuais.map((disc, i) => {
      const atual = atualizacoes[i] || { notas: {}, faltas: {} };

      const n1 = atual.notas[1] !== undefined ? atual.notas[1] : disc.n1;
      const n2 = atual.notas[2] !== undefined ? atual.notas[2] : disc.n2;
      const n3 = atual.notas[3] !== undefined ? atual.notas[3] : disc.n3;

      const f1 = atual.faltas[1] !== undefined ? atual.faltas[1] : obterFaltasTrimestre(disc, 1);
      const f2 = atual.faltas[2] !== undefined ? atual.faltas[2] : obterFaltasTrimestre(disc, 2);
      const f3 = atual.faltas[3] !== undefined ? atual.faltas[3] : obterFaltasTrimestre(disc, 3);

      const media = calcularMedia([n1, n2, n3]);
      const situacao = definirSituacao(media);

      return {
        disciplina: disc.disciplina,
        n1,
        n2,
        n3,
        media,
        faltas: f1 + f2 + f3,
        faltasOriginal: [f1, f2, f3],
        situacao
      };
    });

    const dadosParaSalvar = novasDisciplinas.map((d) => ({
      disciplina: d.disciplina,
      tri1: d.n1,
      tri2: d.n2,
      tri3: d.n3,
      faltas: d.faltasOriginal
    }));

    mensagemEdicao.textContent = "Salvando...";
    mensagemEdicao.className = "";

    try {
      const resposta = await salvarBoletim(dadosParaSalvar);

      if (resposta.status === 401) {
        mensagemEdicao.textContent = "Turma, chamada ou PIN inválidos.";
        mensagemEdicao.className = "mensagem-erro";
        return;
      }

      if (resposta.status === 429) {
        mensagemEdicao.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
        mensagemEdicao.className = "mensagem-erro";
        return;
      }

      if (!resposta.ok) {
        mensagemEdicao.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
        mensagemEdicao.className = "mensagem-erro";
        return;
      }

      disciplinasAtuais = novasDisciplinas;
      renderizarBoletim(disciplinasAtuais);

      mensagemEdicao.textContent = "Dados salvos com sucesso.";
      mensagemEdicao.className = "mensagem-sucesso";

      // Recria os campos com os valores atualizados.
      gerarCamposEdicao();
    } catch (erro) {
      mensagemEdicao.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      mensagemEdicao.className = "mensagem-erro";
    }
  });
}
const CONFIG_ALUNO = {
  turma: "8A",
  numeroChamada: 17,
  apiUrl: "https://boletim-api.profbt.com.br"
};
  