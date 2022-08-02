import { save, load } from "./dataLoader.js";
import MenuManager from "./MenuManager.js";

let editing = true;
const editBtn = document.querySelector("button.edit");

function changeAppMode(mode) {
  if (mode) {
    // Mode is true, enable use mode

    editing = true;

    document.body.classList.add("editing");
    document.body.classList.remove("using");

    editBtn.innerHTML = `<i class="fa-solid fa-check"></i>`;
    editBtn.title = "Finish editing";
  } else {
    // Mode is false, enable edit mode
    editing = false;

    document.body.classList.remove("editing");
    document.body.classList.add("using");

    editBtn.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;
    editBtn.title = "Edit menu";
  }
}

const currencyFormatters = {
  CAD: new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }),
};

// ---

window.addEventListener(
  "beforeunload",
  (e) => {
    if (editing) {
      e.preventDefault();
      return (e.returnValue = "You are still in edit mode and have not saved the menu!");
    }
  },
  { capture: true }
);

// ---

const menuManager = new MenuManager();

// ---

editBtn.addEventListener("click", () => {
  changeAppMode(!editing);

  save("menuData", menuManager.menu);
});

// ---

const viewOrderBtn = document.querySelector("button.view-order");
const closeOrderDetailsBtn = document.querySelector(".order-details button.close");
const orderDetailsElem = document.querySelector(".order-details");
const orderDetailsItems = document.getElementsByClassName("order-details__item");

const orderDetailsList = document.querySelector(".order-details__list");
const orderItemTemplate = document.getElementById("order-item-template");

const sumDisplay = document.querySelector(".info-bar [data-cost]");
const taxDisplay = document.querySelector(".info-bar [data-tax]");

function updateTotalCost() {
  const sum = menuManager.orderSum;
  sumDisplay.innerText = currencyFormatters.CAD.format(sum.total);
  taxDisplay.innerText = currencyFormatters.CAD.format(sum.tax);
}

const printScreen = document.querySelector(".print-screen");
const printTable = document.querySelector(".print-screen__table");
const printTableRowTemplate = document.getElementById("print-data-row");

function renderPrintTable() {
  const printTableRows = printTable.querySelectorAll(".print-data__row");

  printTableRows.forEach((elem) => {
    elem.remove();
  });

  for (const key in menuManager.order) {
    const item = menuManager.menu[key];
    const quantity = menuManager.order[key];

    const row = printTableRowTemplate.content.cloneNode(true);

    row.querySelector("[data-name]").innerText = item.name;
    row.querySelector("[data-quantity]").innerText = quantity;
    row.querySelector("[data-price]").innerText = currencyFormatters.CAD.format(item.price * quantity);

    printTable.querySelector("tbody").appendChild(row);
  }

  const total = menuManager.orderSum;
  printScreen.querySelector("[data-tax]").innerText = currencyFormatters.CAD.format(total.tax);
  printScreen.querySelector("[data-sum]").innerText = currencyFormatters.CAD.format(total.original);
  printScreen.querySelector("[data-cost]").innerText = currencyFormatters.CAD.format(total.total);
}

