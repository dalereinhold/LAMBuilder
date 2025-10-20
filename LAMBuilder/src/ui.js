/* // Build UI from app state
document.getElementById("addElementBtn").onclick = addElement
document.getElementById("copyBtn").onclick = () => {
  navigator.clipboard.writeText(exportToLua(elements))
  alert("Lua copied to clipboard!")
}

function renderUI() {
  renderSidebar()
  renderEditor()
  renderPreview()
}

function renderSidebar() {
  const list = document.getElementById("elementList")
  list.innerHTML = ""
  elements.forEach((el, i) => {
    const li = document.createElement("li")
    li.textContent = `${i + 1}. ${el.name} (${el.type})`
    li.style.cursor = "pointer"
    li.style.marginBottom = "5px"
    li.onclick = () => selectElement(i)

    if (i === selectedIndex) li.style.color = "#0f0"
    list.appendChild(li)
  })
}

function renderEditor() {
  const editor = document.getElementById("propertyEditor")
  if (selectedIndex === null) {
    editor.innerHTML = "Select an element to edit."
    return
  }

  const el = elements[selectedIndex]
  editor.innerHTML = ""

  // Type selector
  const typeLabel = document.createElement("label")
  typeLabel.textContent = "Type:"
  const typeSelect = document.createElement("select")
  ;["checkbox", "slider", "dropdown", "description"].forEach(t => {
    const opt = document.createElement("option")
    opt.value = t
    opt.textContent = t
    if (el.type === t) opt.selected = true
    typeSelect.appendChild(opt)
  })
  typeSelect.onchange = e => updateElementProperty("type", e.target.value)
  editor.appendChild(typeLabel)
  editor.appendChild(typeSelect)

  // Name
  addInput("Name", "name", el.name)
  // Tooltip
  addInput("Tooltip", "tooltip", el.tooltip)
  // Default
  addInput("Default", "default", el.default, "text")

  // Remove button
  const removeBtn = document.createElement("button")
  removeBtn.textContent = "Delete Element"
  removeBtn.onclick = () => removeElement(selectedIndex)
  removeBtn.style.marginTop = "10px"
  editor.appendChild(removeBtn)

  function addInput(labelText, key, value, type = "text") {
    const label = document.createElement("label")
    label.textContent = labelText
    const input = document.createElement("input")
    input.type = type
    input.value = value
    input.oninput = e => updateElementProperty(key, e.target.value)
    editor.appendChild(label)
    editor.appendChild(input)
  }
}

function renderPreview() {
  const output = document.getElementById("luaOutput")
  output.textContent = exportToLua(elements)
} */

// Editable panelData
let panelData = {
  name: "My Addon Settings",
  displayName: "My Addon Settings",
  author: "AuthorName",
  version: "1.0",
  slashCommand: "/myaddon",
  registerForRefresh: true,
  registerForDefaults: true,
};

// Buttons
document.getElementById("addElementBtn").onclick = addElement;
document.getElementById("copyBtn").onclick = () => {
  navigator.clipboard.writeText(exportToLua(elements, panelData));
  alert("Lua copied to clipboard!");
};

// Render everything
function renderUI() {
  renderPanelDataEditor();
  renderSidebar();
  renderEditor();
  renderPreview();
}

// PanelData editor
function renderPanelDataEditor() {
  const panelEditor = document.getElementById("panelDataEditor");
  if (!panelEditor) return;

  panelEditor.innerHTML = "<h3>Panel Data</h3>";

  for (const key of Object.keys(panelData)) {
    const value = panelData[key];
    const label = document.createElement("label");
    label.textContent = key;
    const input = document.createElement("input");
    input.value = value;
    input.oninput = e => {
      panelData[key] = e.target.value;
      renderPreview();
    };
    panelEditor.appendChild(label);
    panelEditor.appendChild(input);
  }
}

// Sidebar list
function renderSidebar() {
  const list = document.getElementById("elementList");
  list.innerHTML = "";
  elements.forEach((el, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${el.name || "Unnamed"} (${el.type})`;
    li.style.cursor = "pointer";
    li.style.marginBottom = "5px";
    li.onclick = () => selectElement(i);
    if (i === selectedIndex) li.style.color = "#0f0";
    list.appendChild(li);
  });
}

// Property editor
function renderEditor() {
  const editor = document.getElementById("propertyEditor");
  if (selectedIndex === null) {
    editor.innerHTML = "Select an element to edit.";
    return;
  }

  const el = elements[selectedIndex];
  editor.innerHTML = "";

  // Type selector
  const typeLabel = document.createElement("label");
  typeLabel.textContent = "Type:";
  const typeSelect = document.createElement("select");
  ["checkbox", "slider", "dropdown", "description"].forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    if (el.type === t) opt.selected = true;
    typeSelect.appendChild(opt);
  });
  typeSelect.onchange = e => updateElementProperty("type", e.target.value);
  editor.appendChild(typeLabel);
  editor.appendChild(typeSelect);

  addInput("Name", "name", el.name);
  addInput("Tooltip", "tooltip", el.tooltip);
  addInput("Default", "default", el.default, "text");

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Delete Element";
  removeBtn.onclick = () => removeElement(selectedIndex);
  removeBtn.style.marginTop = "10px";
  editor.appendChild(removeBtn);

  function addInput(labelText, key, value, type = "text") {
    const label = document.createElement("label");
    label.textContent = labelText;
    const input = document.createElement("input");
    input.type = type;
    input.value = value || "";
    input.oninput = e => updateElementProperty(key, e.target.value);
    editor.appendChild(label);
    editor.appendChild(input);
  }
}

// Lua preview
function renderPreview() {
  const output = document.getElementById("luaOutput");
  output.textContent = exportToLua(elements);
}

// Initial render
renderUI();