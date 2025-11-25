export class CityApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <city-selector id="cs" placeholder="Ingresa ciudad"></city-selector>
      <city-info></city-info>
    `;
  }

  connectedCallback() {
    // Datos DEMO CitySelector
    const cities = [
      'Quito',
      'Guayaquil',
      'Cuenca',
      'Ambato',
      'Loja',
      'Manta',
      'Salinas',
      'Ibarra',
      'Riobamba',
      'Machala',
      { name: 'New York', country: 'USA' },
      { name: 'Los Angeles', country: 'USA' },
      { name: 'Madrid', country: 'Spain' }
    ];

    // 2. OBTENER EL ELEMENTO HIJO USANDO shadowRoot
    const citySelector = this.shadowRoot.querySelector('#cs');
    const cityInfo = this.shadowRoot.querySelector('city-info');    

    // a) Pasar la lista de ciudades
    if (citySelector) {
      citySelector.cities = cities; // Asignamos la propiedad pública 'cities'

      // b) Escuchar el evento 'city-selected' (Lógica Principal)
      citySelector.addEventListener('city-selected', (ev) => {
        console.log('Ciudad Seleccionada desde CityApp:', ev.detail.name);
        cityInfo.nombreCiudad = ev.detail.name; // Actualiza el componente city-info
      });

      // c) Escuchar 'city-typing' (Opcional)
      citySelector.addEventListener('city-typing', (e) => {
        // Lógica para búsqueda remota si la lista fuera muy grande
        console.log('El usuario está escribiendo:', e.detail.query);
      });
    }

  }
}

customElements.define('city-app', CityApp);
