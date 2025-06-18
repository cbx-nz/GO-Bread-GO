let breadcoins = 0;
let totalClicks = 0;
let toasters = 0;
let factories = 0;
let toasterCost = 10;
let factoryCost = 100;
let toasterLevel = 1;
let factoryLevel = 1;
let toasterBaseProduction = 1;
let factoryBaseProduction = 5;
let toasterUpgradeCost = 100;
let factoryUpgradeCost = 500;
let prestigePoints = 0;
let prestigeMultiplier = 1;
let lifetimeBreadcoins = 0;
let customers = 0;
let totalBreadcoinsEarned = 0;
let demandRate = 1;
let customerBreadPrice = 1;
let marketingLevel = 0;
let marketingCost = 200;
let marketingEffect = 0.5;
const prestigeThreshold = 10000;
const logMax = 100;

// Marketing Campaigns & Events
let adCampaigns = [];
const adTypes = [
  {
    name: "Billboard",
    cost: 500,
    baseEffect: 2,
    duration: 30, // seconds
    emoji: "🪧"
  },
  {
    name: "Online Ads",
    cost: 1200,
    baseEffect: 4,
    duration: 45,
    emoji: "💻"
  },
  {
    name: "Influencer Deal",
    cost: 5000,
    baseEffect: 10,
    duration: 90,
    emoji: "🤳"
  }
];
// PR disasters
let prDisasterActive = false;
let prDisasterTimer = 0;
let prDisasterDuration = 0;
let prDisasterEffect = 0;

// Cheat menu: Only enabled for local files
let cheatsEnabled = (location.protocol === 'file:');
const incomeTaxCode = ['i', 'n', 'c'];
window._incomeTaxKeyIndex = 0;

function updateDisplay() {
  document.getElementById("breadcoins").textContent = Math.floor(breadcoins);
  document.getElementById("toasters").textContent = toasters;
  document.getElementById("factories").textContent = factories;
  document.getElementById("toasterCost").textContent = toasterCost;
  document.getElementById("factoryCost").textContent = factoryCost;
  document.getElementById("toasterLevel").textContent = toasterLevel;
  document.getElementById("factoryLevel").textContent = factoryLevel;
  document.getElementById("toasterUpgradeCost").textContent = toasterUpgradeCost;
  document.getElementById("factoryUpgradeCost").textContent = factoryUpgradeCost;
  document.getElementById("crumbs").textContent = prestigePoints;
  document.getElementById("prestigeMult").textContent = prestigeMultiplier.toFixed(2) + "x";
  document.getElementById("marketingLevel").textContent = marketingLevel;
  document.getElementById("marketingCost").textContent = marketingCost;
  updateStats();
  updateAdCampaignsDisplay();
  updatePRDisasterDisplay();
  updateCheatMenu(false); // Don't overwrite the cheat menu input fields while typing
}

function makeBreadcoin() {
  breadcoins += 1;
  totalBreadcoinsEarned += 1;
  totalClicks += 1;
  lifetimeBreadcoins += 1;

  if (totalClicks === 1) log("You kneaded your first Breadcoin!");

  updateDisplay();
}

function buyMarketing() {
  if (breadcoins >= marketingCost) {
    breadcoins -= marketingCost;
    marketingLevel++;
    demandRate = 1 + (marketingLevel * marketingEffect) + getActiveAdEffect();
    marketingCost = Math.floor(marketingCost * 2);
    log(`Launched Marketing Campaign Level ${marketingLevel}.`);
    updateDisplay();
  } else {
    log("Not enough Breadcoins for marketing.");
  }
}

// Buy Ad Campaign
function buyAdCampaign(typeIdx) {
  const type = adTypes[typeIdx];
  if (!type) return;
  if (breadcoins >= type.cost) {
    breadcoins -= type.cost;
    adCampaigns.push({
      typeIdx,
      name: type.name,
      effect: type.baseEffect,
      timer: type.duration,
      emoji: type.emoji
    });
    log(`${type.emoji} ${type.name} started! +${type.baseEffect} demand for ${type.duration}s`);
    updateDisplay();
  } else {
    log(`Not enough Breadcoins for ${type.name}.`);
  }
}

