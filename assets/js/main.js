const contenedor = document.getElementById("contenedorCards");
const paginacion = document.getElementById("paginacion");
const API_KEY = 'b82fdbe38d574dcaa6bf9d9b431df092';
let currentPage = 1;
let searchTerm = "";
let miBacklog = JSON.parse(localStorage.getItem("miBacklog")) || [];
const MAX_PAGES = 4;

async function renderJuegos() {
    const URL = `https://api.rawg.io/api/games?key=${API_KEY}&page_size=12&page=${currentPage}&search=${searchTerm}`;

    try {
        const response = await fetch(URL);
        if (!response.ok) throw new Error("Error en la API");

        const data = await response.json();
        const games = data.results;

        //1 limpiar contenedor
        contenedor.innerHTML = ``;

        //2 renderizar las cards
        games.forEach(game => {
            const existeEnBacklog = miBacklog.some(item => item.id === game.id);
            const overlayStatus = existeEnBacklog
                ? `<div class="estado-badge active">
                        <span class="badge bg-success fs-6 shadow-lg">
                            <i class="bi bi-collection-play-fill me-2"></i>EN TU LISTA
                        </span>
                    </div>`
                : "";

            const acciones = existeEnBacklog
                ? `<span class="badge bg-secondary w-100 py-2"><i class="bi bi-check-lg"></i> En tu Backlog</span>`
                : `<select class="form-select bg-dark text-white border-secondary select-status" data-game-id="${game.id}">
                    <option value="" selected disabled>Añadir a...</option>
                    <option value="backlog">Backlog</option>
                    <option value="JUGANDO">Jugando</option>
                    <option value="COMPLETADOS">Completado</option>
                </select>`;

            const card = document.createElement("div");
            card.classList.add("col-md-4", "mb-4");

            card.innerHTML = `
                <div class="card h-100 bg-dark text-white overflow-hidden transicion-hover shadow-lg">
                    <div class="position-relative" style="height: 220px;">
                        ${overlayStatus}
                        <img src="${game.background_image || 'https://via.placeholder.com'}" 
                            class="card-img h-100 w-100" style="object-fit: cover;">
                        <div class="position-absolute top-0 end-0 m-2">
                            <span class="badge rounded-pill bg-black bg-opacity-75 text-warning border border-warning">
                                ⭐ ${game.rating}
                            </span>
                        </div>
                    </div>

                    <div class="card-body d-flex flex-column justify-content-between p-4">
                        <div class="mb-3">
                            <h5 class="card-title fw-black text-truncate mb-1">${game.name}</h5>
                            <p class="text-secondary small">
                                <i class="bi bi-calendar3 me-1"></i> ${game.released || 'TBA'}
                            </p>
                        </div>

                        ${existeEnBacklog
                            ? `<button class="btn btn-secondary w-100 disabled py-2 fw-bold">
                                    GESTIONAR EN BACKLOG
                                </button>`
                            : `<div class="mt-auto">
                                    <label class="small text-secondary mb-2 fw-bold">AÑADIR A MI LISTA:</label>
                                    <select class="form-select select-estado-juego" data-game-id="${game.id}">
                                        <option value="" selected disabled>Seleccionar estado...</option>
                                        <option value="backlog">📁 Backlog</option>
                                        <option value="JUGANDO">🎮 Jugando</option>
                                        <option value="COMPLETADOS">🏆 Completado</option>
                                    </select>
                                </div>`
                        }
                    </div>
                </div>`;
            
                //evento para guardar
            if (!existeEnBacklog) {
                const select = card.querySelector(".select-estado-juego");
                select.addEventListener("change", (e) => {
                    const status = e.target.value;
                    agregarAlBacklog(game, status);

                    // Feedback visual rapido
                    renderJuegos(); 
                });
            }
            contenedor.appendChild(card);
        });

        actualizarPaginacion();

    } catch (error) {
        console.error("Hubo un inconveniente al cargar la información", error);
        contenedor.innerHTML += `<p class="text-danger">Error: ${error.message}</p>`;
    }
}

function agregarAlBacklog(game, status) {
    //verifica si existe
    const juegoGuardar = { ...game, status: status };

    miBacklog.push(juegoGuardar);
    localStorage.setItem("miBacklog", JSON.stringify(miBacklog));
}


function actualizarPaginacion() {
    paginacion.innerHTML = ``;

    for (let i = 1; i <= MAX_PAGES; i++) {
        const li = document.createElement("li");
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<button class="page-link bg-dark text-white border-secondary">${i}</button>`;
        li.onclick = () => {
            currentPage = i;
            renderJuegos();
            window.scrollTo(0, 0); //sube al inicio al cambiar de pagina
        };

        paginacion.appendChild(li);
    }

}

const buscador = document.getElementById("buscador").addEventListener("input", (e) => {
    searchTerm = e.target.value;
    currentPage = 1 //siempre se vuelve a la primer pagina     
    renderJuegos();
})

//carga inicial de los juegos
renderJuegos();

