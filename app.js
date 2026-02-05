const users = ["Luca", "Sara", "Marco", "Giulia"];
let types = ["Spesa casa", "Viaggio", "Cibo", "Trasporti", "Divertimento"];

const expenses = [
  {
    id: "spesa-1",
    type: "Cibo",
    amount: 58.4,
    description: "Spesa settimanale",
    month: 9,
    year: 2024,
    paidBy: "Luca",
    owedBy: ["Luca", "Sara", "Marco"],
    splitMode: "shared",
  },
  {
    id: "spesa-2",
    type: "Viaggio",
    amount: 240,
    description: "Biglietti treno weekend",
    month: 9,
    year: 2024,
    paidBy: "Sara",
    owedBy: ["Luca"],
    splitMode: "full",
  },
  {
    id: "spesa-3",
    type: "Spesa casa",
    amount: 120,
    description: "Bollette appartamento",
    month: 9,
    year: 2024,
    paidBy: "Luca",
    owedBy: ["Luca", "Sara", "Marco", "Giulia"],
    splitMode: "shared",
  },
  {
    id: "spesa-4",
    type: "Divertimento",
    amount: 85,
    description: "Aperitivo gruppo",
    month: 8,
    year: 2024,
    paidBy: "Marco",
    owedBy: ["Luca", "Sara", "Marco"],
    splitMode: "shared",
  },
];

const state = {
  currentUser: "Luca",
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  searchQuery: "",
};

const monthNames = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

const monthSelect = document.getElementById("month-select");
const yearSelect = document.getElementById("year-select");
const searchInput = document.getElementById("search-input");
const expenseCards = document.getElementById("expense-cards");
const expenseCount = document.getElementById("expense-count");
const totalSpent = document.getElementById("total-spent");
const totalReceive = document.getElementById("total-receive");
const currentUserLabel = document.getElementById("current-user");

const expenseForm = document.getElementById("expense-form");
const expenseIdInput = document.getElementById("expense-id");
const typeInput = document.getElementById("type-input");
const amountInput = document.getElementById("amount-input");
const descriptionInput = document.getElementById("description-input");
const monthInput = document.getElementById("month-input");
const yearInput = document.getElementById("year-input");
const paidByInput = document.getElementById("paidby-input");
const splitInput = document.getElementById("split-input");
const owedByInput = document.getElementById("owedby-input");

const settingsModal = document.getElementById("settings-modal");
const openSettings = document.getElementById("open-settings");
const closeSettings = document.getElementById("close-settings");
const addTypeButton = document.getElementById("add-type");
const newTypeInput = document.getElementById("new-type");
const typeList = document.getElementById("type-list");

const currencyFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

const buildSelectOptions = (select, options, selected) => {
  select.innerHTML = "";
  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.label;
    if (option.value === selected) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
};

const refreshTypeOptions = () => {
  const optionData = types.map((type) => ({ value: type, label: type }));
  buildSelectOptions(typeInput, optionData, typeInput.value || types[0]);
  typeList.innerHTML = "";
  types.forEach((type) => {
    const item = document.createElement("li");
    item.textContent = type;
    typeList.appendChild(item);
  });
};

const refreshUserOptions = () => {
  const userOptions = users.map((user) => ({ value: user, label: user }));
  buildSelectOptions(paidByInput, userOptions, paidByInput.value || state.currentUser);

  owedByInput.innerHTML = "";
  users.forEach((user) => {
    const opt = document.createElement("option");
    opt.value = user;
    opt.textContent = user;
    owedByInput.appendChild(opt);
  });
};

const refreshDateSelectors = () => {
  buildSelectOptions(
    monthSelect,
    monthNames.map((name, index) => ({ value: index + 1, label: name })),
    state.selectedMonth
  );
  buildSelectOptions(
    monthInput,
    monthNames.map((name, index) => ({ value: index + 1, label: name })),
    state.selectedMonth
  );

  const years = [2023, 2024, 2025];
  buildSelectOptions(
    yearSelect,
    years.map((year) => ({ value: year, label: year })),
    state.selectedYear
  );
  buildSelectOptions(
    yearInput,
    years.map((year) => ({ value: year, label: year })),
    state.selectedYear
  );
};

const filterExpenses = () =>
  expenses.filter((expense) => {
    const matchesMonth = expense.month === Number(state.selectedMonth);
    const matchesYear = expense.year === Number(state.selectedYear);
    const query = state.searchQuery.toLowerCase();
    const matchesQuery =
      expense.description.toLowerCase().includes(query) ||
      expense.paidBy.toLowerCase().includes(query) ||
      expense.type.toLowerCase().includes(query);
    return matchesMonth && matchesYear && matchesQuery;
  });

