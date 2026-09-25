/* =========================================================
   DADOS FICTÍCIOS — 8º ANO
   ========================================================= */
// "array" = lista; cada item é um "objeto" (conjunto de dados)
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
   Regras:
   - vazio / null / undefined → null (nota não lançada)
   - 0 a 10 → mantém
   - >10 até 100 → divide por 10
   - aceita ponto ou vírgula
   - fora das regras → null (inválida)
   ========================================================= */
function normalizarNota(valor) {
  // Nota ausente
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Se for texto, troca vírgula por ponto
  let numero;
  if (typeof valor === "string") {
    numero = parseFloat(valor.replace(",", "."));
  } else {
    numero = Number(valor);
  }

  // Se não for número válido, retorna null
  if (isNaN(numero)) {
    return null;
  }

  // Regras de escala
  if (numero >= 0 && numero <= 10) {
    return numero;
  }
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  // Fora das regras
  return null;
}

/* =========================================================
   FUNÇÃO: formatarNota(nota)
   ---------------------------------------------------------
   Mostra a nota com uma casa decimal ou o texto padrão
   quando ainda não foi lançada.
   ========================================================= */
function formatarNota(nota) {
  if (nota === null) return "—";
  return nota.toFixed(1).replace(".", ",");
}

/* =========================================================
   FUNÇÃO: calcularMedia(notas)
   ---------------------------------------------------------
   Recebe um array de notas (já normalizadas) e calcula a
   média usando SOMENTE as notas disponíveis.
   Nota ausente nunca vira zero.
   ========================================================= */
function calcularMedia(notas) {
  const disponiveis = notas.filter((n) => n !== null);
  if (disponiveis.length === 0) return null;

  const soma = disponiveis.reduce((total, n) => total + n, 0);
  return soma / disponiveis.length;
}

/* =========================================================
   FUNÇÃO: somarFaltas(lista)
   ---------------------------------------------------------
   Soma todos os números inteiros de faltas.
   ========================================================= */
function somarFaltas(lista) {
  return lista.reduce((total, n) => total + n, 0);
}

/* =========================================================
   FUNÇÃO: definirSituacao(media)
   ---------------------------------------------------------
   Define a situação com base na média disponível.
   ========================================================= */
function definirSituacao(media) {
  if (media === null) return { texto: "Nota ainda não disponível", classe: "indisponivel" };
  if (media >= MEDIA_MINIMA) return { texto: "Bom desempenho", classe: "bom" };
  return { texto: "Atenção", classe: "atencao" };
}

/* =========================================================
   PROCESSAMENTO DOS DADOS
   ---------------------------------------------------------
   Para cada disciplina, normaliza as notas, calcula média
   e soma faltas. Gera um novo array "boletim".
   ========================================================= */
const boletim = dadosBrutos.map((item) => {
  const n1 = normalizarNota(item.tri1);
  const n2 = normalizarNota(item.tri2);
  const n3 = normalizarNota(item.tri3);

  const media = calcularMedia([n1, n2, n3]);
  const faltas = somarFaltas(item.faltas);
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

/* =========================================================
   MONTAR A TABELA
   ========================================================= */
const corpoTabela = document.getElementById("corpo-tabela");

// "forEach" = percorre cada item do array
boletim.forEach((linha) => {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${linha.disciplina}</td>
    <td>${linha.n1 === null ? "Ainda não lançada" : formatarNota(linha.n1)}</td>
    <td>${linha.n2 === null ? "Ainda não lançada" : formatarNota(linha.n2)}</td>
    <td>${linha.n3 === null ? "Ainda não lançada" : formatarNota(linha.n3)}</td>
    <td><strong>${formatarNota(linha.media)}</strong></td>
    <td>${linha.faltas}</td>
    <td><span class="badge ${linha.situacao.classe}">${linha.situacao.texto}</span></td>
  `;

  corpoTabela.appendChild(tr);
});

/* =========================================================
   MONTAR OS CARDS DE RESUMO
   ========================================================= */
const areaCards = document.getElementById("cards");

// Média geral (considerando apenas disciplinas com média disponível)
const mediasDisponiveis = boletim
  .map((d) => d.media)
  .filter((m) => m !== null);
const mediaGeral =
  mediasDisponiveis.length > 0
    ? mediasDisponiveis.reduce((t, m) => t + m, 0) / mediasDisponiveis.length
    : null;

// Total de faltas
const totalFaltas = boletim.reduce((t, d) => t + d.faltas, 0);

// Disciplinas com bom desempenho
const comBomDesempenho = boletim.filter(
  (d) => d.situacao.classe === "bom"
).length;

// Disciplinas que precisam de atenção
const comAtencao = boletim.filter(
  (d) => d.situacao.classe === "atencao"
).length;

// Frequência FICTÍCIA — apenas demonstrativa nesta etapa.
// No futuro será calculada de outra forma (não a partir das faltas).
const frequenciaDemonstrativa = 92;

// Lista de cards
const cards = [
  { titulo: "Média geral", valor: formatarNota(mediaGeral) },
  { titulo: "Total de faltas", valor: totalFaltas },
  { titulo: "Bom desempenho", valor: comBomDesempenho + " disciplinas" },
  { titulo: "Precisam de atenção", valor: comAtencao + " disciplinas" },
  {
    titulo: "Frequência",
    valor: frequenciaDemonstrativa + "%",
    extra: "Frequência adequada"
  }
];

// Cria cada card na tela
cards.forEach((c) => {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <h3>${c.titulo}</h3>
    <p>${c.valor}</p>
    ${c.extra ? `<small>${c.extra}</small>` : ""}
  `;
  areaCards.appendChild(div);
});