// Ad Campaigns decay
function processAdCampaigns() {
  if (adCampaigns.length === 0) return;
  for (let i = adCampaigns.length - 1; i >= 0; i--) {
    adCampaigns[i].timer--;
    if (adCampaigns[i].timer <= 0) {
      log(`${adCampaigns[i].emoji} ${adCampaigns[i].name} ended.`);
      adCampaigns.splice(i, 1);
    }
  }
}

// Ad Campaigns effect
function getActiveAdEffect() {
  return adCampaigns.reduce((sum, a) => sum + a.effect, 0);
}

// PR Disaster random event
function tryPRDisaster() {
  // 2% chance per tick, only if not already active
  if (!prDisasterActive && Math.random() < 0.02) {
    prDisasterActive = true;
    prDisasterDuration = 10 + Math.floor(Math.random() * 11); // 10-20 seconds
    prDisasterTimer = prDisasterDuration;
    prDisasterEffect = 0.3 + Math.random() * 0.4; // 30-70% decrease
    log(`😱 PR Disaster! Demand drops by ${(prDisasterEffect * 100).toFixed(0)}% for ${prDisasterDuration}s!`);
  }
}

function processPRDisaster() {
  if (prDisasterActive) {
    prDisasterTimer--;
    if (prDisasterTimer <= 0) {
      prDisasterActive = false;
      prDisasterDuration = 0;
      prDisasterEffect = 0;
      log("🎉 PR Disaster is over! Demand returns to normal.");
    }
  }
}

function updateStats() {
  document.getElementById("statCustomers").textContent = customers;
  document.getElementById("statBreadcoins").textContent = breadcoins.toFixed(1);
  document.getElementById("statTotalEarned").textContent = lifetimeBreadcoins.toFixed(1);
  document.getElementById("statTotalClicks").textContent = totalClicks;
  document.getElementById("statToasters").textContent = toasters;
  document.getElementById("statToasterLevel").textContent = toasterLevel;
  document.getElementById("statFactories").textContent = factories;
  document.getElementById("statFactoryLevel").textContent = factoryLevel;
  document.getElementById("statCrumbs").textContent = prestigePoints;
  document.getElementById("statPrestigeMult").textContent = prestigeMultiplier.toFixed(2) + "x";
  document.getElementById("statMarketingLevel").textContent = marketingLevel;
  document.getElementById("statDemandRate").textContent = getDemandRate().toFixed(2);
  document.getElementById("statAdEffect").textContent = getActiveAdEffect().toFixed(2);
  document.getElementById("statPRDisaster").textContent = prDisasterActive
    ? `-${(prDisasterEffect * 100).toFixed(0)}% (${prDisasterTimer}s)`
    : "None";
  document.getElementById("statBPS").textContent = getBPS().toFixed(2);
}

function getDemandRate() {
  let base = 1 + (marketingLevel * marketingEffect) + getActiveAdEffect();
  if (prDisasterActive) {
    base *= (1 - prDisasterEffect);
  }
  return base;
}

function getBPS() {
  return (
    (toasters * toasterLevel * toasterBaseProduction) +
    (factories * factoryLevel * factoryBaseProduction)
  ) * prestigeMultiplier;
}

function log(msg) {
  const logEl = document.getElementById("log");
  const timestamp = new Date().toLocaleTimeString();
  const entry = `[${timestamp}] ${msg}`;
  logEl.innerHTML = `${entry}<br>` + logEl.innerHTML.split('<br>').slice(0, logMax).join('<br>');
}