const calculateTotals = (filtered) => {
  const spent = filtered
    .filter((expense) => expense.paidBy === state.currentUser)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const toReceive = filtered
    .filter((expense) => expense.paidBy === state.currentUser)
    .reduce((sum, expense) => {
      if (expense.splitMode === "full") {
        return sum + expense.amount;
      }
      const participants = expense.owedBy.length;
      const otherUsers = expense.owedBy.filter((user) => user !== expense.paidBy).length;
      if (participants === 0) {
        return sum;
      }
      return sum + (expense.amount / participants) * otherUsers;
    }, 0);

  totalSpent.textContent = currencyFormatter.format(spent);
  totalReceive.textContent = currencyFormatter.format(toReceive);
};

const renderExpenseCards = (filtered) => {
  expenseCards.innerHTML = "";
  expenseCount.textContent = `${filtered.length} spese`;

  filtered.forEach((expense) => {
    const card = document.createElement("article");
    card.className = "card";

    const owedText = expense.owedBy.join(", ");

    card.innerHTML = `
      <div class="card-header">
        <div>
          <h4>${expense.type}</h4>
          <p>${expense.description}</p>
        </div>
        <strong>${currencyFormatter.format(expense.amount)}</strong>
      </div>
      <div class="card-meta">
        <span>Mese: ${monthNames[expense.month - 1]} ${expense.year}</span>
        <span>Pagato da: ${expense.paidBy}</span>
        <span>Restituiscono: ${owedText}</span>
        <span>Modalità: ${expense.splitMode === "full" ? "Addebito totale" : "Divisa"}</span>
      </div>
      <div class="card-actions">
        <button class="edit" data-id="${expense.id}">Modifica</button>
        <button class="delete" data-id="${expense.id}">Cancella</button>
      </div>
    `;

    expenseCards.appendChild(card);
  });
};

const populateForm = (expense) => {
  expenseIdInput.value = expense.id;
  typeInput.value = expense.type;
  amountInput.value = expense.amount;
  descriptionInput.value = expense.description;
  monthInput.value = expense.month;
  yearInput.value = expense.year;
  paidByInput.value = expense.paidBy;
  splitInput.value = expense.splitMode;
  Array.from(owedByInput.options).forEach((option) => {
    option.selected = expense.owedBy.includes(option.value);
  });
};

const handleDelete = (id) => {
  const index = expenses.findIndex((expense) => expense.id === id);
  if (index === -1) return;
  expenses.splice(index, 1);
  refreshUI();
};

const refreshUI = () => {
  const filtered = filterExpenses();
  calculateTotals(filtered);
  renderExpenseCards(filtered);
  currentUserLabel.textContent = state.currentUser;

  const selected = filtered[0] || expenses[0];
  if (selected) {
    populateForm(selected);
  }
};

monthSelect.addEventListener("change", (event) => {
  state.selectedMonth = Number(event.target.value);
  monthInput.value = state.selectedMonth;
  refreshUI();
});

yearSelect.addEventListener("change", (event) => {
  state.selectedYear = Number(event.target.value);
  yearInput.value = state.selectedYear;
  refreshUI();
});

searchInput.addEventListener("input", (event) => {
  state.searchQuery = event.target.value;
  refreshUI();
});

expenseCards.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const id = button.dataset.id;
  if (button.classList.contains("edit")) {
    const expense = expenses.find((item) => item.id === id);
    if (expense) {
      populateForm(expense);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  if (button.classList.contains("delete")) {
    handleDelete(id);
  }
});

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const id = expenseIdInput.value;
  const expense = expenses.find((item) => item.id === id);
  if (!expense) return;

  expense.type = typeInput.value;
  expense.amount = Number(amountInput.value);
  expense.description = descriptionInput.value;
  expense.month = Number(monthInput.value);
  expense.year = Number(yearInput.value);
  expense.paidBy = paidByInput.value;
  expense.splitMode = splitInput.value;
  expense.owedBy = Array.from(owedByInput.selectedOptions).map((option) => option.value);

  refreshUI();
});

openSettings.addEventListener("click", () => {
  settingsModal.classList.remove("hidden");
  settingsModal.setAttribute("aria-hidden", "false");
});

closeSettings.addEventListener("click", () => {
  settingsModal.classList.add("hidden");
  settingsModal.setAttribute("aria-hidden", "true");
});

addTypeButton.addEventListener("click", () => {
  const newType = newTypeInput.value.trim();
  if (!newType || types.includes(newType)) return;
  types = [...types, newType];
  newTypeInput.value = "";
  refreshTypeOptions();
});

refreshTypeOptions();
refreshUserOptions();
refreshDateSelectors();
refreshUI();
