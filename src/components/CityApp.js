export class CityApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <city-selector></city-selector>
      <city-info></city-info>
    `;
  }

  connectedCallback() {
    const cityInfo = this.shadowRoot.querySelector('city-info');
    const citySelector = this.shadowRoot.querySelector('city-selector');

    // Escuchar el evento correcto que dispara city-selector
    citySelector.addEventListener('city-selected', (ev) => {
      cityInfo.nombreCiudad = ev.detail.name;  // "name" viene de city-selector
    });
  }
}

customElements.define('city-app', CityApp);