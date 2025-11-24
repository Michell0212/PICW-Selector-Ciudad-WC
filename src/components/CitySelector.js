const template = document.createElement('template');
template.innerHTML = `
  <!-- Importamos el archivo CSS externo dentro del shadowRoot -->
  <!-- Este <link> solo afecta al Shadow DOM, no al documento global -->
  <link href="style.css" rel="stylesheet">

  <!-- La estructura visual del componente -->
  <div class="wrapper">

    <!-- Etiqueta accesible asociada al input -->
    <label id="label" for="input">Buscar ciudad</label>

    <!-- Input donde el usuario escribe la ciudad -->
    <input 
      id="input" 
      type="text" 
      autocomplete="off"
      aria-autocomplete="list"
      aria-controls="listbox"
      aria-expanded="false"
    />

    <!-- Contenedor donde se renderiza la lista de sugerencias -->
    <div id="list" role="listbox" class="list" tabindex="-1" aria-labelledby="label"></div>

    <!-- Mensaje de ayuda o información contextual -->
    <div class="hint" id="hint"></div>
  </div>
`;


// ===========================================================
//                DEFINICIÓN DEL WEB COMPONENT
// ===========================================================
export class CitySelector extends HTMLElement {

  constructor() {
    super(); // Inicializa HTMLElement

    // ACTIVAMOS shadow DOM -> modo 'open' permite acceder desde JS
    this._shadow = this.attachShadow({ mode: 'open' });

    // Inyectamos el template dentro del shadowRoot
    this._shadow.appendChild(template.content.cloneNode(true));

    // Guardamos referencias a los elementos internos
    this.$input = this._shadow.getElementById('input');
    this.$list  = this._shadow.getElementById('list');
    this.$hint  = this._shadow.getElementById('hint');

    // ===========================
    //       ESTADO INTERNO
    // ===========================
    this._cities = [];        // Lista completa de ciudades
    this._filtered = [];      // Lista filtrada según lo que escribe el usuario
    this._value = '';         // Valor actual del input
    this._activeIndex = -1;   // Índice seleccionado por teclado
    this._minChars = 1;       // Mínimo de caracteres para buscar
    this._debounceTime = 200; // Retardo antes de filtrar (mejora rendimiento)
    this._debounceTimer = null;

    // Bind de métodos para que mantengan el contexto correcto (this)
    this._onInput = this._onInput.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onClickOutside = this._onClickOutside.bind(this);
  }

  // Si quisiéramos observar atributos podríamos listarlos aquí
  static get observedAttributes() {
    return [];
  }

  // ===========================================================
  //     CICLO DE VIDA: cuando el elemento aparece en el DOM
  // ===========================================================
  connectedCallback() {

    // Escuchamos eventos del input
    this.$input.addEventListener('input', this._onInput);
    this.$input.addEventListener('keydown', this._onKeyDown);

    // Detectamos clic fuera del componente para cerrar la lista
    document.addEventListener('click', this._onClickOutside, true);

    // Si el usuario agregó placeholder en HTML <city-selector placeholder="Ciudad">
    if (this.hasAttribute('placeholder')) {
      this.$input.placeholder = this.getAttribute('placeholder');
    }

    // Si enviaron un valor inicial
    if (this.hasAttribute('value')) {
      this.value = this.getAttribute('value');
    }

    // Render inicial del texto de ayuda
    this._renderHint();
  }

  // ===========================================================
  //     LIMPIEZA: cuando el componente se elimina del DOM
  // ===========================================================
  disconnectedCallback() {
    this.$input.removeEventListener('input', this._onInput);
    this.$input.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('click', this._onClickOutside, true);
    clearTimeout(this._debounceTimer);
  }

  // ===========================================================
  //             PROPIEDADES PÚBLICAS DEL COMPONENTE
  // ===========================================================

  // LISTA DE CIUDADES -> puede ser ["Quito", "Loja"] o [{name:'Quito'}]
  get cities() {
    return this._cities;
  }
  set cities(list) {
    if (!Array.isArray(list)) return;
    this._cities = list;

    // Si ya había texto en el input, re-filtramos
    this._filter(this.$input.value || '');
  }

  // VALOR ACTUAL DEL INPUT
  get value() {
    return this._value;
  }
  set value(val) {
    this._value = val || '';
    this.$input.value = this._value;
    this._renderHint();
  }

