var currentFilter = "all";
var calendarDate = new Date();
calendarDate.setDate(1);

function isoDate(d) {
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

function todayISO() {
  return isoDate(new Date());
}

function addDays(n) {
  var d = new Date();
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

function formatDate(value) {
  if (value === todayISO()) return "Aujourd'hui";
  if (value === addDays(1)) return "Demain";

  return new Date(value + "T12:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short"
  });
}

var demoTasks = [
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

var tasks = [];

try {
  tasks = JSON.parse(localStorage.getItem("harmony_simple")) || demoTasks;
} catch (e) {
  tasks = demoTasks;
}

function saveLocal() {
  localStorage.setItem("harmony_simple", JSON.stringify(tasks));
}

function service(type) {
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
  if (status === "done") return "Terminé";
  if (status === "progress") return "En cours";
  return "À faire";
}

/* NAVIGATION */

function showPage(page, button) {
  var pages = ["planning", "calendar", "properties", "team", "linen"];

  pages.forEach(function(name) {
    var el = document.getElementById(name + "Page");
    if (el) {
      el.classList.toggle("hidden", name !== page);
    }
  });

  document.querySelectorAll(".nav").forEach(function(nav) {
    nav.classList.remove("active");
  });

  if (button) button.classList.add("active");

  var fab = document.getElementById("fab");

  if (fab) {
    fab.classList.toggle(
      "hidden",
      page !== "planning" && page !== "calendar"
    );
  }

  if (page === "calendar") renderCalendar();
  if (page === "properties") renderProperties();
  if (page === "team") renderTeam();
  if (page === "linen") renderLinen();
}

/* PLANNING */

function setFilter(filter) {
  currentFilter = filter;

  document.querySelectorAll(".filter").forEach(function(btn) {
    btn.classList.toggle(
      "active",
      btn.getAttribute("data-filter") === filter
    );
  });

  renderPlanning();
}

function renderPlanning() {
  var list = tasks.slice();

  list.sort(function(a, b) {
    return (a.date + a.time).localeCompare(b.date + b.time);
  });

  if (currentFilter === "today") {
    list = list.filter(function(t) {
      return t.date === todayISO();
    });
  }

  if (currentFilter === "todo") {
    list = list.filter(function(t) {
      return t.status !== "done";
    });
  }

  if (currentFilter === "done") {
    list = list.filter(function(t) {
      return t.status === "done";
    });
  }

  var html = "";

  list.forEach(function(t) {
    var s = service(t.type);

    html +=
      '<div class="card">' +
        '<div class="cardTop">' +
          '<div>' +
            '<div class="time">' +
              formatDate(t.date) + " · " + t.time +
            '</div>' +

            '<div class="property">' +
              t.property +
            '</div>' +

            '<div class="type">' +
              s.icon + " " + s.name +
            '</div>' +

            '<div class="address">📍 ' +
              (t.address || "") +
            '</div>' +
          '</div>' +

          '<div class="badge ' + t.status + '">' +
            statusName(t.status) +
          '</div>' +
        '</div>' +

        '<div class="infoGrid">' +
          '<div class="info">' +
            '<span class="label">Intervenant</span>' +
            (t.person || "Non affecté") +
          '</div>' +

          '<div class="info">' +
            '<span class="label">Type</span>' +
            s.icon + " " + s.name +
          '</div>' +
        '</div>' +

        (t.notes
          ? '<div class="note">' + t.notes + '</div>'
          : "") +

        '<div class="cardActions">' +
          '<button class="action" onclick="editTask(' + t.id + ')">Modifier</button>' +

          (t.status !== "done"
            ? '<button class="action primary" onclick="completeTask(' + t.id + ')">Terminer</button>'
            : '<button class="action" onclick="reopenTask(' + t.id + ')">Réouvrir</button>') +
        '</div>' +
      '</div>';
  });

  document.getElementById("planning").innerHTML =
    html || '<div class="empty">Aucune prestation.</div>';
}

/* CALENDRIER */

function renderCalendar() {
  var year = calendarDate.getFullYear();
  var month = calendarDate.getMonth();

  document.getElementById("calendarMonth").textContent =
    calendarDate.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric"
    });

  var first = new Date(year, month, 1);
  var offset = (first.getDay() + 6) % 7;
  var days = new Date(year, month + 1, 0).getDate();

  var html = "";

  for (var i = 0; i < offset; i++) {
    html += '<div class="calendarDay emptyDay"></div>';
  }

  for (var day = 1; day <= days; day++) {
    var date =
      year + "-" +
      String(month + 1).padStart(2, "0") + "-" +
      String(day).padStart(2, "0");

    var dayTasks = tasks.filter(function(t) {
      return t.date === date;
    });

    html +=
      '<div class="calendarDay ' +
      (date === todayISO() ? "today" : "") +
      '" onclick="openModal(\'' + date + '\')">' +

      '<div class="dayNumber">' + day + '</div>';

    dayTasks.forEach(function(t) {
      var s = service(t.type);

      html +=
        '<div class="calendarEvent ' + s.css +
        '" onclick="event.stopPropagation();editTask(' + t.id + ')">' +
        s.icon + " " + t.time +
        "<br>" +
        t.property +
        "</div>";
    });

    html += "</div>";
  }

  document.getElementById("calendarGrid").innerHTML = html;
}

function changeMonth(n) {
  calendarDate.setMonth(calendarDate.getMonth() + n);
  renderCalendar();
}

/* LOGEMENTS */

