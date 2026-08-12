let currentFilter = "all";

let calendarDate = new Date();
calendarDate.setDate(1);


/* DATES */

function isoDate(date) {

  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
}


function todayISO() {

  return isoDate(new Date());
}


function addDays(number) {

  const date = new Date();

  date.setDate(
    date.getDate() + number
  );

  return isoDate(date);
}


function formatDate(value) {

  if (value === todayISO()) {
    return "Aujourd'hui";
  }

  if (value === addDays(1)) {
    return "Demain";
  }

  const date =
    new Date(value + "T12:00:00");

  return date.toLocaleDateString(
    "fr-FR",
    {
      weekday: "short",
      day: "numeric",
      month: "short"
    }
  );
}


/* DONNÉES */

const demoTasks = [

  {
    id: 1,
    property: "Studio Bouches du Loup",
    address: "Villeneuve-Loubet",
    date: todayISO(),
    time: "10:00",
    type: "cleaning_linen",
    person: "Sophie",
    status: "todo",
    notes: "Vérifier le réfrigérateur."
  },

  {
    id: 2,
    property: "Appartement Marina",
    address: "Marina Baie des Anges",
    date: todayISO(),
    time: "14:00",
    type: "cleaning",
    person: "Cécile",
    status: "progress",
    notes: "Arrivée prévue à 17h."
  },

  {
    id: 3,
    property: "Villa Azur",
    address: "Villeneuve-Loubet",
    date: addDays(1),
    time: "11:00",
    type: "maintenance",
    person: "Marc",
    status: "todo",
    notes: "Vérifier la baie vitrée."
  }

];


let tasks;

try {

  tasks =
    JSON.parse(
      localStorage.getItem(
        "harmony_services_v4"
      )
    ) || demoTasks;

} catch (error) {

  tasks =
    JSON.parse(
      JSON.stringify(demoTasks)
    );
}


function saveLocal() {

  localStorage.setItem(
    "harmony_services_v4",
    JSON.stringify(tasks)
  );
}


/* HELPERS */

