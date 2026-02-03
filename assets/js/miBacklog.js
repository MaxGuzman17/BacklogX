let currentFilter = 'all';

function obtenerBacklog() {
    return JSON.parse(localStorage.getItem("miBacklog")) || [];
}

function guardarBacklog(datos) {
    localStorage.setItem("miBacklog", JSON.stringify(datos));
}

async function renderBacklog(filter = "all") {
    const contenedor = document.getElementById("backlogContenedor")
    if (!contenedor) return;

    contenedor.innerHTML = ""

    const listaJuegos = obtenerBacklog();

    let juegosFiltrados = (filter === "all")
        ? listaJuegos
        : listaJuegos.filter(game => game.status === filter);

    if (juegosFiltrados.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center text-white mt-5">
                <i class="bi bi-controller fs-1 text-secondary opacity-50"></i>
                <p class="fs-4 mt-3 text-secondary">No hay juegos en: <b class="text-primary">${filter.toUpperCase()}</b></p>
                <a href="../index.html" class="btn btn-outline-primary mt-2">Explorar nuevos juegos</a>
            </div>
        `;
        return;
    }

    juegosFiltrados.forEach(game => {
        const card = createBacklogCard(game);
        contenedor.appendChild(card);
    });
}

function createBacklogCard(game) {
    const card = document.createElement("div");
    card.classList.add("col-md-4", "mb-4");

    card.innerHTML = `
        <div class="card h-100 bg-dark text-white border-0 overflow-hidden transicion-hover shadow-lg">
            <!-- Imagen con Badge de Rating Flotante -->
            <div class="position-relative" style="height: 220px;">
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
                    <h5 class="card-title fw-bold text-truncate mb-1">${game.name}</h5>
                    <p class="card-text small text-secondary">
                        <i class="bi bi-calendar3 me-1"></i> ${game.released || 'TBA'}
                    </p>
                </div>
                
                <!-- Select de Estado Estilizado -->
                <div class="mt-2">
                    <label class="small text-secondary mb-2 fw-bold uppercase">CAMBIAR ESTADO:</label>
                    <select class="form-select select-estado-juego status-select" data-id="${game.id}">
                        <option value="backlog" ${game.status === "backlog" ? "selected" : ""}>📁 Backlog</option>
                        <option value="JUGANDO" ${game.status === "JUGANDO" ? "selected" : ""}>🎮 Jugando</option>
                        <option value="COMPLETADOS" ${game.status === "COMPLETADOS" ? "selected" : ""}>🏆 Completado</option>
                    </select>
                </div>

                <!-- Botón Eliminar Estilizado -->
                <button data-id="${game.id}" class="btn btn-sm btn-outline-danger mt-3 py-2 fw-bold delete-btn">
                    <i class="bi bi-trash3-fill me-2"></i>ELIMINAR DE LA LISTA
                </button>
            </div>
        </div>`;
    return card;
}

// --- eliminar y cambiar estado ---
document.getElementById("backlogContenedor").addEventListener("click", (e) => {
    const btn = e.target.closest(".delete-btn");

    if (btn) {
        const id = parseInt(btn.dataset.id)
        let lista = obtenerBacklog();
        lista = lista.filter(j => j.id !== id);
        guardarBacklog(lista);
        renderBacklog(currentFilter);
    }
});

document.getElementById("backlogContenedor").addEventListener("change", (e) => {
    if (e.target.classList.contains("status-select")) {
        const id = parseInt(e.target.dataset.id);
        const nuevoEstado = e.target.value;
        let lista = obtenerBacklog();

        lista = lista.map(j => j.id === id ? { ...j, status: nuevoEstado } : j);
        guardarBacklog(lista);
        renderBacklog(currentFilter); // Recargar para aplicar filtros si es necesario

        //si se cambia el estado y no esta en el filtro "todos", el juego desaparece de la vista actual
        renderBacklog(currentFilter);
    }
});

// --- filtros ---
document.querySelectorAll("[data-filter]").forEach(button => {
    button.addEventListener("click", (e) => {
        document.querySelectorAll("[data-filter]").forEach(btn => {
            btn.classList.remove("active", "btn-primary");
            btn.classList.add("btn-outline-primary");
        });

        e.target.classList.add("active", "btn-primary");
        e.target.classList.remove("btn-outline-primary");

        currentFilter = button.dataset.filter;
        renderBacklog(currentFilter);
    });
});

document.addEventListener("DOMContentLoaded", () => renderBacklog());