async function renderOrderDetails() {
  function updateOrderDetailsItem(id = "", quantity = 0) {
    for (let i = 0; i < orderDetailsItems.length; i++) {
      const item = orderDetailsItems[i];

      if (item.dataset.id === id) {
        updateTotalCost();

        if (Object.entries(menuManager.order).length === 0) {
          const nothingElem = document.createElement("li");
          nothingElem.innerText = "Order is empty";
          nothingElem.classList.add("nothing");
          orderDetailsList.appendChild(nothingElem);
          orderDetailsList.classList.add("nothing");
        }

        if (quantity <= 0) return item.remove();

        item.querySelector("[data-quantity]").innerText = `${quantity}`;

        break;
      }
    }
  }

  orderDetailsList.innerHTML = "";
  for (const key in menuManager.order) {
    const itemQuantity = menuManager.order[key];
    const item = menuManager.menu[key];

    const orderItem = orderItemTemplate.content.cloneNode(true);

    orderItem.querySelector(".order-details__item").dataset.id = key;
    orderItem.querySelector("[data-name]").innerText = item.name;
    orderItem.querySelector("[data-quantity]").innerText = `${itemQuantity}`;
    orderItem.querySelector("[data-price]").innerText = `${currencyFormatters.CAD.format(item.price)}`;

    orderItem.querySelector(".remove").addEventListener("click", () => {
      const updatedQuantity = menuManager.removeOneOrder(key);

      updateOrderDetailsItem(key, updatedQuantity);
    });

    orderDetailsList.appendChild(orderItem);
  }

  if (Object.entries(menuManager.order).length === 0) {
    const nothingElem = document.createElement("li");
    nothingElem.innerText = "Order is empty";
    nothingElem.classList.add("nothing");
    orderDetailsList.appendChild(nothingElem);
    orderDetailsList.classList.add("nothing");
  } else {
    orderDetailsList.classList.remove("nothing");
  }
}

orderDetailsElem.querySelector(".order-details__print").addEventListener("click", () => {
  // const printData = [];
  // for (const id in menuManager.order) {
  //   const quantity = menuManager.order[id];
  //   printData.push({
  //     name: menuManager.menu[id].name,
  //     quantity: quantity,
  //     price: currencyFormatters.CAD.format(menuManager.menu[id].price),
  //   });
  // }
  // printJS({
  //   type: "json",
  //   printable: printData,
  //   properties: ["name", "quantity", "price"],
  //   header: currencyFormatters.CAD.format(menuManager.orderSum.total),
  // });

  document.body.classList.add("printing");

  renderPrintTable();

  printJS({
    type: "html",
    printable: "printable-table",
    css: "./assets/css/print.css",
  });

  document.body.classList.remove("printing");
});

orderDetailsElem.querySelector(".order-details__finish").addEventListener("click", () => {
  if (!confirm("Clear Order:\nAre you sure you want to clear the order?")) return;
  for (const key in menuManager.order) {
    delete menuManager.order[key];
  }

  renderOrderDetails();
  updateTotalCost();
});

viewOrderBtn.addEventListener("click", () => {
  orderDetailsElem.classList.add("active");
  document.body.classList.add("viewing-order-details");
  viewOrderBtn.disabled = true;
  renderOrderDetails();
});
closeOrderDetailsBtn.addEventListener("click", () => {
  document.body.classList.remove("viewing-order-details");
  viewOrderBtn.disabled = false;
  orderDetailsElem.classList.remove("active");
});

// ---

const menuList = document.querySelector(".menu");
const menuItems = document.getElementsByClassName("menu__item");

