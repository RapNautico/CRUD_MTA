//Conexion con la base de datos
const db = firebase.firestore();
//Se obtienen los id
const taskForm = document.getElementById("task-form");
const tasksContainer = document.getElementById("tasks-container");
const inputs = document.querySelectorAll('#task-form input');
//Se agregan las expreciones
const expressions = {
    nombre: /^[a-zA-ZÀ-ÿ\s]{8,40}$/,
    correo: /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
}
//Se validan los campos
const validarFormulario = (e) => {
    switch (e.target.name) {
		case "nombre":
			validarCampo(expressions.nombre, e.target, 'nombre');
		break;
		case "correo":
			validarCampo(expressions.correo, e.target, 'correo');
		break;
	}
}
const campos = {
	nombre: false,
	correo: false,
}
//Se mustran los iconos y texto de la validacion
const validarCampo = (expresion, input, campo) => {
	if(expresion.test(input.value)){
		document.getElementById(`grupo__${campo}`).classList.remove('formulario__grupo-incorrecto');
		document.getElementById(`grupo__${campo}`).classList.add('formulario__grupo-correcto');
		document.querySelector(`#grupo__${campo} i`).classList.add('fa-check-circle');
		document.querySelector(`#grupo__${campo} i`).classList.remove('fa-times-circle');
		document.querySelector(`#grupo__${campo} .formulario__input-error`).classList.remove('formulario__input-error-activo');
		campos[campo] = true;
	} else {
		document.getElementById(`grupo__${campo}`).classList.add('formulario__grupo-incorrecto');
		document.getElementById(`grupo__${campo}`).classList.remove('formulario__grupo-correcto');
		document.querySelector(`#grupo__${campo} i`).classList.add('fa-times-circle');
		document.querySelector(`#grupo__${campo} i`).classList.remove('fa-check-circle');
		document.querySelector(`#grupo__${campo} .formulario__input-error`).classList.add('formulario__input-error-activo');
		campos[campo] = false;
	}
}
//Se detecta cuando se oprime una tecla o se da un click
inputs.forEach((input) => {
	input.addEventListener('keyup', validarFormulario);
	input.addEventListener('blur', validarFormulario);
});

let editStatus = false;
let id = '';

/**
 * Save a New Task in Firestore
 * @param {string} nombre the title of the Task
 * @param {string} correo the description of the Task
 */
const saveTask = (nombre, correo) =>
  db.collection("tasks").doc().set({
    nombre,
    correo,
  });
  //Se obtienen los elementos
const getTasks = () => db.collection("tasks").get();

const onGetTasks = (callback) => db.collection("tasks").onSnapshot(callback);

const deleteTask = (id) => db.collection("tasks").doc(id).delete();

const getTask = (id) => db.collection("tasks").doc(id).get();

const updateTask = (id, updatedTask) => db.collection('tasks').doc(id).update(updatedTask);

window.addEventListener("DOMContentLoaded", async (e) => {
  onGetTasks((querySnapshot) => {
    tasksContainer.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const task = doc.data();
//Se crea la tabla
      tasksContainer.innerHTML += `<div class="card card-body mt-2 border-primary">
      <table class="table align-middle">
          <thead>
             <tr>
              <th scope="col">#</th>
              <th scope="col">Nombre</th>
              <th scope="col">Correo</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
              <tr>
                <th scope="row">${task.id}</th>
                <td>${task.nombre}</td>
                <td>${task.correo}</td>
                <td><button class="btn btn-primary btn-delete" data-id="${doc.id}">
                🗑 Delete
              </button>
              <button class="btn btn-secondary btn-edit" data-id="${doc.id}">
                🖉 Edit
              </button>
              </td>
              </tr>
          </tbody>
      </table>
  </div>`;
    });
//Se realiza la funcion del delete
    const btnsDelete = tasksContainer.querySelectorAll(".btn-delete");
    btnsDelete.forEach((btn) =>
      btn.addEventListener("click", async (e) => {
        console.log(e.target.dataset.id);
        try {
          await deleteTask(e.target.dataset.id);
        } catch (error) {
          console.log(error);
        }
      })
    );
//Se realiza la funcion del edit
    const btnsEdit = tasksContainer.querySelectorAll(".btn-edit");
    btnsEdit.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        try {
          const doc = await getTask(e.target.dataset.id);
          const task = doc.data();
          taskForm["nombre"].value = task.nombre;
          taskForm["correo"].value = task.correo;

          editStatus = true;
          id = doc.id;
          taskForm["btn btn-primary formulario__btn"].innerText = "Update";
          
        } catch (error) {
          console.log(error);
        }
      });
    });
  });
});
//Se realiza validacion cuando se da click en el boton
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = taskForm["nombre"];
  const correo = taskForm["correo"];
try {
  if (campos.nombre && campos.correo && !editStatus) {
    await saveTask(nombre.value, correo.value);
    taskForm.reset();

		document.getElementById('formulario__mensaje-exito').classList.add('formulario__mensaje-exito-activo');
		setTimeout(() => {
			document.getElementById('formulario__mensaje-exito').classList.remove('formulario__mensaje-exito-activo');
		}, 5000);

		document.querySelectorAll('.formulario__grupo-correcto').forEach((icono) => {
			icono.classList.remove('formulario__grupo-correcto');
		});
  }
  else{
    document.getElementById('formulario__mensaje').classList.add('formulario__mensaje-activo');
    await updateTask(id, {
      nombre: nombre.value,
      correo: correo.value,
    })
    editStatus = false;
    id = '';
    taskForm['btn-task-form'].innerText = 'Save';
  }
      taskForm.reset();
      nombre.focus();
} catch (error) {
    console.log(error);
}
 
});
