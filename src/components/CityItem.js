export class CityItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() { return ["city"]; }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "city" && this.shadowRoot) {
      const nameEl = this.shadowRoot.querySelector("#name");
      const inputEl = this.shadowRoot.querySelector("#editInput");
      if (nameEl) nameEl.textContent = newValue;
      if (inputEl) inputEl.value = newValue;
    }
  }

  connectedCallback() { this.render(); }

  render() {
    const city = this.getAttribute("city") || "Ciudad";

    this.shadowRoot.innerHTML = `
      <style>
        .item { display:flex; justify-content:space-between; align-items:center;
               padding:8px; border:1px solid #ddd; border-radius:6px; margin:6px 0;
               font-family: Arial, sans-serif;}
        .left { display:flex; gap:10px; align-items:center; }
        button { padding:4px 8px; border-radius:4px; cursor:pointer; }
        .delete { background:#e74c3c; color:#fff; border:none; }
        .edit { background:#3498db; color:#fff; border:none; }
        .save { background:#2ecc71; color:#fff; border:none; display:none; }
        input { display:none; padding:4px; border-radius:4px; border:1px solid #ccc; }
      </style>

      <div class="item">
        <div class="left">
          <span id="name">${city}</span>
          <input id="editInput" value="${city}">
        </div>
        <div class="controls">
          <button class="edit" id="editBtn">Editar</button>
          <button class="save" id="saveBtn">Guardar</button>
          <button class="delete" id="deleteBtn">X</button>
        </div>
      </div>
    `;

    this._attachListeners();
  }

  _attachListeners() {
    const deleteBtn = this.shadowRoot.querySelector('#deleteBtn');
    const editBtn = this.shadowRoot.querySelector('#editBtn');
    const saveBtn = this.shadowRoot.querySelector('#saveBtn');
    const nameEl = this.shadowRoot.querySelector('#name');
    const input = this.shadowRoot.querySelector('#editInput');

    deleteBtn.addEventListener('click', () => {
      const name = this.getAttribute('city');
      this.dispatchEvent(new CustomEvent('item-deleted', {
        detail: { name },
        bubbles: true,
        composed: true
      }));
    });

    editBtn.addEventListener('click', () => {
      nameEl.style.display = 'none';
      input.style.display = 'inline-block';
      editBtn.style.display = 'none';
      saveBtn.style.display = 'inline-block';
      input.focus();
    });

    saveBtn.addEventListener('click', () => {
      const oldName = this.getAttribute('city');
      const newName = input.value.trim();
      if (!newName) return;

      this.setAttribute('city', newName); // ahora NO resetea UI

      this.dispatchEvent(new CustomEvent('item-updated', {
        detail: { oldName, newName },
        bubbles: true,
        composed: true
      }));

      // volver a modo normal manualmente
      input.style.display = 'none';
      nameEl.style.display = 'inline-block';
      saveBtn.style.display = 'none';
      editBtn.style.display = 'inline-block';
    });
  }
}

customElements.define('city-item', CityItem);
