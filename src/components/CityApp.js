export class CityApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
      <my-navbar></my-navbar>

      <div class="app-shell">
        <city-selector id="cs" placeholder="Ingresa ciudad"></city-selector>

        <div class="main">
          <div class="left-column">
            <city-list id="city-list"></city-list>
          </div>

          <div class="right-column">
            <div id="cards-container"></div>
            <city-info id="city-info-placeholder" style="display:none;"></city-info>
          </div>
        </div>
      </div>
    `;

    this._selectedCities = [];

    // Manejar eliminaciones desde city-list / city-item
    this.shadowRoot.addEventListener(
      'city-removed-from-list',
      this._handleCityRemoved.bind(this)
    );
  }

  connectedCallback() {
    // Evita condiciones de render prematuro
    requestAnimationFrame(() => this._initComponents());
  }

  _initComponents() {

    const cities = [
      {
        name: 'Manta',
        country: 'Ecuador',
        image: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/MANTA_%2817427130779%29.jpg',
        tag: 'Costa',
        description: 'Principal puerto pesquero y destino turístico de playa.',
        population: 250,
        altitude: 6,
        temperature: '24-30'
      },
      {
        name: 'Quito',
        country: 'Ecuador',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Quito_desde_el_Panecillo_2018-02-18.jpg/1200px-Quito_desde_el_Panecillo_2018-02-18.jpg',
        tag: 'Sierra',
        description: 'Capital de Ecuador con un centro histórico colonial.',
        population: 1800,
        altitude: 2850,
        temperature: '10-25'
      },
      {
        name: 'Guayaquil',
        country: 'Ecuador',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Guayaquil_-_Ecuador_-_panoramio_%287%29.jpg/1200px-Guayaquil_-_Ecuador_-_panoramio_%287%29.jpg',
        tag: 'Costa',
        description: 'La ciudad más grande y poblada del país.',
        population: 2800,
        altitude: 4,
        temperature: '25-31'
      },
      { name: 'Ambato' },
      { name: 'Loja' },
      { name: 'Salinas' },
      {
        name: 'New York',
        country: 'USA',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/New_York_City_by_David_Shankbone.jpg/1200px-New_York_City_by_David_Shankbone.jpg',
        tag: 'Metrópolis',
        description: 'Una de las grandes ciudades del mundo.',
        population: 8400,
        altitude: 10,
        temperature: '0-30'
      },
      {
        name: 'Madrid',
        country: 'Spain',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Puerta_del_Sol_%28Madrid%29_01.jpg/1200px-Puerta_del_Sol_%28Madrid%29_01.jpg',
        tag: 'Capital',
        description: 'Capital de España, famosa por museos y cultura.',
        population: 3300,
        altitude: 667,
        temperature: '5-35'
      }
    ];

    this.$selector = this.shadowRoot.querySelector('#cs');
    this.$cityList = this.shadowRoot.querySelector('#city-list');
    this.$cards = this.shadowRoot.querySelector('#cards-container');
    this.$cityInfo = this.shadowRoot.querySelector('#city-info-placeholder');

    // Validación de existencia
    if (!this.$selector || !this.$cityList || !this.$cards || !this.$cityInfo) {
      console.error('CityApp: No se pudieron inicializar los componentes.');
      return;
    }

    // Cargar ciudades en el selector
    this.$selector.cities = cities;

    // Evento: se seleccionó una ciudad
    this.$selector.addEventListener('city-selected', (ev) => {
      const detail = ev.detail || {};
      const selectedName = detail.name;

      if (!selectedName) return;

      const original = detail.original || { name: selectedName };
      const cityData = { ...original };

      // Actualizar panel principal de info
      this.$cityInfo.cityData = cityData;

      // Evitar duplicados
      if (this._selectedCities.some(c => c.name === cityData.name)) {
        return;
      }

      this._selectedCities.push(cityData);

      // Actualizar lista
      this.$cityList.cities = [...this._selectedCities];

      // Render cards
      this._renderCards();
    });

    // Opcional: evento typing
    this.$selector.addEventListener('city-typing', (ev) => {
      console.log('Usuario está escribiendo:', ev.detail.query);
    });
  }

  _renderCards() {
    if (!this.$cards || !this.$cityInfo) return;

    // Oculta/limpia el placeholder si hay ciudades seleccionadas
    if (this._selectedCities.length > 0) {
      this.$cityInfo.style.display = "none";
    } else {
      this.$cityInfo.style.display = "block";
    }

    this.$cards.innerHTML = '';

    this._selectedCities.forEach(city => {
      const card = document.createElement('city-info');
      card.cityData = city;
      this.$cards.appendChild(card);
    });
  }

  _handleCityRemoved(e) {
    const name = e.detail?.name;
    if (!name) return;

    this._selectedCities = this._selectedCities.filter(c => c.name !== name);

    // Actualizar lista
    if (this.$cityList) {
      this.$cityList.cities = [...this._selectedCities];
    }

    // Actualizar tarjetas
    this._renderCards();
  }
}

customElements.define('city-app', CityApp);