function escapeHtml(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function serviceInfo(type) {

  if (type === "cleaning_linen") {

    return {
      icon: "🧹🧺",
      name: "Ménage + linge",
      css: "cleaning_linen"
    };
  }


  if (type === "maintenance") {

    return {
      icon: "🔧",
      name: "Maintenance",
      css: "maintenance"
    };
  }


  return {
    icon: "🧹",
    name: "Ménage",
    css: "cleaning"
  };
}


function statusName(status) {

  if (status === "done") {
    return "Terminé";
  }

  if (status === "progress") {
    return "En cours";
  }

  return "À faire";
}


/* NAVIGATION */

function showPage(page, button) {

  const pages = [
    "planning",
    "calendar",
    "properties",
    "team",
    "linen"
  ];


  pages.forEach(function(name) {

    const section =
      document.getElementById(
        name + "Page"
      );


    if (section) {

      section.classList.toggle(
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


  document
    .getElementById("fab")
    .classList.toggle(
      "hidden",
      page !== "planning" &&
      page !== "calendar"
    );


  if (page === "calendar") {
    renderCalendar();
  }


  if (page === "properties") {
    renderProperties();
  }


  if (page === "team") {
    renderTeam();
  }


  if (page === "linen") {
    renderLinen();
  }
}


/* FILTRES */

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


/* PLANNING */

function renderPlanning() {

  let list =
    tasks.slice();


  list.sort(function(a, b) {

    return (
      a.date + a.time
    ).localeCompare(
      b.date + b.time
    );
  });


  if (currentFilter === "today") {

    list =
      list.filter(function(task) {

        return (
          task.date === todayISO()
        );
      });
  }


  if (currentFilter === "todo") {

    list =
      list.filter(function(task) {

        return (
          task.status !== "done"
        );
      });
  }


  if (currentFilter === "done") {

    list =
      list.filter(function(task) {

        return (
          task.status === "done"
        );
      });
  }


  const container =
    document.getElementById(
      "planning"
    );


  if (!list.length) {

    container.innerHTML =
      '<div class="empty">' +
      'Aucune prestation.' +
      '</div>';

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

              escapeHtml(
                formatDate(task.date)
              ) +

              " · " +

              escapeHtml(task.time) +

            '</div>' +


            '<div class="property">' +

              escapeHtml(
                task.property
              ) +

            '</div>' +


            '<div class="type">' +

              service.icon +
              " " +
              escapeHtml(
                service.name
              ) +

            '</div>' +


            (
              task.address
              ?
              '<div class="address">' +
              "📍 " +
              escapeHtml(task.address) +
              '</div>'
              :
              ""
            ) +

          '</div>' +


          '<div class="badge ' +
          escapeHtml(task.status) +
          '">' +

            escapeHtml(
              statusName(task.status)
            ) +

          '</div>' +

        '</div>' +


        '<div class="infoGrid">' +

          '<div class="info">' +

            '<span class="label">' +
            'Intervenant' +
            '</span>' +

            escapeHtml(
              task.person ||
              "Non affecté"
            ) +

          '</div>' +


          '<div class="info">' +

            '<span class="label">' +
            'Type' +
            '</span>' +

            service.icon +
            " " +
            escapeHtml(service.name) +

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
          'Modifier' +
          '</button>' +


          (
            task.status !== "done"
            ?
            '<button class="action primary" ' +
            'onclick="completeTask(' +
            task.id +
            ')">' +
            '✓ Terminer' +
            '</button>'
            :
            '<button class="action" ' +
            'onclick="reopenTask(' +
            task.id +
            ')">' +
            'Réouvrir' +
            '</button>'
          ) +

        '</div>' +

      '</div>';
  });


  container.innerHTML = html;
}


/* CALENDRIER */

function renderCalendar() {

  const year =
    calendarDate.getFullYear();

  const month =
    calendarDate.getMonth();


  document
    .getElementById(
      "calendarMonth"
    )
    .textContent =
      calendarDate
      .toLocaleDateString(
        "fr-FR",
        {
          month: "long",
          year: "numeric"
        }
      );


  const firstDay =
    new Date(
      year,
      month,
      1
    );


  const offset =
    (
      firstDay.getDay() + 6
    ) % 7;


  const maxDays =
    new Date(
      year,
      month + 1,
      0
    )
    .getDate();


  let html = "";


  for (
    let i = 0;
    i < offset;
    i++
  ) {

    html +=
      '<div class="calendarDay emptyDay"></div>';
  }


  for (
    let day = 1;
    day <= maxDays;
    day++
  ) {

    const date =
      year +
      "-" +
      String(
        month + 1
      ).padStart(2, "0") +
      "-" +
      String(day)
      .padStart(2, "0");


    const dayTasks =
      tasks.filter(
        function(task) {

          return (
            task.date === date
          );
        }
      );


    html +=
      '<div class="calendarDay ' +

      (
        date === todayISO()
        ?
        "today"
        :
        ""
      ) +

      '" onclick="openModal(\\'' +
      date +
      '\\')">' +


      '<div class="dayNumber">' +
      day +
      '</div>';


    dayTasks.forEach(
      function(task) {

        const service =
          serviceInfo(task.type);


        html +=
          '<div class="calendarEvent ' +
          service.css +
          '" ' +

          'onclick="event.stopPropagation();editTask(' +
          task.id +
          ')">' +

          service.icon +
          " " +
          escapeHtml(task.time) +

          '<br>' +

          escapeHtml(
            task.property
          ) +

          '</div>';
      }
    );


    html += '</div>';
  }


  document
    .getElementById(
      "calendarGrid"
    )
    .innerHTML =
      html;
}


function changeMonth(number) {

  calendarDate.setMonth(
    calendarDate.getMonth() +
    number
  );

  renderCalendar();
}


/* LOGEMENTS */

function renderProperties() {

  const properties = {};


  tasks.forEach(function(task) {

    if (!properties[task.property]) {

      properties[task.property] = {
        address:
          task.address || "",
        total: 0,
        pending: 0
      };
    }


    properties[task.property]
      .total++;


    if (task.status !== "done") {

      properties[task.property]
        .pending++;
    }
  });


  let html = "";


  Object.keys(properties)
    .sort()
    .forEach(function(name) {

      const property =
        properties[name];


      html +=
        '<div class="card propertyCard">' +

          '<div class="houseIcon">' +
          '⌂' +
          '</div>' +

          '<div>' +

            '<div class="property">' +
            escapeHtml(name) +
            '</div>' +

            '<div class="address">' +
            escapeHtml(
              property.address
            ) +
            '</div>' +

            '<div class="type">' +

            property.pending +
            ' à faire · ' +
            property.total +
            ' prestation(s)' +

            '</div>' +

          '</div>' +

        '</div>';
    });


  document
    .getElementById(
      "propertyList"
    )
    .innerHTML =
      html ||
      '<div class="empty">' +
      'Aucun logement.' +
      '</div>';
}


/* EQUIPE */

function renderTeam() {

  const people = {};


  tasks.forEach(function(task) {

    const person =
      task.person ||
      "Non affecté";


    if (!people[person]) {

      people[person] = {
        total: 0,
        pending: 0
      };
    }


    people[person].total++;


    if (task.status !== "done") {

      people[person]
        .pending++;
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

          return (
            word.charAt(0)
          );
        })
        .join("")
        .substring(0,2)
        .toUpperCase();


      html +=
        '<div class="card teamRow">' +

          '<div class="teamAvatar">' +
          escapeHtml(initials) +
          '</div>' +

          '<div style="flex:1">' +

            '<div class="property">' +
            escapeHtml(person) +
            '</div>' +

            '<div class="type">' +

            people[person].pending +
            ' intervention(s) à faire' +

            '</div>' +

          '</div>' +

          '<div class="badge done">' +
          people[person].total +
          '</div>' +

        '</div>';
    });


  document
    .getElementById(
      "teamList"
    )
    .innerHTML =
      html ||
      '<div class="empty">' +
      'Aucun intervenant.' +
      '</div>';
}


/* LINGE */

function renderLinen() {

  const linenTasks =
    tasks.filter(
      function(task) {

        return (
          task.type ===
          "cleaning_linen"
        );
      }
    );


  const pending =
    linenTasks.filter(
      function(task) {

        return (
          task.status !== "done"
        );
      }
    );


  const done =
    linenTasks.filter(
      function(task) {

        return (
          task.status === "done"
        );
      }
    );


  document
    .getElementById(
      "linenTodo"
    )
    .textContent =
      pending.length;


  document
    .getElementById(
      "linenDone"
    )
    .textContent =
      done.length;


  let html = "";


  linenTasks.forEach(
    function(task) {

      html +=
        '<div class="card">' +

          '<div class="row">' +

            '<div>' +

              '<div class="property">' +

              '🧹 🧺 ' +
              escapeHtml(
                task.property
              ) +

              '</div>' +

              '<div class="type">' +

              escapeHtml(
                formatDate(
                  task.date
                )
              ) +

              ' · ' +

              escapeHtml(
                task.person ||
                "Non affecté"
              ) +

              '</div>' +

            '</div>' +


            '<div class="badge ' +

            (
              task.status ===
              "done"
              ?
              "done"
              :
              "todo"
            ) +

            '">' +

            (
              task.status ===
              "done"
              ?
              "Terminé"
              :
              "À traiter"
            ) +

            '</div>' +

          '</div>' +

        '</div>';
    }
  );


  document
    .getElementById(
      "linenList"
    )
    .innerHTML =
      html ||
      '<div class="empty">' +
      'Aucun ménage avec linge.' +
      '</div>';
}


/* FORMULAIRE */

function openModal(selectedDate) {

  document
    .getElementById(
      "modalTitle"
    )
    .textContent =
      "Nouvelle prestation";


  document
    .getElementById(
      "editId"
    )
    .value = "";


  document
    .getElementById(
      "typeInput"
    )
    .value =
      "cleaning";


  document
    .getElementById(
      "propertyInput"
    )
    .value = "";


  document
    .getElementById(
      "addressInput"
    )
    .value = "";


  document
    .getElementById(
      "dateInput"
    )
    .value =
      selectedDate ||
      todayISO();


  document
    .getElementById(
      "timeInput"
    )
    .value =
      "10:00";


  document
    .getElementById(
      "personInput"
    )
    .value = "";


  document
    .getElementById(
      "statusInput"
    )
    .value =
      "todo";


  document
    .getElementById(
      "notesInput"
    )
    .value = "";


  document
    .getElementById(
      "deleteButton"
    )
    .classList.add(
      "hidden"
    );


  document
    .getElementById(
      "modal"
    )
    .classList.remove(
      "hidden"
    );
}


function closeModal() {

  document
    .getElementById(
      "modal"
    )
    .classList.add(
      "hidden"
    );
}


function saveTask() {

  const property =
    document
    .getElementById(
      "propertyInput"
    )
    .value
    .trim();


  if (!property) {

    alert(
      "Indique le logement."
    );

    return;
  }


  const date =
    document
    .getElementById(
      "dateInput"
    )
    .value;


  if (!date) {

    alert(
      "Indique la date."
    );

    return;
  }


  const editId =
    Number(
      document
      .getElementById(
        "editId"
      )
      .value
    );


  const item = {

    id:
      editId ||
      Date.now(),

    type:
      document
      .getElementById(
        "typeInput"
      )
      .value,

    property:
      property,

    address:
      document
      .getElementById(
        "addressInput"
      )
      .value
      .trim(),

    date:
      date,

    time:
      document
      .getElementById(
        "timeInput"
      )
      .value ||
      "10:00",

    person:
      document
      .getElementById(
        "personInput"
      )
      .value
      .trim(),

    status:
      document
      .getElementById(
        "statusInput"
      )
      .value,

    notes:
      document
      .getElementById(
        "notesInput"
      )
      .value
      .trim()
  };


  if (editId) {

    const index =
      tasks.findIndex(
        function(task) {

          return (
            task.id === editId
          );
        }
      );


    if (index >= 0) {

      tasks[index] = item;
    }

  } else {

    tasks.push(item);
  }


  saveLocal();

  closeModal();

  renderAll();
}


function editTask(id) {

  const task =
    tasks.find(
      function(item) {

        return (
          item.id === id
        );
      }
    );


  if (!task) {
    return;
  }


  document
    .getElementById(
      "modalTitle"
    )
    .textContent =
      "Modifier la prestation";


  document
    .getElementById(
      "editId"
    )
    .value =
      task.id;


  document
    .getElementById(
      "typeInput"
    )
    .value =
      task.type;


  document
    .getElementById(
      "propertyInput"
    )
    .value =
      task.property;


  document
    .getElementById(
      "addressInput"
    )
    .value =
      task.address || "";


  document
    .getElementById(
      "dateInput"
    )
    .value =
      task.date;


  document
    .getElementById(
      "timeInput"
    )
    .value =
      task.time;


  document
    .getElementById(
      "personInput"
    )
    .value =
      task.person || "";


  document
    .getElementById(
      "statusInput"
    )
    .value =
      task.status;


  document
    .getElementById(
      "notesInput"
    )
    .value =
      task.notes || "";


  document
    .getElementById(
      "deleteButton"
    )
    .classList.remove(
      "hidden"
    );


  document
    .getElementById(
      "modal"
    )
    .classList.remove(
      "hidden"
    );
}


function deleteTask() {

  const id =
    Number(
      document
      .getElementById(
        "editId"
      )
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
      tasks.filter(
        function(task) {

          return (
            task.id !== id
          );
        }
      );


    saveLocal();

    closeModal();

    renderAll();
  }
}


/* STATUTS */

function completeTask(id) {

  const task =
    tasks.find(
      function(item) {

        return (
          item.id === id
        );
      }
    );


  if (task) {

    task.status =
      "done";

    saveLocal();

    renderAll();
  }
}


function reopenTask(id) {

  const task =
    tasks.find(
      function(item) {

        return (
          item.id === id
        );
      }
    );


  if (task) {

    task.status =
      "todo";

    saveLocal();

    renderAll();
  }
}


/* RENDER GLOBAL */

function renderAll() {

  document
    .getElementById(
      "todayLabel"
    )
    .textContent =
      new Date()
      .toLocaleDateString(
        "fr-FR",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric"
        }
      );


  document
    .getElementById(
      "statToday"
    )
    .textContent =
      tasks.filter(
        function(task) {

          return (
            task.date ===
            todayISO()
          );
        }
      ).length;


  document
    .getElementById(
      "statTodo"
    )
    .textContent =
      tasks.filter(
        function(task) {

          return (
            task.status !==
            "done"
          );
        }
      ).length;


  document
    .getElementById(
      "statLinen"
    )
    .textContent =
      tasks.filter(
        function(task) {

          return (
            task.type ===
            "cleaning_linen"
          );
        }
      ).length;


  document
    .getElementById(
      "statProperties"
    )
    .textContent =
      new Set(
        tasks.map(
          function(task) {

            return (
              task.property
            );
          }
        )
      ).size;


  renderPlanning();

  renderCalendar();

  renderProperties();

  renderTeam();

  renderLinen();
}


/* FERMETURE MODALE */

document
  .getElementById(
    "modal"
  )
  .addEventListener(
    "click",
    function(event) {

      if (
        event.target === this
      ) {

        closeModal();
      }
    }
  );


/* DÉMARRAGE */

renderAll();
