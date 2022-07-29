import { v4 as uuidv4 } from "https://jspm.dev/uuid";

export default class {
  constructor() {
    this.menu = {};
    this.order = {};
  }

  add(item = {}, callback) {
    const uuid = uuidv4();

    this.menu[uuid] = item;

    return uuid;
  }

  remove(id = "") {
    delete this.menu[id];
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
    const item = this.order[id];
    if (item == null) return false;
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
