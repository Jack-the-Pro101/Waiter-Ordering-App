import { save, load } from "./dataLoader.js";
import MenuManager from "./MenuManager.js";

let editing = true;

function changeAppMode(mode) {
  if (mode) {
    // Mode is true, enable use mode

    editing = true;

    document.body.classList.add("editing");
    document.body.classList.remove("using");
  } else {
    // Mode is false, enable edit mode
    editing = false;

    document.body.classList.remove("editing");
    document.body.classList.add("using");
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

const editBtn = document.querySelector("button.edit");

editBtn.addEventListener("click", () => {
  changeAppMode(!editing);

  if (editing) {
    editBtn.innerHTML = `<i class="fa-solid fa-check"></i>`;
    editBtn.title = "Finish editing";
  } else {
    editBtn.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;
    editBtn.title = "Edit menu";
  }
});

// ---

const viewOrderBtn = document.querySelector("button.view-order");
const closeOrderDetailsBtn = document.querySelector(".order-details button.close");
const orderDetailsElem = document.querySelector(".order-details");

const orderDetailsList = document.querySelector(".order-details__list");
const orderItemTemplate = document.getElementById("order-item-template");

async function renderOrderDetails() {
  orderDetailsList.innerHTML = "";
  for (const key in menuManager.order) {
    const itemQuantity = menuManager.order[key];
    const item = menuManager.menu[key];

    const orderItem = orderItemTemplate.content.cloneNode(true);

    orderItem.querySelector("[data-name]").innerText = item.name;
    orderItem.querySelector("[data-quantity]").innerText = `${itemQuantity}`;
    orderItem.querySelector("[data-price]").innerText = `${currencyFormatters.CAD.format(item.price)}`;

    orderDetailsList.appendChild(orderItem);
  }
}

viewOrderBtn.addEventListener("click", async () => {
  orderDetailsElem.classList.add("active");
  await renderOrderDetails();
});
closeOrderDetailsBtn.addEventListener("click", () => {
  orderDetailsElem.classList.remove("active");
});

// ---

const menuList = document.querySelector(".menu");
const menuItems = document.getElementsByClassName("menu__item");

const sumDisplay = document.querySelector(".info-bar [data-cost]");

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
    if (!confirm("Are you sure you want to delete this item?")) return;

    menuManager.remove(itemId);

    for (let i = 0; i < menuItems.length; i++) {
      const itemRemove = menuItems[i];
      if (itemRemove.dataset.id === itemId) {
        itemRemove.remove();
        break;
      }
    }
  });

  item.querySelector("[data-edit]").addEventListener("click", () => {
    //
  });

  item.querySelector("[data-add]").addEventListener("click", () => {
    menuManager.addOrder(itemId);

    sumDisplay.innerText = currencyFormatters.CAD.format(menuManager.orderSum);
  });

  menuList.appendChild(item);
}

const createMenuItemInputText = document.getElementById("menu-item-new-name");
const createMenuItemInputPrice = document.getElementById("menu-item-new-price");
const createMenuItemForm = document.querySelector(".menu-item-creation");

createMenuItemForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const itemName = createMenuItemInputText.value;
  const itemPrice = Number(createMenuItemInputPrice.value);

  const itemId = menuManager.add({
    name: itemName,
    price: itemPrice,
  });

  createMenuItem(itemName, itemPrice, itemId);

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
