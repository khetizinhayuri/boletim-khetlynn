
/* =========================================================
   GRÁFICOS DO BOLETIM DIGITAL
   ========================================================= */

let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

function renderizarGraficos(boletim) {

  // Verifica se a biblioteca Chart.js foi carregada
  if (typeof Chart === "undefined") {
    console.error("Chart.js não foi carregado.");
    return;
  }

  const roxo = "#7041a6";
  const lilas = "#c388fd";

  const disciplinas = boletim.map(d => d.disciplina);
  const medias = boletim.map(d => d.media);

  const faltasPorTrimestre = [1, 2, 3].map(tri =>
    boletim.reduce((total, disc) =>
      total + obterFaltasTrimestre(disc, tri), 0
    )
  );

  const mediasTrimestres = [1, 2, 3].map(tri => {
    const notas = boletim
      .map(d => d["n" + tri])
      .filter(n => n !== null);

    return notas.length
      ? notas.reduce((a, b) => a + b, 0) / notas.length
      : null;
  });

  // Destrói gráficos anteriores
  [graficoMedias, graficoEvolucao, graficoFaltas]
    .forEach(g => {
      if (g) g.destroy();
    });

  // GRÁFICO 1 — MÉDIAS POR DISCIPLINA
  graficoMedias = new Chart(
    document.getElementById("graficoMediasDisciplinas"),
    {
      type: "bar",
      data: {
        labels: disciplinas,
        datasets: [{
          label: "Média",
          data: medias,
          backgroundColor: medias.map(m =>
            m === null ? "#d8c2ef" :
            m >= 6 ? roxo : lilas
          ),
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            min: 0,
            max: 10
          }
        }
      }
    }
  );

  // GRÁFICO 2 — EVOLUÇÃO TRIMESTRAL
  graficoEvolucao = new Chart(
    document.getElementById("graficoEvolucaoTrimestres"),
    {
      type: "line",
      data: {
        labels: ["1º Trimestre", "2º Trimestre", "3º Trimestre"],
        datasets: [{
          label: "Média geral",
          data: mediasTrimestres,
          borderColor: roxo,
          backgroundColor: lilas,
          pointBackgroundColor: roxo,
          tension: 0.3,
          spanGaps: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 10
          }
        }
      }
    }
  );

  // GRÁFICO 3 — FALTAS POR TRIMESTRE
  graficoFaltas = new Chart(
    document.getElementById("graficoFaltasTrimestres"),
    {
      type: "bar",
      data: {
        labels: ["1º Trimestre", "2º Trimestre", "3º Trimestre"],
        datasets: [{
          label: "Faltas",
          data: faltasPorTrimestre,
          backgroundColor: [roxo, lilas, "#a985d1"],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    }
  );
}
 
apiUrl: "https://boletim-api.profbt.com.br"