// ---------- Save/Load/Reset ----------
function saveGame() {
  const state = {
    breadcoins, toasters, factories, toasterCost, factoryCost,
    toasterLevel, factoryLevel, toasterUpgradeCost, factoryUpgradeCost,
    prestigePoints, prestigeMultiplier, lifetimeBreadcoins,
    totalClicks, totalBreadcoinsEarned, customers,
    marketingLevel, marketingCost, adCampaigns,
    prDisasterActive, prDisasterTimer, prDisasterDuration, prDisasterEffect
  };
  localStorage.setItem("breadcoinSave", JSON.stringify(state));
  log("Game saved.");
}

function loadGame() {
  const data = localStorage.getItem("breadcoinSave");
  if (data) {
    const state = JSON.parse(data);
    breadcoins = state.breadcoins ?? 0;
    toasters = state.toasters ?? 0;
    factories = state.factories ?? 0;
    toasterCost = state.toasterCost ?? 10;
    factoryCost = state.factoryCost ?? 100;
    toasterLevel = state.toasterLevel ?? 1;
    factoryLevel = state.factoryLevel ?? 1;
    toasterUpgradeCost = state.toasterUpgradeCost ?? 100;
    factoryUpgradeCost = state.factoryUpgradeCost ?? 500;
    prestigePoints = state.prestigePoints ?? 0;
    prestigeMultiplier = state.prestigeMultiplier ?? 1;
    lifetimeBreadcoins = state.lifetimeBreadcoins ?? 0;
    totalClicks = state.totalClicks ?? 0;
    totalBreadcoinsEarned = state.totalBreadcoinsEarned ?? 0;
    customers = state.customers ?? 0;
    marketingLevel = state.marketingLevel ?? 0;
    marketingCost = state.marketingCost ?? 200;
    adCampaigns = state.adCampaigns ?? [];
    prDisasterActive = state.prDisasterActive ?? false;
    prDisasterTimer = state.prDisasterTimer ?? 0;
    prDisasterDuration = state.prDisasterDuration ?? 0;
    prDisasterEffect = state.prDisasterEffect ?? 0;
    updateDisplay();
    log("Game loaded.");
  } else log("No save found.");
}

function resetGame() {
  if (confirm("Are you sure you want to reset the game?")) {
    localStorage.removeItem("breadcoinSave");
    location.reload();
  }
}

function checkPrestigeUnlock() {
  if (breadcoins >= prestigeThreshold) {
    document.getElementById("prestigeSection").style.display = "block";
  }
}

function prestige() {
  if (breadcoins < prestigeThreshold) {
    log("You need at least " + prestigeThreshold + " Breadcoins to prestige.");
    return;
  }

  prestigePoints++;
  prestigeMultiplier = 1 + (prestigePoints * 0.2);
  log(`You prestiged! Crumbs: ${prestigePoints}, Multiplier: ${prestigeMultiplier.toFixed(2)}x`);

  breadcoins = 0;
  toasters = 0;
  factories = 0;
  toasterCost = 10;
  factoryCost = 100;
  toasterLevel = 1;
  factoryLevel = 1;
  toasterUpgradeCost = 100;
  factoryUpgradeCost = 500;
  customers = 0;
  marketingLevel = 0;
  marketingCost = 200;
  adCampaigns = [];
  prDisasterActive = false;
  prDisasterTimer = 0;
  prDisasterDuration = 0;
  prDisasterEffect = 0;

  updateDisplay();
  saveGame();
}

// ---------- Production & Customers Tick ----------
setInterval(() => {
  // Update demand rate (includes ads and disasters)
  const demand = Math.floor(Math.random() * (factories + 1) * getDemandRate());
  customers += demand;

  // Production
  const production = getBPS();
  breadcoins += production;
  lifetimeBreadcoins += production;

  // Sell to customers
  const sales = Math.min(customers, Math.floor(production / 2));
  const income = sales * customerBreadPrice;

  breadcoins += income;
  lifetimeBreadcoins += income;
  customers -= sales;

  if (sales > 0) log(`Sold ${sales} bread to ${sales} customers for ${income} Breadcoins.`);

  // Ad Campaigns
  processAdCampaigns();

  // PR Disasters
  tryPRDisaster();
  processPRDisaster();

  updateDisplay();
  checkPrestigeUnlock();
}, 1000);

