/* // Core app state
let elements = []
let selectedIndex = null

function addElement() {
  const newEl = {
    type: "checkbox",
    name: "New Option",
    tooltip: "",
    default: false,
  }
  elements.push(newEl)
  selectedIndex = elements.length - 1
  renderUI()
}

function selectElement(index) {
  selectedIndex = index
  renderUI()
}

function updateElementProperty(key, value) {
  if (selectedIndex === null) return
  elements[selectedIndex][key] = value
  renderUI()
}

function removeElement(index) {
  elements.splice(index, 1)
  if (selectedIndex === index) selectedIndex = null
  renderUI()
}
 */

// Core app state
let elements = [];
let selectedIndex = null;

function addElement() {
  const newEl = {
    type: "checkbox",
    name: "New Option",
    tooltip: "",
    default: false,
  };
  elements.push(newEl);
  selectedIndex = elements.length - 1;
  renderUI();
}

function selectElement(index) {
  selectedIndex = index;
  renderUI();
}

function updateElementProperty(key, value) {
  if (selectedIndex === null) return;
  elements[selectedIndex][key] = value;
  renderUI();
}

function removeElement(index) {
  elements.splice(index, 1);
  if (selectedIndex === index) selectedIndex = null;
  renderUI();
}