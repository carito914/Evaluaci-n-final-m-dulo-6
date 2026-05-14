// ============ AGREGAR MASCOTA ============
const formAgregar = document.getElementById("formAgregar");

if (formAgregar) {
    formAgregar.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const rut = document.getElementById("rut").value.trim();
        const mensaje = document.getElementById("mensaje");

        if (!nombre || !rut) {
            mensaje.textContent = "Debe completar ambos campos.";
            mensaje.style.color = "red";
            return;
        }

        try {
            await axios.post("/api/mascotas", { nombre, rut });
            mensaje.textContent = " Mascota agregada correctamente.";
            mensaje.style.color = "green";
            formAgregar.reset();
            
            // Recargar después de 1 segundo
            setTimeout(() => {
                window.location.href = "/";
            }, 1000);
            
        } catch (error) {
            if (error.response && error.response.status === 400) {
                mensaje.textContent = error.response.data.error;
            } else {
                mensaje.textContent = " Error al agregar mascota.";
            }
            mensaje.style.color = "red";
        }
    });
}

// ============ BUSCAR POR NOMBRE ============
const formBuscarNombre = document.getElementById("formBuscarNombre");

if (formBuscarNombre) {
    formBuscarNombre.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = document.getElementById("buscarNombre").value.trim();
        const resultado = document.getElementById("resultado");

        if (!nombre) {
            resultado.textContent = "Debe ingresar un nombre.";
            resultado.style.color = "red";
            return;
        }

        try {
            const res = await axios.get(`/api/mascotas?nombre=${nombre}`);
            resultado.innerHTML = `
                <p style="color: green;">
                    <strong> Mascota encontrada:</strong><br>
                    <strong>${res.data.nombre}</strong> — RUT dueño: ${res.data.rut}
                </p>
            `;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                resultado.innerHTML = `<p style="color: red;"> Mascota "${nombre}" no encontrada.</p>`;
            } else {
                resultado.innerHTML = `<p style="color: red;"> Error al buscar mascota.</p>`;
            }
        }
    });
}

// ============ BUSCAR POR RUT ============
const formBuscarRut = document.getElementById("formBuscarRut");

if (formBuscarRut) {
    formBuscarRut.addEventListener("submit", async (e) => {
        e.preventDefault();

        const rut = document.getElementById("buscarRut").value.trim();
        const resultado = document.getElementById("resultado");

        if (!rut) {
            resultado.textContent = "Debe ingresar un RUT.";
            resultado.style.color = "red";
            return;
        }

        try {
            const res = await axios.get(`/api/mascotas?rut=${rut}`);

            if (res.data.length === 0) {
                resultado.innerHTML = `<p style="color: orange;"> No hay mascotas asociadas al RUT ${rut}</p>`;
                return;
            }

            let html = `<p style="color: green;"><strong> Mascotas encontradas (${res.data.length}):</strong></p>`;
            res.data.forEach(m => {
                html += `<p><strong>${m.nombre}</strong> — RUT dueño: ${m.rut}</p>`;
            });
            resultado.innerHTML = html;

        } catch (error) {
            resultado.innerHTML = `<p style="color: red;"> Error al buscar por RUT.</p>`;
        }
    });
}

// ============ ELIMINAR POR NOMBRE ============
const formEliminarNombre = document.getElementById("formEliminarNombre");

if (formEliminarNombre) {
    formEliminarNombre.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = document.getElementById("eliminarNombre").value.trim();
        const mensaje = document.getElementById("mensajeEliminar");

        if (!nombre) {
            mensaje.textContent = "Debe ingresar un nombre.";
            mensaje.style.color = "red";
            return;
        }

        try {
            //  Usando query string (correcto)
            await axios.delete(`/api/mascotas?nombre=${nombre}`);
            mensaje.textContent = ` Mascota "${nombre}" eliminada correctamente.`;
            mensaje.style.color = "green";
            document.getElementById("eliminarNombre").value = "";
            
            // Recargar después de 1 segundo
            setTimeout(() => {
                window.location.href = "/";
            }, 1000);
            
        } catch (error) {
            if (error.response && error.response.status === 404) {
                mensaje.textContent = ` Mascota "${nombre}" no encontrada.`;
            } else {
                mensaje.textContent = " Error al eliminar mascota.";
            }
            mensaje.style.color = "red";
        }
    });
}

// ============ ELIMINAR POR RUT ============
const formEliminarRut = document.getElementById("formEliminarRut");

if (formEliminarRut) {
    formEliminarRut.addEventListener("submit", async (e) => {
        e.preventDefault();

        const rut = document.getElementById("eliminarRut").value.trim();
        const mensaje = document.getElementById("mensajeEliminar");

        if (!rut) {
            mensaje.textContent = "Debe ingresar un RUT.";
            mensaje.style.color = "red";
            return;
        }

        try {
            //  Usando query string (correcto)
            const res = await axios.delete(`/api/mascotas?rut=${rut}`);
            mensaje.textContent = ` ${res.data.mensaje}`;
            mensaje.style.color = "green";
            document.getElementById("eliminarRut").value = "";
            
            // Recargar después de 1 segundo
            setTimeout(() => {
                window.location.href = "/";
            }, 1000);
            
        } catch (error) {
            if (error.response && error.response.status === 404) {
                mensaje.textContent = ` ${error.response.data.error}`;
            } else {
                mensaje.textContent = " Error al eliminar por RUT.";
            }
            mensaje.style.color = "red";
        }
    });
}