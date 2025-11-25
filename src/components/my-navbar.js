class MyNavbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <style>

        /* Variables de color (modo claro/oscuro) */
        :host {
          --bg-color: #2c3e50;
          --text-color: white;
          --dropdown-bg: #34495e;
          --hover-bg: #3e5870;
        }

        :host(.light) {
          --bg-color: #f2f2f2;
          --text-color: #222;
          --dropdown-bg: #e0e0e0;
          --hover-bg: #cfcfcf;
        }

        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-color);
          padding: 10px 20px;
          color: var(--text-color);
          font-family: Arial;
        }

        .logo {
          font-size: 1.3rem;
          font-weight: bold;
        }

        .right-side {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .toggle-theme {
          background: var(--dropdown-bg);
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          color: var(--text-color);
          cursor: pointer;
        }

        .toggle-theme:hover {
          background: var(--hover-bg);
        }

        .links-box {
          position: relative;
          background: var(--dropdown-bg);
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
        }

        .links-box:hover {
          background: var(--hover-bg);
        }

        .dropdown {
          position: absolute;
          top: 40px;
          left: 0;
          background: var(--dropdown-bg);
          padding: 10px;
          border-radius: 6px;
          display: none;
          flex-direction: column;
          gap: 8px;
          width: 180px;

          opacity: 0;
          transform: translateY(-10px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        /* Mostrar menú */
        .links-box:hover .dropdown {
          display: flex;
          opacity: 1;
          transform: translateY(0);
        }

        .dropdown a {
          color: var(--text-color);
          text-decoration: none;
          background: var(--bg-color);
          padding: 6px 10px;
          border-radius: 4px;
        }

        .dropdown a:hover {
          background: #1abc9c;
        }

      </style>

      <nav>

        <div class="logo">Mi Web</div>

        <div class="right-side">

          <!-- Links primero -->
          <div class="links-box">
            Links
            <div class="dropdown">
              <a href="https://www.espe.edu.ec/" target="_blank">Página ESPE</a>
              <a href="https://github.com/dekoov/PICW-Selector-Ciudad-WC/tree/main" target="_blank">Código en GitHub</a>
            </div>
          </div>

          <!-- Botón modo claro/oscuro al final -->
          <button class="toggle-theme">Modo Claro/Oscuro</button>

        </div>

      </nav>
    `;

    this.toggleTheme = this.toggleTheme.bind(this);
  }

  connectedCallback() {
    this.shadowRoot
      .querySelector(".toggle-theme")
      .addEventListener("click", this.toggleTheme);
  }

  toggleTheme() {
    this.classList.toggle("light");
  }
}

customElements.define("my-navbar", MyNavbar);
