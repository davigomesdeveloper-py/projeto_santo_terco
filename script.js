/* ===== Tag <carrossel-item> =====
   Cada slide lê seus atributos (imagem, alt, texto)
   e monta o HTML interno: imagem em cima, texto embaixo.
   O atributo "titulo" não é desenhado aqui: quem usa é o carrossel. */
class CarrosselItem extends HTMLElement {
  connectedCallback() {
    const imagem = this.getAttribute("imagem");
    const alt = this.getAttribute("alt") || "";
    const texto = this.getAttribute("texto");

    this.innerHTML = `
      ${imagem ? `<img src="${imagem}" alt="${alt}">` : ""}
      ${texto ? `<div class="legenda">${texto}</div>` : ""}
    `;
  }
}

/* ===== Tag <meu-carrossel> =====
   Controla a faixa de slides, a barra de controles e o autoplay. */
class MeuCarrossel extends HTMLElement {
  connectedCallback() {
    this.indice = 0; // posição do slide atual (começa no primeiro)

    // Pega todos os slides que foram colocados dentro da tag
    this.slides = Array.from(this.querySelectorAll("carrossel-item"));

    this.montarEstrutura();
    this.ativarEventos();
    this.irPara(0);

    // Se a tag tiver o atributo "autoplay", começa a trocar sozinho
    if (this.hasAttribute("autoplay")) {
      this.iniciarAutoplay();
    }
  }

  // Quando a tag sai da página, para o timer (evita vazamento de memória)
  disconnectedCallback() {
    this.pararAutoplay();
  }

  // Cria o cartão com os slides e a barra de controles
  montarEstrutura() {
    // Cartão: a moldura que mostra um slide por vez
    const cartao = document.createElement("div");
    cartao.className = "carrossel-cartao";

    // Faixa: todos os slides ficam lado a lado dentro dela
    this.faixa = document.createElement("div");
    this.faixa.className = "carrossel-faixa";
    this.slides.forEach((slide) => this.faixa.appendChild(slide));
    cartao.appendChild(this.faixa);

    // Barra de controles (fica abaixo do cartão)
    const controles = document.createElement("div");
    controles.className = "carrossel-controles";

    // Botão "anterior"
    this.botaoAnterior = document.createElement("button");
    this.botaoAnterior.className = "carrossel-botao";
    this.botaoAnterior.setAttribute("aria-label", "Slide anterior");
    this.botaoAnterior.textContent = "‹";

    // Círculo com o número do slide
    this.numero = document.createElement("div");
    this.numero.className = "carrossel-numero";

    // Título do slide atual (aria-live avisa leitores de tela quando muda)
    this.titulo = document.createElement("div");
    this.titulo.className = "carrossel-titulo";
    this.titulo.setAttribute("aria-live", "polite");

    // Botão "próximo"
    this.botaoProximo = document.createElement("button");
    this.botaoProximo.className = "carrossel-botao";
    this.botaoProximo.setAttribute("aria-label", "Próximo slide");
    this.botaoProximo.textContent = "›";

    controles.append(
      this.botaoAnterior,
      this.numero,
      this.titulo,
      this.botaoProximo
    );

    // Limpa a tag e coloca a nova estrutura
    this.innerHTML = "";
    this.append(cartao, controles);
  }

  // Liga cliques, teclado, mouse e toque
  ativarEventos() {
    this.botaoAnterior.addEventListener("click", () => this.anterior());
    this.botaoProximo.addEventListener("click", () => this.proximo());

    // Setas do teclado (o carrossel precisa estar com foco)
    this.tabIndex = 0;
    this.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") this.anterior();
      if (e.key === "ArrowRight") this.proximo();
    });

    // Pausa o autoplay enquanto o mouse está em cima
    this.addEventListener("mouseenter", () => this.pararAutoplay());
    this.addEventListener("mouseleave", () => {
      if (this.hasAttribute("autoplay")) this.iniciarAutoplay();
    });

    // Arrastar o dedo no celular (swipe)
    let inicioX = 0;
    this.addEventListener("touchstart", (e) => {
      inicioX = e.touches[0].clientX;
    });
    this.addEventListener("touchend", (e) => {
      const diferenca = e.changedTouches[0].clientX - inicioX;
      if (diferenca > 50) this.anterior();  // arrastou para a direita
      if (diferenca < -50) this.proximo();  // arrastou para a esquerda
    });
  }

  // Vai para um slide específico
  irPara(i) {
    const total = this.slides.length;
    // O resto da divisão faz o carrossel "dar a volta" (do último vai ao primeiro)
    this.indice = (i + total) % total;

    // Move a faixa para a esquerda: 0%, -100%, -200%...
    this.faixa.style.transform = `translateX(-${this.indice * 100}%)`;

    // Atualiza o número (1º, 2º...) e o título na barra de controles
    this.numero.textContent = `${this.indice + 1}º`;
    this.titulo.textContent =
      this.slides[this.indice].getAttribute("titulo") || "";
  }

  proximo() {
    this.irPara(this.indice + 1);
  }

  anterior() {
    this.irPara(this.indice - 1);
  }

  // Troca de slide a cada X milissegundos
  iniciarAutoplay() {
    this.pararAutoplay(); // garante que não existem dois timers
    const intervalo = Number(this.getAttribute("intervalo")) || 4000;
    this.timer = setInterval(() => this.proximo(), intervalo);
  }

  pararAutoplay() {
    clearInterval(this.timer);
  }
}

/* ===== Registro das tags =====
   Ensina ao navegador que <carrossel-item> e <meu-carrossel> existem.
   O nome de uma tag personalizada sempre precisa ter um hífen. */
customElements.define("carrossel-item", CarrosselItem);
customElements.define("meu-carrossel", MeuCarrossel);

const botoesMisterio = document.querySelectorAll(".misterio-botao");
 
// Marca um botão como selecionado e tira a marca dos outros
function selecionarMisterio(botaoEscolhido) {
  botoesMisterio.forEach((botao) => {
    botao.classList.remove("ativo");        // tira a linha embaixo
    botao.removeAttribute("aria-current");  // avisa leitores de tela
  });
 
  botaoEscolhido.classList.add("ativo");    // coloca a linha no escolhido
  botaoEscolhido.setAttribute("aria-current", "true");
 
  // Guarda o mistério escolhido no <body>: <body data-misterio="dolorosos">
  // No futuro, o CSS e o JS usam isso para trocar fundo, imagens e textos.
  document.body.dataset.misterio = botaoEscolhido.dataset.misterio;
}
 
// Ao clicar em um botão, seleciona ele
botoesMisterio.forEach((botao) => {
  botao.addEventListener("click", () => selecionarMisterio(botao));
});
 
// Ao abrir a página, aplica o mistério que já vem marcado no HTML
selecionarMisterio(document.querySelector(".misterio-botao.ativo"));