setInterval(saveGame, 30000);
document.addEventListener("DOMContentLoaded", loadGame);

// ---------- Ad Campaigns UI ----------
function updateAdCampaignsDisplay() {
  let adDiv = document.getElementById("adCampaignsDiv");
  if (!adDiv) {
    // Create UI only if not present
    adDiv = document.createElement("div");
    adDiv.className = "store";
    adDiv.id = "adCampaignsDiv";
    adDiv.innerHTML = `
      <h3>📢 Ad Campaigns</h3>
      <div id="activeAdsList"></div>
      <div id="adButtons"></div>
    `;
    // Insert before/after other UI
    const container = document.querySelector(".container > div");
    container.insertBefore(adDiv, container.children[2]);
  }
  // Active ads list
  const activeAdsList = adCampaigns.length
    ? adCampaigns.map(a =>
      `${adTypes[a.typeIdx].emoji} <strong>${a.name}</strong> (${a.timer}s left, +${a.effect} demand)`
    ).join("<br>")
    : "<em>No active campaigns.</em>";
  document.getElementById("activeAdsList").innerHTML = activeAdsList;

  // Ad buttons
  let adBtns = "";
  for (let i = 0; i < adTypes.length; i++) {
    const ad = adTypes[i];
    adBtns += `<button onclick="buyAdCampaign(${i})">${ad.emoji} ${ad.name} (Cost: ${ad.cost}, +${ad.baseEffect} demand, ${ad.duration}s)</button><br>`;
  }
  document.getElementById("adButtons").innerHTML = adBtns;
}

// ---------- PR Disaster UI ----------
function updatePRDisasterDisplay() {
  let prDiv = document.getElementById("prDisasterDiv");
  if (!prDiv) {
    prDiv = document.createElement("div");
    prDiv.className = "store";
    prDiv.id = "prDisasterDiv";
    prDiv.innerHTML = `
      <h3>📰 PR Disasters</h3>
      <div id="prDisasterStatus"></div>
    `;
    // Insert after Ad Campaigns UI
    const container = document.querySelector(".container > div");
    container.insertBefore(prDiv, container.children[3]);
  }
  document.getElementById("prDisasterStatus").innerHTML = prDisasterActive
    ? `<span style="color:red;">Active! Demand reduced by ${(prDisasterEffect * 100).toFixed(0)}% (${prDisasterTimer}s left)</span>`
    : "<span style='color:green;'>No PR disaster active.</span>";
}

// ---------- Cheat Menu ----------
function updateCheatMenu(forceSyncInputs = false) {
  if (!cheatsEnabled) return;
  let cheatDiv = document.getElementById("cheatDiv");
  if (!cheatDiv) {
    cheatDiv = document.createElement("div");
    cheatDiv.className = "store";
    cheatDiv.id = "cheatDiv";
    cheatDiv.innerHTML = `
      <h3>🕹️ Cheat Menu</h3>
      <div>
        <label>
          Breadcoins:
          <input id="cheatBreadcoins" type="number" step="1">
          <button onclick="cheatSet('breadcoins')">Set</button>
          <button onclick="cheatAdd('breadcoins')">+ Amount</button>
        </label><br>
        <label>
          Marketing Level:
          <input id="cheatMarketingLevel" type="number" step="1">
          <button onclick="cheatSet('marketingLevel')">Set</button>
          <button onclick="cheatAdd('marketingLevel')">+ Amount</button>
        </label><br>
        <label>
          Customers:
          <input id="cheatCustomers" type="number" step="1">
          <button onclick="cheatSet('customers')">Set</button>
          <button onclick="cheatAdd('customers')">+ Amount</button>
        </label><br>
        <label>
          Ad Campaigns: <button onclick="cheatAddAd()">Add Random Ad</button>
        </label><br>
        <label>
          PR Disaster: <button onclick="cheatPRDisaster()">Trigger Disaster</button>
        </label><br>
      </div>
    `;
    // Insert at end of left column
    const container = document.querySelector(".container > div");
    container.appendChild(cheatDiv);
  }
  // Only sync input values if forceSyncInputs is true
  if (forceSyncInputs) {
    document.getElementById("cheatBreadcoins").value = breadcoins;
    document.getElementById("cheatMarketingLevel").value = marketingLevel;
    document.getElementById("cheatCustomers").value = customers;
  }
}

