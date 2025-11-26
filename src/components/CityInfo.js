// CityInfo.js (CORREGIDO)

const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: block;
            margin-top: 30px;
            font-family: Arial, sans-serif;
            color: #333;
        }
        .city-card {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.08);
            overflow: hidden;
            max-width: 600px;
            margin: 0 auto;
        }
        .image-container {
            width: 100%;
            height: 200px;
            background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 50%, rgba(100,100,100,0.3) 100%);
            background-size: cover;
            background-position: center;
            position: relative;
            display: flex;
            align-items: flex-end;
            padding: 20px;
            box-sizing: border-box;
            color: #fff;
            font-size: 1.8em;
            font-weight: bold;
        }
        .image-container.has-image {
            background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 50%);
            background-size: cover;
            background-position: center;
        }
        .city-name-overlay {
            position: absolute;
            bottom: 20px;
            left: 20px;
            font-size: 1.8em;
            font-weight: bold;
            color: #fff;
        }
        .card-content {
            padding: 20px;
        }
        .tag {
            display: inline-block;
            background: #e0f2f7;
            color: #0b76ef;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .description {
            font-size: 1em;
            line-height: 1.6;
            color: #555;
            margin-bottom: 25px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            text-align: center;
            border-top: 1px solid #eee;
            padding-top: 20px;
            margin-top: 20px;
        }
        .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            font-size: 0.9em;
            color: #666;
        }
        .stat-icon {
            font-size: 1.4em;
            margin-bottom: 8px;
        }
        .stat-icon.population { color: #0b76ef; }
        .stat-icon.altitude { color: #4CAF50; }
        .stat-icon.temperature { color: #FF9800; }
        .stat-value {
            font-weight: bold;
            color: #333;
            margin-top: 5px;
        }
        .no-city-selected {
            text-align: center;
            padding: 50px 20px;
            background: #f9f9f9;
            border: 1px dashed #ddd;
            border-radius: 8px;
            color: #777;
        }
    </style>

    <div class="city-card" id="card-container">
        <div class="image-container" id="image-container">
            <span class="city-name-overlay" id="city-name-overlay"></span>
        </div>
        <div class="card-content">
            <span class="tag" id="city-tag"></span>
            <p class="description" id="city-description"></p>

            <div class="stats-grid">
                <div class="stat-item">
                    <i class="fas fa-users stat-icon population"></i>
                    <span id="stat-population" class="stat-value">N/A</span>
                    <span>Población</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-mountain stat-icon altitude"></i>
                    <span id="stat-altitude" class="stat-value">N/A</span>
                    <span>Altitud</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-thermometer-half stat-icon temperature"></i>
                    <span id="stat-temperature" class="stat-value">N/A</span>
                    <span>Temp. Prom.</span>
                </div>
            </div>
        </div>
    </div>

    <div class="no-city-selected" id="no-city-message" style="display: none;">
        <h3>No hay ciudad seleccionada</h3>
        <p>Selecciona una ciudad para mostrar información.</p>
    </div>
`;

export class CityInfo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.$cardContainer = this.shadowRoot.getElementById('card-container');
    this.$noCityMessage = this.shadowRoot.getElementById('no-city-message');
    this.$imageContainer = this.shadowRoot.getElementById('image-container');
    this.$cityNameOverlay = this.shadowRoot.getElementById('city-name-overlay');
    this.$cityTag = this.shadowRoot.getElementById('city-tag');
    this.$cityDescription = this.shadowRoot.getElementById('city-description');
    this.$statPopulation = this.shadowRoot.getElementById('stat-population');
    this.$statAltitude = this.shadowRoot.getElementById('stat-altitude');
    this.$statTemperature = this.shadowRoot.getElementById('stat-temperature');

    this._cityData = null;
  }

  connectedCallback() { this._render(); }

  set cityData(data) {
    if (data && typeof data === "object") {
      this._cityData = data;
    } else if (typeof data === "string") {
      this._cityData = { name: data };
    } else {
      this._cityData = null;
    }
    this._render();
  }

  _render() {
    if (!this._cityData || !this._cityData.name) {
      this.$cardContainer.style.display = "none";
      this.$noCityMessage.style.display = "block";
      return;
    }

    this.$cardContainer.style.display = "block";
    this.$noCityMessage.style.display = "none";

    const city = this._cityData;

    this.$cityNameOverlay.textContent = city.name;
    this.$cityTag.textContent = city.tag || "General";
    this.$cityDescription.textContent = city.description || "No hay descripción disponible.";

    if (city.image) {
      this.$imageContainer.style.backgroundImage =
        `linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 50%), url(${city.image})`;
      this.$imageContainer.classList.add("has-image");
    } else {
      this.$imageContainer.style.backgroundImage = `linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 50%)`;
      this.$imageContainer.classList.remove("has-image");
    }

    this.$statPopulation.textContent = city.population ? `${city.population}K` : "N/A";
    this.$statAltitude.textContent = city.altitude ? `${city.altitude}m` : "N/A";
    this.$statTemperature.textContent = city.temperature ? `${city.temperature}°C` : "N/A";
  }
}

customElements.define("city-info", CityInfo);
