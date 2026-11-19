// Fungsi bersama semua halaman: mode gelap, navigasi HP, dan daftar aksi.

(function () {
  var root = document.documentElement;

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) {
      return null;
    }
  }

  // Mode terang / gelap
  var themeBtn = document.getElementById("theme-btn");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeBtn) {
      var label = theme === "dark" ? "Beralih ke mode terang" : "Beralih ke mode gelap";
      themeBtn.setAttribute("aria-label", label);
      themeBtn.setAttribute("title", label);
    }
    document.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
  }

  applyTheme(root.getAttribute("data-theme") || "light");

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      store("theme", next);
      applyTheme(next);
    });
  }

  if (window.matchMedia) {
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
      if (!store("theme")) applyTheme(e.matches ? "dark" : "light");
    });
  }

  // Sidebar di layar kecil
  var sidebar = document.getElementById("sidebar");
  var scrim = document.getElementById("scrim");
  var menuBtn = document.getElementById("menu-btn");

  function setMenu(open) {
    if (!sidebar) return;
    sidebar.classList.toggle("is-open", open);
    scrim.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      setMenu(!sidebar.classList.contains("is-open"));
    });
    scrim.addEventListener("click", function () {
      setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  // Daftar aksi: centang disimpan per hari di perangkat ini
  var today = new Date().toISOString().slice(0, 10);
  document.querySelectorAll("[data-todo]").forEach(function (box) {
    var key = "todo:" + today + ":" + box.dataset.todo;
    box.checked = store(key) === "1";
    box.addEventListener("change", function () {
      store(key, box.checked ? "1" : "0");
    });
  });
})();