const menuItemTemplate = document.getElementById("menu-item-template");
function createMenuItem(itemName = "", itemPrice = 0, itemId = "") {
  const item = menuItemTemplate.content.cloneNode(true);

  item.querySelector("[data-name]").innerText = itemName;
  item.querySelector("[data-price]").innerText = `${currencyFormatters.CAD.format(itemPrice)}`;

  itemName = itemName.toLowerCase();

  const itemElem = item.querySelector(".menu__item");
  const editBtn = item.querySelector("[data-edit]");
  const pinBtn = itemElem.querySelector("[data-pin]");

  const nameInput = itemElem.querySelector("#menu-edit-name");
  const priceInput = itemElem.querySelector("#menu-edit-price");

  itemElem.dataset.name = itemName;
  itemElem.dataset.price = itemPrice;
  itemElem.dataset.id = itemId;

  item.querySelector("[data-pin]").addEventListener("click", () => {
    itemElem.classList.toggle("pinned");
    pinBtn.classList.toggle("pinned");
  });

  item.querySelector("[data-delete]").addEventListener("click", () => {
    if (!confirm(`Are you sure you want to delete this item? ${menuManager.order[itemId] != null ? "\n\n(You currently have this item in the order)" : ""}`))
      return;

    menuManager.remove(itemId);
    updateTotalCost();
  });

  editBtn.addEventListener("click", () => {
    if (itemElem.classList.contains("menu__item--editing")) {
      // Save

      itemElem.classList.remove("menu__item--editing");

      editBtn.innerHTML = `<i class="fa-solid fa-pen"></i>`;

      menuManager.edit(itemId, {
        name: nameInput.value,
        price: priceInput.value,
      });

      itemElem.dataset.name = nameInput.value;
      itemElem.dataset.price = priceInput.value;

      itemElem.querySelector("[data-name]").innerText = nameInput.value;
      itemElem.querySelector("[data-price]").innerText = `${currencyFormatters.CAD.format(priceInput.value)}`;

      editBtn.blur();

      updateTotalCost();
    } else {
      // Edit

      itemElem.classList.add("menu__item--editing");

      editBtn.innerHTML = `<i class="fa-solid fa-check"></i>`;

      nameInput.value = menuManager.menu[itemId].name;
      priceInput.value = menuManager.menu[itemId].price;

      nameInput.placeholder = menuManager.menu[itemId].name;
      priceInput.placeholder = menuManager.menu[itemId].price;

      nameInput.focus();
    }
  });

  item.querySelector("[data-add]").addEventListener("click", () => {
    menuManager.addOrder(itemId);

    updateTotalCost();
  });

  menuList.querySelector(".nothing")?.remove();

  menuList.appendChild(item);
}

const createMenuItemInputText = document.getElementById("menu-item-new-name");
const createMenuItemInputPrice = document.getElementById("menu-item-new-price");
const createMenuItemForm = document.querySelector(".menu-item-creation");

createMenuItemForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const itemName = createMenuItemInputText.value;
  const itemPrice = Number(createMenuItemInputPrice.value);

  const { itemId, populateElement } = menuManager.add(null, {
    name: itemName,
    price: itemPrice,
  });

  createMenuItem(itemName, itemPrice, itemId);

  for (let i = menuItems.length - 1; i > -1; --i) {
    const element = menuItems[i];

    if (element.dataset.id === itemId) {
      populateElement(element);
      break;
    }
  }

  createMenuItemInputText.value = "";
  createMenuItemInputPrice.value = 0;

  createMenuItemInputText.focus();
});

// ---

const searchBar = document.getElementById("search");

searchBar.addEventListener("input", (e) => {
  const searchValue = searchBar.value.toLowerCase();

  if (!searchValue) {
    for (let i = 0; i < menuItems.length; i++) {
      const item = menuItems[i];
      item.style = "";
    }
    return;
  }

  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems.item(i);

    if (item.dataset.name.includes(searchValue)) {
      item.style = "";
    } else {
      item.style.display = "none";
    }
  }
});

// ---

const menuSaveData = load("menuData");

function loadSavedMenu(menuSaveData) {
  for (const key in menuSaveData) {
    const item = menuSaveData[key];

    const { itemId, populateElement } = menuManager.add(key, {
      name: item.name,
      price: item.price,
    });

    createMenuItem(item.name, item.price, key);

    for (let i = menuItems.length - 1; i > -1; --i) {
      const element = menuItems[i];

      if (element.dataset.id === itemId) {
        populateElement(element);
        break;
      }
    }
  }
}

if (menuSaveData !== false && menuSaveData != null && Object.entries(menuSaveData).length > 0) {
  changeAppMode(!editing);

  loadSavedMenu(menuSaveData);
} else {
  const nothingElem = document.createElement("li");
  nothingElem.classList.add("menu__item", "nothing");
  nothingElem.innerText = "Menu is empty.";

  menuList.appendChild(nothingElem);
}
