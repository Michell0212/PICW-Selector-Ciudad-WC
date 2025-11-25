// src/components/CityList.js
export class CityList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this._cities = []; // estado interno: lista de ciudades

    this.shadowRoot.innerHTML = `
      

      <h3>Ciudades seleccionadas</h3>
      <ul class="list" id="list"></ul>
      <p class="empty" id="empty-msg">No hay ciudades en la lista.</p>
    `;
  }

  // -------- Propiedad pública: padre → hijo --------
  get cities() {
    return this._cities;
  }

  set cities(value) {
    if (!Array.isArray(value)) value = [];
    this._cities = value;
    this._render();
  }

  connectedCallback() {
    this._render();
  }

  // -------- Renderizado de la lista --------
  _render() {
    const listEl = this.shadowRoot.querySelector('#list');
    const emptyMsg = this.shadowRoot.querySelector('#empty-msg');

    listEl.innerHTML = '';

    if (!this._cities.length) {
      emptyMsg.style.display = 'block';
      return;
    }

    emptyMsg.style.display = 'none';

    this._cities.forEach((cityName, index) => {
      const li = document.createElement('li');
      li.classList.add('item');

      const nameSpan = document.createElement('span');
      nameSpan.classList.add('name');
      nameSpan.textContent = cityName;

      const editBtn = document.createElement('button');
      editBtn.classList.add('edit');
      editBtn.textContent = 'Editar';

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('delete');
      deleteBtn.textContent = 'X';

      // Eliminar ciudad -> emite evento al padre
      deleteBtn.addEventListener('click', () => {
        this.dispatchEvent(
          new CustomEvent('city-remove', {
            detail: { index, name: cityName },
            bubbles: true,
            composed: true,
          })
        );
      });

      // Editar ciudad -> emite evento al padre
      editBtn.addEventListener('click', () => {
        const nuevoNombre = prompt('Nuevo nombre para la ciudad:', cityName);
        if (!nuevoNombre || !nuevoNombre.trim()) return;

        this.dispatchEvent(
          new CustomEvent('city-update', {
            detail: {
              index,
              oldName: cityName,
              newName: nuevoNombre.trim(),
            },
            bubbles: true,
            composed: true,
          })
        );
      });

      li.appendChild(nameSpan);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      listEl.appendChild(li);
    });
  }
}

customElements.define('city-list', CityList);