function cheatSet(field) {
  if (!cheatsEnabled) return;
  switch (field) {
    case "breadcoins":
      breadcoins = Number(document.getElementById("cheatBreadcoins").value);
      break;
    case "marketingLevel":
      marketingLevel = Number(document.getElementById("cheatMarketingLevel").value);
      break;
    case "customers":
      customers = Number(document.getElementById("cheatCustomers").value);
      break;
  }
  updateDisplay();
}
function cheatAdd(field) {
  if (!cheatsEnabled) return;
  switch (field) {
    case "breadcoins":
      breadcoins += Number(document.getElementById("cheatBreadcoins").value);
      break;
    case "marketingLevel":
      marketingLevel += Number(document.getElementById("cheatMarketingLevel").value);
      break;
    case "customers":
      customers += Number(document.getElementById("cheatCustomers").value);
      break;
  }
  updateDisplay();
}
function cheatAddAd() {
  if (!cheatsEnabled) return;
  const idx = Math.floor(Math.random() * adTypes.length);
  adCampaigns.push({
    typeIdx: idx,
    name: adTypes[idx].name,
    effect: adTypes[idx].baseEffect,
    timer: adTypes[idx].duration,
    emoji: adTypes[idx].emoji
  });
  log(`(Cheat) Added ${adTypes[idx].name} campaign.`);
  updateDisplay();
}
function cheatPRDisaster() {
  if (!cheatsEnabled) return;
  prDisasterActive = true;
  prDisasterDuration = 15;
  prDisasterTimer = 15;
  prDisasterEffect = 0.5;
  log(`(Cheat) PR Disaster triggered!`);
  updateDisplay();
}

// ---------- Secret Income Tax Cheat ----------
document.addEventListener('keydown', function(e) {
  // Only if not typing in input
  if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) return;
  if (e.key.toLowerCase() === incomeTaxCode[window._incomeTaxKeyIndex]) {
    window._incomeTaxKeyIndex++;
    if (window._incomeTaxKeyIndex === incomeTaxCode.length) {
      const refund = 7777;
      breadcoins += refund;
      lifetimeBreadcoins += refund;
      log(`🕵️‍♂️ You received an Income Tax Refund of ${refund} Breadcoins!`);
      updateDisplay();
      window._incomeTaxKeyIndex = 0;
    }
  } else {
    window._incomeTaxKeyIndex = 0;
  }
});

// ---------- DOMContentLoaded ----------
document.addEventListener("DOMContentLoaded", () => {
  loadGame();
  // Live update for customer stats and cheat menu should not overwrite input while typing
  setInterval(() => {
    updateStats();
  }, 1000);

  // Add missing stat fields if not present (for new features)
  const statsBox = document.querySelector('.stats-box');
  function ensureStat(label, id) {
    if (!document.getElementById(id)) {
      const p = document.createElement('p');
      p.className = 'stat-row';
      p.innerHTML = `<span>${label}</span><span id="${id}">0</span>`;
      statsBox.appendChild(p);
    }
  }
  ensureStat("Ad Effect:", "statAdEffect");
  ensureStat("PR Disaster:", "statPRDisaster");

  // Always create the cheat menu at startup, and sync cheat menu input values once
  if (cheatsEnabled) updateCheatMenu(true);
});