/* ==========================================
   HARMONY SERVICES
   Fonctionnement de l'application
========================================== */

let currentFilter = "all";
let calendarDate = new Date();
calendarDate.setDate(1);


/* ==========================================
   DATES
========================================== */

function todayISO() {
  const d = new Date();

  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

function addDays(number) {
  const d = new Date();
  d.setDate(d.getDate() + number);

  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

function formatDate(dateString) {

  if (dateString === todayISO()) {
    return "Aujourd'hui";
  }

  if (dateString === addDays(1)) {
    return "Demain";
  }

  const d = new Date(dateString + "T12:00:00");

  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
}


/* ==========================================
   DONNÉES DE DÉPART
========================================== */

const defaultTasks = [

  {
    id: 1,
    property: "Studio Bouches du Loup",
    date: todayISO(),
    time: "10:00",
    type: "cleaning_linen",
    person: "Sophie",
    status: "todo",
    notes: "Vérifier le réfrigérateur et préparer le linge."
  },

  {
    id: 2,
    property: "Appartement Marina",
    date: todayISO(),
    time: "14:00",
    type: "cleaning",
    person: "Cécile",
    status: "progress",
    notes: "Arrivée des voyageurs prévue à 17h."
  },

  {
    id: 3,
    property: "Villa Azur",
    date: addDays(1),
    time: "11:00",
    type: "maintenance",
    person: "Marc",
    status: "todo",
    notes: "Vérifier la poignée de la baie vitrée."
  }

];


let tasks;

try {
  tasks =
    JSON.parse(localStorage.getItem("harmony_tasks")) ||
    defaultTasks;
} catch (error) {
  tasks = defaultTasks;
}


/* ==========================================
   SAUVEGARDE
========================================== */

function saveLocal() {

  localStorage.setItem(
    "harmony_tasks",
    JSON.stringify(tasks)
  );
}


/* ==========================================
   SÉCURITÉ AFFICHAGE
========================================== */

function escapeHtml(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* ==========================================
   TYPES DE PRESTATIONS
========================================== */

function serviceInfo(type) {

  if (type === "cleaning_linen") {

    return {
      icon: "🧹 🧺",
      label: "Ménage + linge",
      css: "cleaning_linen"
    };
  }

  if (type === "maintenance") {

    return {
      icon: "🔧",
      label: "Maintenance",
      css: "maintenance"
    };
  }

  return {
    icon: "🧹",
    label: "Ménage",
    css: "cleaning"
  };
}


/* ==========================================
   STATUTS
========================================== */

function statusLabel(status) {

  if (status === "done") {
    return "Terminé";
  }

  if (status === "progress") {
    return "En cours";
  }

  return "À faire";
}


/* ==========================================
   NAVIGATION
========================================== */

function showPage(page, button) {

  const pages = [
    "planning",
    "calendar",
    "properties",
    "team",
    "linen"
  ];

  pages.forEach(function(name) {

    const element =
      document.getElementById(name + "Page");

    if (element) {
      element.classList.toggle(
        "hidden",
        name !== page
      );
    }
  });


  document
    .querySelectorAll(".nav")
    .forEach(function(nav) {
      nav.classList.remove("active");
    });


  if (button) {
    button.classList.add("active");
  }


  if (page === "calendar") {
    renderCalendar();
  }
}


/* ==========================================
   FILTRES PLANNING
========================================== */

function setFilter(filter) {

  currentFilter = filter;


  document
    .querySelectorAll(".filter")
    .forEach(function(button) {

      button.classList.toggle(
        "active",
        button.dataset.filter === filter
      );
    });


  renderPlanning();
}


/* ==========================================
   PLANNING
========================================== */

function renderPlanning() {

  let list = tasks.slice();


  list.sort(function(a, b) {

    return (
      a.date + " " + a.time
    ).localeCompare(
      b.date + " " + b.time
    );
  });


  if (currentFilter === "today") {

    list = list.filter(function(task) {
      return task.date === todayISO();
    });
  }


  if (currentFilter === "todo") {

    list = list.filter(function(task) {
      return task.status !== "done";
    });
  }


  if (currentFilter === "done") {

    list = list.filter(function(task) {
      return task.status === "done";
    });
  }


  const container =
    document.getElementById("planning");


  if (!container) {
    return;
  }


  if (list.length === 0) {

    container.innerHTML =
      '<div class="empty">Aucune prestation.</div>';

    return;
  }


  let html = "";


  list.forEach(function(task) {

    const service =
      serviceInfo(task.type);


    html +=
      '<div class="card">' +

        '<div class="cardTop">' +

          '<div>' +

            '<div class="time">' +
              escapeHtml(formatDate(task.date)) +
              " · " +
              escapeHtml(task.time) +
            '</div>' +

            '<div class="property">' +
              escapeHtml(task.property) +
            '</div>' +

            '<div class="type">' +
              service.icon +
              " " +
              escapeHtml(service.label) +
            '</div>' +

          '</div>' +


          '<div class="badge ' +
            escapeHtml(task.status) +
          '">' +

            escapeHtml(
              statusLabel(task.status)
            ) +

          '</div>' +

        '</div>' +


        '<div class="infoGrid">' +

          '<div class="info">' +

            '<span class="label">' +
              "Intervenant" +
            '</span>' +

            escapeHtml(
              task.person || "Non affecté"
            ) +

          '</div>' +


          '<div class="info">' +

            '<span class="label">' +
              "Prestation" +
            '</span>' +

            service.icon +
            " " +
            escapeHtml(service.label) +

          '</div>' +

        '</div>' +


        (
          task.notes
            ?
            '<div class="note">' +
              escapeHtml(task.notes) +
            '</div>'
            :
            ""
        ) +


        '<div class="cardActions">' +

          '<button class="action" ' +
            'onclick="editTask(' +
            task.id +
            ')">' +
            "Modifier" +
          '</button>' +


          (
            task.status !== "done"
              ?
              '<button class="action primary" ' +
                'onclick="completeTask(' +
                task.id +
                ')">' +
                "✓ Terminer" +
              '</button>'
              :
              '<button class="action" ' +
                'onclick="reopenTask(' +
                task.id +
                ')">' +
                "Réouvrir" +
              '</button>'
          ) +

        '</div>' +

      '</div>';
  });


  container.innerHTML = html;
}


/* ==========================================
   CALENDRIER
========================================== */

function renderCalendar() {

  const grid =
    document.getElementById("calendarGrid");

  const monthTitle =
    document.getElementById("calendarMonth");


  if (!grid || !monthTitle) {
    return;
  }


  const year =
    calendarDate.getFullYear();

  const month =
    calendarDate.getMonth();


  monthTitle.textContent =
    calendarDate.toLocaleDateString(
      "fr-FR",
      {
        month: "long",
        year: "numeric"
      }
    );


  const firstDay =
    new Date(year, month, 1);


  const offset =
    (firstDay.getDay() + 6) % 7;


  const numberOfDays =
    new Date(
      year,
      month + 1,
      0
    ).getDate();


  let html = "";


  for (
    let blank = 0;
    blank < offset;
    blank++
  ) {

    html +=
      '<div class="calendarDay emptyDay"></div>';
  }


  for (
    let day = 1;
    day <= numberOfDays;
    day++
  ) {

    const dateString =
      year +
      "-" +
      String(month + 1).padStart(2, "0") +
      "-" +
      String(day).padStart(2, "0");


    const dayTasks =
      tasks.filter(function(task) {
        return task.date === dateString;
      });


    html +=
      '<div class="calendarDay ' +
      (
        dateString === todayISO()
          ? "today"
          : ""
      ) +
      '" onclick="openModal(\\'' +
      dateString +
      '\\')">' +


      '<div class="dayNumber">' +
        day +
      '</div>';


    dayTasks.forEach(function(task) {

      const service =
        serviceInfo(task.type);


      html +=
        '<div class="calendarEvent ' +
        service.css +
        '" ' +

        'onclick="event.stopPropagation(); editTask(' +
        task.id +
        ')">' +

        service.icon +
        " " +
        escapeHtml(task.time) +

        '<br>' +

        escapeHtml(task.property) +

        '</div>';
    });


    html += '</div>';
  }


  grid.innerHTML = html;
}


function previousMonth() {

  calendarDate.setMonth(
    calendarDate.getMonth() - 1
  );

  renderCalendar();
}


function nextMonth() {

  calendarDate.setMonth(
    calendarDate.getMonth() + 1
  );

  renderCalendar();
}


/* ==========================================
   LOGEMENTS
========================================== */

function renderProperties() {

  const container =
    document.getElementById("propertyList");


  if (!container) {
    return;
  }


  const properties = {};


  tasks.forEach(function(task) {

    if (!properties[task.property]) {

      properties[task.property] = {
        total: 0,
        todo: 0
      };
    }


    properties[task.property].total++;


    if (task.status !== "done") {
      properties[task.property].todo++;
    }
  });


  let html = "";


  Object.keys(properties)
    .sort()
    .forEach(function(property) {

      const info =
        properties[property];


      html +=
        '<div class="card propertyCard">' +

          '<div class="houseIcon">⌂</div>' +

          '<div>' +

            '<div class="property">' +
              escapeHtml(property) +
            '</div>' +

            '<div class="type">' +

              info.todo +
              " à faire · " +
              info.total +
              " prestation(s)" +

            '</div>' +

          '</div>' +

        '</div>';
    });


  container.innerHTML =
    html ||
    '<div class="empty">Aucun logement.</div>';
}


/* ==========================================
   ÉQUIPE
========================================== */

function renderTeam() {

  const container =
    document.getElementById("teamList");


  if (!container) {
    return;
  }


  const people = {};


  tasks.forEach(function(task) {

    const person =
      task.person || "Non affecté";


    if (!people[person]) {

      people[person] = {
        total: 0,
        todo: 0
      };
    }


    people[person].total++;


    if (task.status !== "done") {
      people[person].todo++;
    }
  });


  let html = "";


  Object.keys(people)
    .sort()
    .forEach(function(person) {

      const initials =
        person
          .split(" ")
          .map(function(word) {
            return word.charAt(0);
          })
          .join("")
          .substring(0, 2)
          .toUpperCase();


      html +=
        '<div class="card">' +

          '<div class="row">' +

            '<div style="display:flex;align-items:center;gap:12px">' +

              '<div class="teamAvatar">' +
                escapeHtml(initials) +
              '</div>' +

              '<div>' +

                '<div class="property">' +
                  escapeHtml(person) +
                '</div>' +

                '<div class="type">' +
                  people[person].todo +
                  " prestation(s) à faire" +
                '</div>' +

              '</div>' +

            '</div>' +

            '<div class="badge done">' +
              people[person].total +
            '</div>' +

          '</div>' +

        '</div>';
    });


  container.innerHTML =
    html ||
    '<div class="empty">Aucun intervenant.</div>';
}


/* ==========================================
   LINGE
========================================== */

function renderLinen() {

  const container =
    document.getElementById("linenList");


  if (!container) {
    return;
  }


  const linenTasks =
    tasks.filter(function(task) {
      return task.type === "cleaning_linen";
    });


  const active =
    linenTasks.filter(function(task) {
      return task.status !== "done";
    });


  const ready =
    linenTasks.filter(function(task) {
      return task.status === "done";
    });


  const dirtyElement =
    document.getElementById("linenDirty");

  const readyElement =
    document.getElementById("linenReady");


  if (dirtyElement) {
    dirtyElement.textContent = active.length;
  }


  if (readyElement) {
    readyElement.textContent = ready.length;
  }


  let html = "";


  linenTasks.forEach(function(task) {

    html +=
      '<div class="card">' +

        '<div class="row">' +

          '<div>' +

            '<div class="property">' +
              "🧹 🧺 " +
              escapeHtml(task.property) +
            '</div>' +

            '<div class="type">' +

              escapeHtml(
                formatDate(task.date)
              ) +

              " · " +

              escapeHtml(
                task.person || "Non affecté"
              ) +

            '</div>' +

          '</div>' +


          '<div class="badge ' +
          (
            task.status === "done"
              ? "done"
              : "todo"
          ) +
          '">' +

          (
            task.status === "done"
              ? "Terminé"
              : "À traiter"
          ) +

          '</div>' +

        '</div>' +

      '</div>';
  });


  container.innerHTML =
    html ||
    '<div class="empty">Aucun linge à suivre.</div>';
}


/* ==========================================
   OUVRIR FORMULAIRE
========================================== */

function openModal(selectedDate) {

  document.getElementById("modalTitle")
    .textContent =
    "Nouvelle prestation";


  document.getElementById("editId")
    .value = "";


  document.getElementById("propertyInput")
    .value = "";


  document.getElementById("dateInput")
    .value =
    selectedDate || todayISO();


  document.getElementById("timeInput")
    .value = "10:00";


  document.getElementById("typeInput")
    .value = "cleaning";


  document.getElementById("personInput")
    .value = "";


  document.getElementById("statusInput")
    .value = "todo";


  document.getElementById("notesInput")
    .value = "";


  document.getElementById("deleteButton")
    .classList.add("hidden");


  document.getElementById("modal")
    .classList.remove("hidden");
}


function closeModal() {

  document.getElementById("modal")
    .classList.add("hidden");
}


/* ==========================================
   ENREGISTRER
========================================== */

function saveTask() {

  const property =
    document.getElementById("propertyInput")
      .value
      .trim();


  if (!property) {

    alert("Indique le logement.");

    return;
  }


  const date =
    document.getElementById("dateInput")
      .value;


  if (!date) {

    alert("Indique la date.");

    return;
  }


  const editId =
    Number(
      document.getElementById("editId")
        .value
    );


  const task = {

    id:
      editId ||
      Date.now(),

    property:
      property,

    date:
      date,

    time:
      document.getElementById("timeInput")
        .value || "10:00",

    type:
      document.getElementById("typeInput")
        .value,

    person:
      document.getElementById("personInput")
        .value
        .trim(),

    status:
      document.getElementById("statusInput")
        .value,

    notes:
      document.getElementById("notesInput")
        .value
        .trim()
  };


  if (editId) {

    const index =
      tasks.findIndex(function(item) {
        return item.id === editId;
      });


    if (index >= 0) {
      tasks[index] = task;
    }

  } else {

    tasks.push(task);
  }


  saveLocal();

  closeModal();

  renderAll();
}


/* ==========================================
   MODIFIER
========================================== */

function editTask(id) {

  const task =
    tasks.find(function(item) {
      return item.id === id;
    });


  if (!task) {
    return;
  }


  document.getElementById("modalTitle")
    .textContent =
    "Modifier la prestation";


  document.getElementById("editId")
    .value =
    task.id;


  document.getElementById("propertyInput")
    .value =
    task.property;


  document.getElementById("dateInput")
    .value =
    task.date;


  document.getElementById("timeInput")
    .value =
    task.time;


  document.getElementById("typeInput")
    .value =
    task.type;


  document.getElementById("personInput")
    .value =
    task.person || "";


  document.getElementById("statusInput")
    .value =
    task.status;


  document.getElementById("notesInput")
    .value =
    task.notes || "";


  document.getElementById("deleteButton")
    .classList.remove("hidden");


  document.getElementById("modal")
    .classList.remove("hidden");
}


/* ==========================================
   SUPPRIMER
========================================== */

function deleteTask() {

  const id =
    Number(
      document.getElementById("editId")
        .value
    );


  if (!id) {
    return;
  }


  if (
    confirm(
      "Supprimer cette prestation ?"
    )
  ) {

    tasks =
      tasks.filter(function(task) {
        return task.id !== id;
      });


    saveLocal();

    closeModal();

    renderAll();
  }
}


/* ==========================================
   TERMINER / RÉOUVRIR
========================================== */

function completeTask(id) {

  const task =
    tasks.find(function(item) {
      return item.id === id;
    });


  if (task) {

    task.status = "done";

    saveLocal();

    renderAll();
  }
}


function reopenTask(id) {

  const task =
    tasks.find(function(item) {
      return item.id === id;
    });


  if (task) {

    task.status = "todo";

    saveLocal();

    renderAll();
  }
}


/* ==========================================
   AFFICHAGE GÉNÉRAL
========================================== */

function renderAll() {

  const todayLabel =
    document.getElementById("todayLabel");


  if (todayLabel) {

    todayLabel.textContent =
      new Date().toLocaleDateString(
        "fr-FR",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric"
        }
      );
  }


  const statToday =
    document.getElementById("statToday");


  const statTodo =
    document.getElementById("statTodo");


  const statLinen =
    document.getElementById("statLinen");


  if (statToday) {

    statToday.textContent =
      tasks.filter(function(task) {
        return task.date === todayISO();
      }).length;
  }


  if (statTodo) {

    statTodo.textContent =
      tasks.filter(function(task) {
        return task.status !== "done";
      }).length;
  }


  if (statLinen) {

    statLinen.textContent =
      tasks.filter(function(task) {
        return (
          task.type === "cleaning_linen" &&
          task.status !== "done"
        );
      }).length;
  }


  renderPlanning();

  renderCalendar();

  renderProperties();

  renderTeam();

  renderLinen();
}


/* ==========================================
   FERMER LA FENÊTRE EN CLIQUANT AUTOUR
========================================== */

const modal =
  document.getElementById("modal");


if (modal) {

  modal.addEventListener(
    "click",
    function(event) {

      if (event.target === modal) {
        closeModal();
      }
    }
  );
}


/* ==========================================
   DÉMARRAGE
========================================== */

renderAll();
