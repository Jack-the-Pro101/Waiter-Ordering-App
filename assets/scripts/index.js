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

function updateTotalCost() {
  sumDisplay.innerText = currencyFormatters.CAD.format(menuManager.orderSum);
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

viewOrderBtn.addEventListener("click", async () => {
  orderDetailsElem.classList.add("active");
  document.body.classList.add("viewing-order-details");
  viewOrderBtn.disabled = true;
  await renderOrderDetails();
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
  const pinBtn = itemElem.querySelector("[data-pin]");

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

  item.querySelector("[data-edit]").addEventListener("click", () => {
    itemElem.classList.add("menu__item--editing");

    const nameInput = itemElem.querySelector("#menu-edit-name");
    const priceInput = itemElem.querySelector("#menu-edit-price");

    nameInput.value = menuManager.menu[itemId].name;
    priceInput.value = menuManager.menu[itemId].price;
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

if (menuSaveData !== false && Object.entries(menuSaveData).length > 0) {
  changeAppMode(!editing);

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
} else {
  const nothingElem = document.createElement("li");
  nothingElem.classList.add("menu__item", "nothing");
  nothingElem.innerText = "Menu is empty.";

  menuList.appendChild(nothingElem);
}
