(() => {
  const RANKS = [
    { label: "Ás", short: "A", value: 1 },
    { label: "2", short: "2", value: 2 },
    { label: "3", short: "3", value: 3 },
    { label: "4", short: "4", value: 4 },
    { label: "5", short: "5", value: 5 },
    { label: "6", short: "6", value: 6 },
    { label: "7", short: "7", value: 7 },
    { label: "8", short: "8", value: 8 },
    { label: "9", short: "9", value: 9 },
    { label: "10", short: "10", value: 10 },
    { label: "Valete", short: "J", value: 11 },
    { label: "Rainha", short: "Q", value: 12 },
    { label: "Rei", short: "K", value: 13 }
  ];

  const SUITS = [
    { name: "Paus", short: "♣", multiplier: 1 },
    { name: "Ouros", short: "♦", multiplier: 2 },
    { name: "Espadas", short: "♠", multiplier: 3 },
    { name: "Copas", short: "♥", multiplier: 4 }
  ];
  
  function createDeck() {
    const deck = [];
    for (const r of RANKS) {
      for (const s of SUITS) {
        deck.push({
          rankLabel: r.label,
          rankShort: r.short,
          baseValue: r.value,
          suitName: s.name,
          suitShort: s.short,
          suitMultiplier: s.multiplier
        });
      }
    }
    return deck;
  }

  const deck = createDeck();
  
  let selectedCard = null;
  let revealed = false;
  let shopBalance = 0;
  const purchased = [];
  
  const btnDraw = document.getElementById("btnDraw");
  const btnReveal = document.getElementById("btnReveal");
  const btnReset = document.getElementById("btnReset");
  const drawStatus = document.getElementById("drawStatus");
  const cardVisual = document.getElementById("cardVisual");

  const selectedCardText = document.getElementById("selectedCardText");
  const baseValueEl = document.getElementById("baseValue");
  const suitMultiplierEl = document.getElementById("suitMultiplier");
  const totalValueEl = document.getElementById("totalValue");

  const shopBalanceEl = document.getElementById("shopBalance");
  const itemsGrid = document.getElementById("itemsGrid");
  const shopMsg = document.getElementById("shopMsg");
  const purchasedList = document.getElementById("purchasedList");
  const btnRestore = document.getElementById("btnRestore");
  const yearSpan = document.getElementById("year");
  
  function randInt(max) { return Math.floor(Math.random() * max); }
  function pickRandomCard() {
    return deck[randInt(deck.length)];
  }
  
  function calcCardTotal(card) {
    if (!card) return 0;
    const base = Number(card.baseValue);
    const mult = Number(card.suitMultiplier);
    return base * mult;
  }
  
  function resetUI() {
    selectedCard = null;
    revealed = false;
    shopBalance = 0;
    purchased.length = 0;
    purchasedList.innerHTML = "";
    btnReveal.disabled = true;
    btnRestore.disabled = true;

    drawStatus.textContent = "Nenhuma carta selecionada.";
    cardVisual.className = "card-visual card-back";
    cardVisual.textContent = "Verso do baralho";
    selectedCardText.textContent = "—";
    baseValueEl.textContent = "—";
    suitMultiplierEl.textContent = "—";
    totalValueEl.textContent = "—";
    shopBalanceEl.textContent = "0";
    shopMsg.textContent = "Revele uma carta para ativar a loja.";
    shopMsg.style.color = "";
    itemsGrid.querySelectorAll(".shop-item").forEach(si => {
      si.classList.remove("bought");
      si.querySelector(".buy").disabled = false;
    });
  }

  function afterDrawUI() {
    drawStatus.textContent = "Carta selecionada e guardada (ainda não revelada).";
    btnReveal.disabled = false;
    btnRestore.disabled = true;
    cardVisual.className = "card-visual card-back";
    cardVisual.textContent = "Verso do baralho";
    selectedCardText.textContent = "—";
    baseValueEl.textContent = "—";
    suitMultiplierEl.textContent = "—";
    totalValueEl.textContent = "—";
    shopBalanceEl.textContent = "0";
    shopMsg.textContent = "Revele a carta para ver valor e ativar a loja.";
    shopMsg.style.color = "";
  }

  function revealUI() {
    if (!selectedCard) return;
    revealed = true;
    cardVisual.className = "card-visual card-face";
    cardVisual.innerHTML = `
      <div style="font-size:1rem;">${selectedCard.rankShort} ${selectedCard.suitShort}</div>
      <div style="font-size:3rem; line-height:1;">${selectedCard.suitShort}</div>
      <div style="font-size:0.95rem; opacity:0.9;">${selectedCard.rankLabel} de ${selectedCard.suitName}</div>
    `;
    
    selectedCardText.textContent = `${selectedCard.rankLabel} de ${selectedCard.suitName}`;
    baseValueEl.textContent = String(selectedCard.baseValue);
    suitMultiplierEl.textContent = `${selectedCard.suitMultiplier}×`;

    const total = calcCardTotal(selectedCard);
    totalValueEl.textContent = String(total);
    
    shopBalance = total;
    shopBalanceEl.textContent = String(shopBalance);
    btnRestore.disabled = true;
    shopMsg.textContent = "Saldo carregado — agora você pode comprar itens.";
    shopMsg.style.color = "";
  }
  
  btnDraw.addEventListener("click", () => {
    selectedCard = pickRandomCard();
    revealed = false;
    shopBalance = 0;
    afterDrawUI();
  });

  btnReveal.addEventListener("click", () => {
    if (!selectedCard) return;
    revealUI();
    btnRestore.disabled = false;
  });

  btnReset.addEventListener("click", () => {
    resetUI();
  });
  
  itemsGrid.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".buy");
    if (!btn) return;
    const itemCard = btn.closest(".shop-item");
    const price = Number(itemCard.dataset.price || 0);
    const itemName = itemCard.querySelector("h4")?.textContent || "Item";
    
    if (!selectedCard || !revealed) {
      shopMsg.textContent = "Revele uma carta antes de comprar.";
      shopMsg.style.color = "#ffcccb";
      return;
    }

    if (shopBalance >= price) {
      shopBalance -= price;
      shopBalanceEl.textContent = String(shopBalance);

      purchased.push({ name: itemName, price: price });
      const li = document.createElement("li");
      li.textContent = `${itemName} — ${price} pts`;
      purchasedList.appendChild(li);
      
      btn.disabled = true;
      itemCard.classList.add("bought");
      shopMsg.textContent = `Compra realizada: ${itemName} por ${price} pts.`;
      shopMsg.style.color = "lightgreen";
      
      btnRestore.disabled = shopBalance > 0 ? true : false;
    } else {
      shopMsg.textContent = `Saldo insuficiente para ${itemName}. Você tem ${shopBalance} pts.`;
      shopMsg.style.color = "#ffb3b3";
    }
  });
  
  btnRestore.addEventListener("click", () => {
    if (!selectedCard || !revealed) return;
    shopBalance = calcCardTotal(selectedCard);
    shopBalanceEl.textContent = String(shopBalance);
    shopMsg.textContent = "Saldo restaurado ao valor total da carta.";
    shopMsg.style.color = "";
    btnRestore.disabled = true;
  });
  
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  
  resetUI();
  
  document.querySelectorAll(".topnav .nav-link").forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const href = a.getAttribute("href") || "";
      const id = href.replace("#", "");
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

})();

                          