  // ===========================================================
  //             LÓGICA CUANDO EL USUARIO ESCRIBE
  // ===========================================================
  _onInput(e) {
    const q = e.target.value;
    this._value = q;

    // Debounce para evitar filtros excesivos
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this._filter(q);
    }, this._debounceTime);

    // Emitimos evento indicando que el usuario está escribiendo
    this._emitTypingEvent(q);
  }

  // ===========================================================
  //        FILTRO DE CIUDADES (autocompletado)
  // ===========================================================
  _filter(q) {
    const qTrim = (q || '').trim().toLowerCase();

    // Si no ha escrito suficiente, no mostramos nada
    if (qTrim.length < this._minChars) {
      this._closeList();
      this._filtered = [];
      this._renderHint();
      return;
    }

    // MATCHING FLEXIBLE:
    // - Prioriza las que EMPIEZAN por el término
    // - Luego incluye coincidencias internas
    const starts = [];
    const includes = [];

    for (const c of this._cities) {
      const name = (typeof c === 'string') ? c : (c.name || '');
      const nLower = name.toLowerCase();

      if (nLower.startsWith(qTrim)) starts.push(c);
      else if (nLower.includes(qTrim)) includes.push(c);
    }

    // Unimos resultados priorizando los de "startsWith"
    this._filtered = [...starts, ...includes].slice(0, 50); // límite razonable
    this._activeIndex = -1; // Reiniciamos cursor del teclado

    this._renderList();  // Construye los items visualmente
    this._openList();    // Abre la lista
    this._renderHint(`${this._filtered.length} resultado(s)`);
  }

  // ===========================================================
  //             RENDERIZA LAS OPCIONES EN LA LISTA
  // ===========================================================
  _renderList() {
    this.$list.innerHTML = '';

    if (!this._filtered || this._filtered.length === 0) {
      const el = document.createElement('div');
      el.className = 'no-results';
      el.textContent = 'No se encontraron coincidencias';
      this.$list.appendChild(el);
      return;
    }

    // Por cada ciudad renderizamos un DIV como opción
    this._filtered.forEach((c, idx) => {
      const name = (typeof c === 'string') ? c : (c.name || '');
      const item = document.createElement('div');

      item.className = 'item';
      item.setAttribute('role', 'option');
      item.setAttribute('data-index', idx);
      item.setAttribute('tabindex', '-1');
      item.id = `city-item-${idx}`;
      item.textContent = name;

      // Cuando se haga click -> seleccionar
      item.addEventListener('click', () => this._selectIndex(idx));

      this.$list.appendChild(item);
    });
  }

  // ===========================================================
  //           MOSTRAR / OCULTAR LA LISTA DE OPCIONES
  // ===========================================================
  _openList() {
    this.$list.setAttribute('open', '');
    this.$input.setAttribute('aria-expanded', 'true');
  }

  _closeList() {
    this.$list.removeAttribute('open');
    this.$input.setAttribute('aria-expanded', 'false');
  }

  // ===========================================================
  //             MENSAJE DE AYUDA / INFORMACIÓN
  // ===========================================================
  _renderHint(text) {
    if (text) {
      this.$hint.textContent = text;
    } else if (!this._value) {
      this.$hint.textContent = 'Escribe al menos 1 carácter para buscar';
    } else {
      this.$hint.textContent = '';
    }
  }

  // ===========================================================
  //     NAVEGACIÓN CON TECLADO (↑ ↓ Enter Escape)
  // ===========================================================
  _onKeyDown(e) {
    const len = this._filtered.length;

    // Si la lista está cerrada pero presiona flechas, la abrimos
    if (!this.$list.hasAttribute('open') &&
       (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      if (len > 0) this._openList();
    }

    switch (e.key) {

      case 'ArrowDown':
        e.preventDefault();
        if (len === 0) return;
        this._activeIndex = Math.min(len - 1, this._activeIndex + 1);
        this._highlightActive();
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (len === 0) return;
        this._activeIndex = Math.max(0, this._activeIndex - 1);
        this._highlightActive();
        break;

      case 'Enter':
        e.preventDefault();
        if (this._activeIndex >= 0) {
          this._selectIndex(this._activeIndex);
        } else {
          // Si hay solo 1 resultado, selecciónalo
          if (len === 1) this._selectIndex(0);
        }
        break;

      case 'Escape':
        this._closeList();
        break;
    }
  }

  // Resalta el item actual mientras usas el teclado
  _highlightActive() {
    const children = Array.from(this.$list.querySelectorAll('.item'));

    children.forEach((c, i) => {
      c.setAttribute('aria-selected', i === this._activeIndex ? 'true' : 'false');
      if (i === this._activeIndex) {
        c.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  // ===========================================================
  //            SELECCIONA UNA CIUDAD (click o Enter)
  // ===========================================================
  _selectIndex(idx) {
    const selected = this._filtered[idx];
    if (!selected) return;

    const name = (typeof selected === 'string') ? selected : (selected.name || '');

    // Actualizamos el input
    this.value = name;

    // Cerramos la lista
    this._closeList();

    // Emitimos evento al padre <city-app>
    this._emitSelected(name, selected);
  }

  // ===========================================================
  //             EVENTOS: hijo → padre
  // ===========================================================
  _emitSelected(name, original) {
    const detail = { name, original };

    const ev = new CustomEvent('city-selected', {
      detail,
      bubbles: true,     // Permite burbujear hasta el padre
      composed: true     // Permite atravesar el Shadow DOM
    });

    this.dispatchEvent(ev);
  }

  // Evento para notificar que el usuario está escribiendo
  _emitTypingEvent(q) {
    const ev = new CustomEvent('city-typing', {
      detail: { query: q },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(ev);
  }

  // ===========================================================
  //  SI EL USUARIO HACE CLICK FUERA DEL COMPONENTE → cerrar lista
  // ===========================================================
  _onClickOutside(e) {
    // Si el click NO pertenece al componente ni su shadowRoot
    if (!this.contains(e.target) && !this._shadow.host.contains(e.target)) {
      this._closeList();
    }
  }
}

// Registramos el Web Component
customElements.define('city-selector', CitySelector);