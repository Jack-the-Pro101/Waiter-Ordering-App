export function save(data = {}) {
  try {
    localStorage.setItem("saveData", JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
}

export function load() {
  try {
    return JSON.parse(localStorage.getItem("saveData"));
  } catch (err) {
    console.error(err);
  }
}
