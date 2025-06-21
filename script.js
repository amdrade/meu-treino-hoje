document.addEventListener("DOMContentLoaded", () => {
  // --- ESTADO DA APLICAÇÃO ---
  let dadosTreino = JSON.parse(localStorage.getItem("dadosDeTreino")) || {};
  let historicoTreino =
    JSON.parse(localStorage.getItem("historicoDeTreino")) || {};

  // --- SELETORES DO DOM ---
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  // Aba Treinar
  const seletorTreino = document.getElementById("lista-treino-select");
  const containerTreino = document.getElementById("container-treino");
  const tituloExerciciosTreino = document.getElementById(
    "titulo-exercicios-treino"
  );

  // Aba Gerenciar
  const seletorGerenciamento = document.getElementById(
    "lista-gerenciamento-select"
  );
  const containerGerenciamento = document.getElementById(
    "container-gerenciamento"
  );
  const btnNovaLista = document.getElementById("btn-nova-lista");
  const btnDeletarLista = document.getElementById("btn-deletar-lista");
  const formExercicio = document.getElementById("form-exercicio");

  // Aba Histórico
  const containerHistorico = document.getElementById("container-historico");

  // --- FUNÇÕES AUXILIARES ---
  const getHojeFormatado = () => new Date().toISOString().split("T")[0];
  const salvarDados = () => {
    localStorage.setItem("dadosDeTreino", JSON.stringify(dadosTreino));
    localStorage.setItem("historicoDeTreino", JSON.stringify(historicoTreino));
  };

  // --- LÓGICA DAS ABAS ---
  const switchTab = (e) => {
    const targetTab = e.currentTarget.dataset.tab;

    tabButtons.forEach((btn) => btn.classList.remove("active"));
    e.currentTarget.classList.add("active");

    tabContents.forEach((content) => {
      content.id === targetTab
        ? content.classList.add("active")
        : content.classList.remove("active");
    });
  };

  // --- RENDERIZAÇÃO ---
  function renderizarPainelTreino() {
    const nomeLista = seletorTreino.value;
    const hoje = getHojeFormatado();
    const concluidosHoje = new Set(
      (historicoTreino[hoje] || [])
        .filter((ex) => ex.lista === nomeLista)
        .map((ex) => ex.nome)
    );
    containerTreino.innerHTML = "";

    // Se nenhuma lista for selecionada, reseta o título e encerra a função
    if (!nomeLista || !dadosTreino[nomeLista]) {
      tituloExerciciosTreino.textContent = "Exercícios:";
      return;
    }

    // Lógica do contador (NOVA)
    const totalExercicios = dadosTreino[nomeLista].length;
    const feitos = concluidosHoje.size;
    tituloExerciciosTreino.textContent = `Exercícios (${feitos}/${totalExercicios})`;

    // O resto da função continua igual, renderizando os cards
    (dadosTreino[nomeLista] || []).forEach((ex) => {
      const isConcluido = concluidosHoje.has(ex.nome);
      const card = document.createElement("div");
      card.className = `card-exercicio ${isConcluido ? "concluido" : ""}`;
      card.dataset.nomeExercicio = ex.nome;
      card.innerHTML = `
                <h4 class="nome-ex">${ex.nome}</h4>
                <p><strong>Carga:</strong> ${ex.carga}</p>
                <p><strong>Repetições:</strong> ${ex.repeticoes}</p>
                ${
                  ex.obs
                    ? `<p class="observacao"><strong>Obs:</strong> ${ex.obs}</p>`
                    : ""
                }
                <div class="card-actions">
                    <button class="btn-concluir">${
                      isConcluido ? "Desmarcar" : "Concluir"
                    }</button>
                </div>
            `;
      containerTreino.appendChild(card);
    });
  }

  function renderizarPainelGerenciamento() {
    const nomeLista = seletorGerenciamento.value;
    containerGerenciamento.innerHTML = "";
    formExercicio.style.display = nomeLista ? "block" : "none";

    if (!nomeLista) return;

    (dadosTreino[nomeLista] || []).forEach((ex, index) => {
      const card = document.createElement("div");
      card.className = "card-exercicio";
      card.dataset.index = index;
      card.innerHTML = `
                <h4>${ex.nome}</h4>
                <p><strong>Carga:</strong> ${ex.carga}</p>
                <p><strong>Repetições:</strong> ${ex.repeticoes}</p>
                ${
                  ex.obs
                    ? `<p class="observacao"><strong>Obs:</strong> ${ex.obs}</p>`
                    : ""
                }
                <div class="card-actions">
                    <button class="btn-editar">Editar</button>
                    <button class="btn-excluir-item">Excluir</button>
                </div>
            `;
      containerGerenciamento.appendChild(card);
    });
  }

  function renderizarHistorico() {
    containerHistorico.innerHTML = "";
    const datas = Object.keys(historicoTreino).sort().reverse();
    if (datas.length === 0) {
      containerHistorico.innerHTML = "<p>Nenhum treino registrado.</p>";
      return;
    }

    datas.forEach((data) => {
      const treinosDoDia = historicoTreino[data].reduce((acc, ex) => {
        acc[ex.lista] = acc[ex.lista] || [];
        acc[ex.lista].push(ex);
        return acc;
      }, {});

      const dataFormatada = new Date(data + "T12:00:00").toLocaleDateString(
        "pt-BR",
        { day: "2-digit", month: "long", year: "numeric" }
      );
      const divDia = document.createElement("div");
      divDia.className = "historico-dia";
      let htmlInterno = `<h3>${dataFormatada}</h3>`;

      for (const nomeLista in treinosDoDia) {
        const exerciciosFeitos = treinosDoDia[nomeLista];
        const totalExerciciosNaLista = dadosTreino[nomeLista]?.length || 0;
        htmlInterno += `
                    <h4>${nomeLista}
                        <span class="historico-progresso">(${exerciciosFeitos.length}/${totalExerciciosNaLista} concluídos)</span>
                    </h4>`;
        exerciciosFeitos.forEach((ex) => {
          htmlInterno += `<div class="item-historico"><span><strong>${ex.nome}</strong></span><span>${ex.carga} / ${ex.repeticoes}</span></div>`;
        });
      }
      divDia.innerHTML = htmlInterno;
      containerHistorico.appendChild(divDia);
    });
  }

  function atualizarSeletoresDeListas() {
    const listaNomes = Object.keys(dadosTreino);
    const optionsHtml = listaNomes
      .map((nome) => `<option value="${nome}">${nome}</option>`)
      .join("");

    seletorTreino.innerHTML =
      '<option value="">-- Selecione um Treino --</option>' + optionsHtml;
    seletorGerenciamento.innerHTML =
      '<option value="">-- Selecione para Editar --</option>' + optionsHtml;
  }

  // --- MANIPULADORES DE EVENTOS ---

  // Aba Gerenciar
  btnNovaLista.onclick = () => {
    const nome = prompt("Nome da nova lista de treino:");
    if (nome && !dadosTreino[nome]) {
      dadosTreino[nome] = [];
      salvarDados();
      atualizarSeletoresDeListas();
      seletorGerenciamento.value = nome;
      renderizarPainelGerenciamento();
    } else if (dadosTreino[nome]) alert("Lista já existe.");
  };

  btnDeletarLista.onclick = () => {
    const nome = seletorGerenciamento.value;
    if (nome && confirm(`Deletar a lista "${nome}" permanentemente?`)) {
      delete dadosTreino[nome];
      salvarDados();
      atualizarSeletoresDeListas();
      renderizarPainelGerenciamento();
      renderizarPainelTreino();
      renderizarHistorico();
    }
  };

  formExercicio.onsubmit = (e) => {
    e.preventDefault();
    const nomeLista = seletorGerenciamento.value;
    if (!nomeLista) return;

    dadosTreino[nomeLista].push({
      nome: document.getElementById("nome-exercicio").value,
      carga: document.getElementById("carga-exercicio").value,
      repeticoes: document.getElementById("repeticoes-exercicio").value,
      obs: document.getElementById("obs-exercicio").value,
    });
    salvarDados();
    renderizarPainelGerenciamento();
    formExercicio.reset();
  };

  containerGerenciamento.onclick = (e) => {
    const card = e.target.closest(".card-exercicio");
    if (!card) return;

    const nomeLista = seletorGerenciamento.value;
    const index = parseInt(card.dataset.index);
    const exercicio = dadosTreino[nomeLista][index];

    if (e.target.classList.contains("btn-excluir-item")) {
      if (confirm(`Excluir o exercício "${exercicio.nome}" da lista?`)) {
        dadosTreino[nomeLista].splice(index, 1);
      }
    }
    if (e.target.classList.contains("btn-editar")) {
      exercicio.nome =
        prompt("Nome do exercício:", exercicio.nome) || exercicio.nome;
      exercicio.carga = prompt("Carga:", exercicio.carga) || exercicio.carga;
      exercicio.repeticoes =
        prompt("Repetições:", exercicio.repeticoes) || exercicio.repeticoes;
      exercicio.obs = prompt("Observação:", exercicio.obs) || exercicio.obs;
    }
    salvarDados();
    renderizarPainelGerenciamento();
  };

  // Aba Treinar
  containerTreino.onclick = (e) => {
    if (!e.target.classList.contains("btn-concluir")) return;

    const card = e.target.closest(".card-exercicio");
    const nomeLista = seletorTreino.value;
    const nomeExercicio = card.dataset.nomeExercicio;
    const exercicioDef = dadosTreino[nomeLista].find(
      (ex) => ex.nome === nomeExercicio
    );
    const hoje = getHojeFormatado();

    historicoTreino[hoje] = historicoTreino[hoje] || [];
    const indiceNoHistorico = historicoTreino[hoje].findIndex(
      (ex) => ex.nome === nomeExercicio && ex.lista === nomeLista
    );

    if (indiceNoHistorico > -1) {
      historicoTreino[hoje].splice(indiceNoHistorico, 1);
    } else {
      historicoTreino[hoje].push({ ...exercicioDef, lista: nomeLista });
    }
    salvarDados();
    renderizarPainelTreino();
    renderizarHistorico();
  };

  // --- INICIALIZAÇÃO ---
  tabButtons.forEach((btn) => btn.addEventListener("click", switchTab));
  seletorTreino.onchange = renderizarPainelTreino;
  seletorGerenciamento.onchange = renderizarPainelGerenciamento;

  atualizarSeletoresDeListas();
  renderizarPainelTreino();
  renderizarPainelGerenciamento();
  renderizarHistorico();
});