function renderProperties() {
  var data = {};

  tasks.forEach(function(t) {
    if (!data[t.property]) {
      data[t.property] = {
        address: t.address || "",
        total: 0
      };
    }

    data[t.property].total++;
  });

  var html = "";

  Object.keys(data).forEach(function(name) {
    html +=
      '<div class="card propertyCard">' +
        '<div class="houseIcon">⌂</div>' +
        '<div>' +
          '<div class="property">' + name + '</div>' +
          '<div class="address">' + data[name].address + '</div>' +
          '<div class="type">' + data[name].total + ' prestation(s)</div>' +
        '</div>' +
      '</div>';
  });

  document.getElementById("propertyList").innerHTML =
    html || '<div class="empty">Aucun logement.</div>';
}

/* EQUIPE */

function renderTeam() {
  var people = {};

  tasks.forEach(function(t) {
    var person = t.person || "Non affecté";

    if (!people[person]) {
      people[person] = 0;
    }

    people[person]++;
  });

  var html = "";

  Object.keys(people).forEach(function(person) {
    var initials = person.substring(0, 2).toUpperCase();

    html +=
      '<div class="card teamRow">' +
        '<div class="teamAvatar">' + initials + '</div>' +
        '<div style="flex:1">' +
          '<div class="property">' + person + '</div>' +
          '<div class="type">' + people[person] + ' prestation(s)</div>' +
        '</div>' +
      '</div>';
  });

  document.getElementById("teamList").innerHTML =
    html || '<div class="empty">Aucun intervenant.</div>';
}

/* LINGE */

function renderLinen() {
  var list = tasks.filter(function(t) {
    return t.type === "cleaning_linen";
  });

  var todo = list.filter(function(t) {
    return t.status !== "done";
  }).length;

  var done = list.filter(function(t) {
    return t.status === "done";
  }).length;

  document.getElementById("linenTodo").textContent = todo;
  document.getElementById("linenDone").textContent = done;

  var html = "";

  list.forEach(function(t) {
    html +=
      '<div class="card">' +
        '<div class="property">🧹 🧺 ' + t.property + '</div>' +
        '<div class="type">' +
          formatDate(t.date) + " · " +
          (t.person || "Non affecté") +
        '</div>' +
      '</div>';
  });

  document.getElementById("linenList").innerHTML =
    html || '<div class="empty">Aucun linge à traiter.</div>';
}

/* FORMULAIRE */

function openModal(date) {
  document.getElementById("modalTitle").textContent =
    "Nouvelle prestation";

  document.getElementById("editId").value = "";
  document.getElementById("typeInput").value = "cleaning";
  document.getElementById("propertyInput").value = "";
  document.getElementById("addressInput").value = "";
  document.getElementById("dateInput").value = date || todayISO();
  document.getElementById("timeInput").value = "10:00";
  document.getElementById("personInput").value = "";
  document.getElementById("statusInput").value = "todo";
  document.getElementById("notesInput").value = "";

  document.getElementById("deleteButton").classList.add("hidden");
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

function saveTask() {
  var property =
    document.getElementById("propertyInput").value.trim();

  if (!property) {
    alert("Indique le logement.");
    return;
  }

  var editId =
    Number(document.getElementById("editId").value);

  var item = {
    id: editId || Date.now(),
    type: document.getElementById("typeInput").value,
    property: property,
    address: document.getElementById("addressInput").value.trim(),
    date: document.getElementById("dateInput").value,
    time: document.getElementById("timeInput").value || "10:00",
    person: document.getElementById("personInput").value.trim(),
    status: document.getElementById("statusInput").value,
    notes: document.getElementById("notesInput").value.trim()
  };

  if (editId) {
    var index = tasks.findIndex(function(t) {
      return t.id === editId;
    });

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
  var t = tasks.find(function(item) {
    return item.id === id;
  });

  if (!t) return;

  document.getElementById("modalTitle").textContent =
    "Modifier la prestation";

  document.getElementById("editId").value = t.id;
  document.getElementById("typeInput").value = t.type;
  document.getElementById("propertyInput").value = t.property;
  document.getElementById("addressInput").value = t.address || "";
  document.getElementById("dateInput").value = t.date;
  document.getElementById("timeInput").value = t.time;
  document.getElementById("personInput").value = t.person || "";
  document.getElementById("statusInput").value = t.status;
  document.getElementById("notesInput").value = t.notes || "";

  document.getElementById("deleteButton").classList.remove("hidden");
  document.getElementById("modal").classList.remove("hidden");
}

function deleteTask() {
  var id =
    Number(document.getElementById("editId").value);

  if (confirm("Supprimer cette prestation ?")) {
    tasks = tasks.filter(function(t) {
      return t.id !== id;
    });

    saveLocal();
    closeModal();
    renderAll();
  }
}

function completeTask(id) {
  var t = tasks.find(function(item) {
    return item.id === id;
  });

  if (t) {
    t.status = "done";
    saveLocal();
    renderAll();
  }
}

function reopenTask(id) {
  var t = tasks.find(function(item) {
    return item.id === id;
  });

  if (t) {
    t.status = "todo";
    saveLocal();
    renderAll();
  }
}

/* TOUT RAFRAÎCHIR */

function renderAll() {
  document.getElementById("todayLabel").textContent =
    new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });

  document.getElementById("statToday").textContent =
    tasks.filter(function(t) {
      return t.date === todayISO();
    }).length;

  document.getElementById("statTodo").textContent =
    tasks.filter(function(t) {
      return t.status !== "done";
    }).length;

  document.getElementById("statLinen").textContent =
    tasks.filter(function(t) {
      return t.type === "cleaning_linen";
    }).length;

  document.getElementById("statProperties").textContent =
    new Set(tasks.map(function(t) {
      return t.property;
    })).size;

  renderPlanning();
  renderCalendar();
  renderProperties();
  renderTeam();
  renderLinen();
}

renderAll();
