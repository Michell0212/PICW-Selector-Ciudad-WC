export class CityList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._cities = [];

    this.shadowRoot.innerHTML = `
      <style>
        :host { 
          display:block; 
          font-family: Arial, sans-serif; 
        }

        h3 { 
          margin: 0 0 10px 0; 
          font-size: 16px;
          font-weight: bold;
        }

        ul { 
          list-style: none; 
          padding: 0; 
          margin: 0; 
        }

        .empty-box {
          padding: 12px;
          background: #f8f8f8;
          border: 1px dashed #ccc;
          border-radius: 6px;
          font-size: 14px;
          color: #666;
          display: none;
        }
      </style>

      <h3>Ciudades seleccionadas</h3>

      <div id="empty-box" class="empty-box">
        No hay ciudades en la lista.
      </div>

      <ul id="list"></ul>
    `;
  }

  get cities() { 
    return this._cities; 
  }

  set cities(value) {
    if (!Array.isArray(value)) value = [];
    this._cities = value.map(v => typeof v === "string" ? { name: v } : v);
    this._render();
  }

  connectedCallback() { 
    this._render(); 
  }

  _render() {
    const listEl = this.shadowRoot.getElementById('list');
    const emptyBox = this.shadowRoot.getElementById('empty-box');

    listEl.innerHTML = '';

    // Mostrar/ocultar mensaje de lista vacía
    if (this._cities.length === 0) {
      emptyBox.style.display = 'block';
      return;
    }

    emptyBox.style.display = 'none';

    this._cities.forEach((cityObj) => {
      const li = document.createElement('li');
      const item = document.createElement('city-item');

      item.setAttribute('city', cityObj.name);

      // --- EVENTOS -------------------------------------------------------------

      item.addEventListener('item-deleted', (e) => {
        const name = e.detail.name;

        this._cities = this._cities.filter(c => c.name !== name);

        this._render();

        this.dispatchEvent(new CustomEvent('city-removed-from-list', {
          detail: { name },
          bubbles: true,
          composed: true
        }));
      });

      item.addEventListener('item-updated', (e) => {
        const { oldName, newName } = e.detail;

        const city = this._cities.find(c => c.name === oldName);
        if (city) city.name = newName;

        this.dispatchEvent(new CustomEvent('city-updated-in-list', {
          detail: { oldName, newName },
          bubbles: true,
          composed: true
        }));
      });

      li.appendChild(item);
      listEl.appendChild(li);
    });
  }
}

customElements.define('city-list', CityList);
