export function save(key = "", data = {}) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(err);
    return false;
  }
}

export function load(key = "") {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (err) {
    console.error(err);
    return false;
  }
}
