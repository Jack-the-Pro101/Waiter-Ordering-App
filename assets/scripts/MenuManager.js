import { v4 as uuidv4 } from "https://jspm.dev/uuid";

export default class {
  constructor() {
    this.menu = {};
    this.order = {};
  }

  add(id, item = {}) {
    const uuid = id ?? uuidv4();

    this.menu[uuid] = item;

    const populateElement = (element) => {
      this.menu[uuid].element = element;
    };

    return { itemId: uuid, populateElement };
  }

  remove(id = "") {
    this.menu[id].element.remove();
    delete this.menu[id];
    delete this.order[id];
  }

  addOrder(id) {
    const item = this.menu[id];
    if (item == null) return false;

    const orderItem = this.order[id];
    if (orderItem == null) {
      this.order[id] = 1;
    } else {
      ++this.order[id];
    }

    return { item, quantity: this.order[id] };
  }

  removeOneOrder(id) {
    const newQuantity = this.order[id] === 1 ? 0 : --this.order[id];
    if (newQuantity === 0) delete this.order[id];
    return newQuantity;
  }

  removeOrder(id) {
    const item = this.order[id];
    if (item == null) return false;
  }

  get orderSum() {
    let sum = 0;
    for (const key in this.order) {
      sum += this.menu[key].price * this.order[key];
    }

    return sum;
  }
}
