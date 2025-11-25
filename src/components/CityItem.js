export class CityItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["city"];
  }

  attributeChangedCallback() {
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const city = this.getAttribute("city") || "Ciudad";

    this.shadowRoot.innerHTML = `
      <style>
        .item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background: #f9f9f9;
          border-radius: 8px;
          margin: 6px 0;
          font-family: Arial, sans-serif;
          justify-content: space-between;
          border: 1px solid #ddd;
        }

        .left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        span {
          font-weight: 600;
        }

        button {
          background: #3498db;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          transition: 0.2s;
        }

        button.delete {
          background: #e74c3c;
        }

        button:hover {
          opacity: 0.8;
        }

        input {
          padding: 5px;
          border-radius: 5px;
          border: 1px solid #ccc;
          font-size: 14px;
        }
      </style>

      <div class="item">
        <div class="left">
          <span id="cityName">${city}</span>
          <input id="editInput" value="${city}" style="display:none;">
        </div>

        <div class="buttons">
          <button id="editBtn">Editar</button>
          <button id="saveBtn" style="display:none;">Guardar</button>
          <button class="delete" id="deleteBtn">X</button>
        </div>
      </div>
    `;

    this.addListeners();
  }

  addListeners() {
    const deleteBtn = this.shadowRoot.querySelector("#deleteBtn");
    const editBtn = this.shadowRoot.querySelector("#editBtn");
    const saveBtn = this.shadowRoot.querySelector("#saveBtn");
    const cityName = this.shadowRoot.querySelector("#cityName");
    const editInput = this.shadowRoot.querySelector("#editInput");

    // Eliminar item
    deleteBtn.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("delete-item", {
          detail: { city: this.getAttribute("city") },
          bubbles: true,
          composed: true
        })
      );
    });

    // Editar
    editBtn.addEventListener("click", () => {
      cityName.style.display = "none";
      editInput.style.display = "block";
      editBtn.style.display = "none";
      saveBtn.style.display = "inline-block";
    });

    // Guardar edición
    saveBtn.addEventListener("click", () => {
      const newCity = editInput.value.trim();

      if (!newCity) return;

      this.setAttribute("city", newCity);

      this.dispatchEvent(
        new CustomEvent("update-item", {
          detail: { newCity },
          bubbles: true,
          composed: true
        })
      );
    });
  }
}

customElements.define("city-item", CityItem);