// Halaman Aksi & Rekomendasi: rekomendasi dari data/aksi.json dan Tantangan 7 Hari.

(function () {
  var listEl = document.getElementById("rekomendasi");
  var challengeEl = document.getElementById("tantangan");

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      if (value === null) return localStorage.removeItem(key);
      localStorage.setItem(key, value);
    } catch (e) {
      return null;
    }
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function richText(text) {
    return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }

  function formatDate(iso) {
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }

  function getJson(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    });
  }

  var chartIcon =
    '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M3 16.5h14M6 14v-4M10 14V5M14 14V8"/></svg>';

  function renderProps(data) {
    var isSample = data.status === "contoh";
    document.getElementById("prop-status").innerHTML = isSample
      ? '<span class="tag tag-yellow">Rekomendasi contoh</span>'
      : '<span class="tag tag-green">Berdasarkan data resmi</span>';
    document.getElementById("prop-updated").textContent = data.diperbarui ? formatDate(data.diperbarui) : "-";
    if (isSample && data.catatan) {
      document.getElementById("data-notice-text").textContent = data.catatan;
      document.getElementById("data-notice").hidden = false;
    }
  }

  function renderRecommendations(items, chartTitles) {
    listEl.innerHTML = items.map(function (rec, i) {
      var chartTitle = chartTitles[rec.grafik] || "Lihat grafik";
      return (
        '<section class="rec" id="rek-' + escapeHtml(rec.id) + '">' +
          '<h2><span class="rec-num">' + (i + 1) + "</span>" + escapeHtml(rec.judul) + "</h2>" +
          '<dl class="props props-compact">' +
            '<div class="prop"><dt>Pelaksana</dt><dd><span class="tag tag-blue">' + escapeHtml(rec.pelaksana) + "</span></dd></div>" +
            '<div class="prop"><dt>Dasar data</dt><dd><a class="prop-link" href="data.html#judul-' +
              encodeURIComponent(rec.grafik) + '">' + escapeHtml(chartTitle) + "</a></dd></div>" +
          "</dl>" +
          '<div class="callout">' + chartIcon + "<p>" + richText(rec.temuan) + "</p></div>" +
          "<ul>" + rec.langkah.map(function (step) { return "<li>" + richText(step) + "</li>"; }).join("") + "</ul>" +
        "</section>"
      );
    }).join("");
  }

  function renderChallenge(ch) {
    var total = ch.hari.length;

    challengeEl.innerHTML =
      '<h2 id="tantangan-judul">' + escapeHtml(ch.judul) + "</h2>" +
      "<p>" + escapeHtml(ch.ajakan) + "</p>" +
      '<div class="progress">' +
        '<div class="progress-track" role="progressbar" aria-labelledby="tantangan-judul" aria-valuemin="0" aria-valuemax="' + total + '">' +
          '<span class="progress-fill"></span>' +
        "</div>" +
        '<span class="progress-text"></span>' +
      "</div>" +
      '<ul class="todo-list">' +
        ch.hari.map(function (text, i) {
          return '<li><label class="todo"><input type="checkbox" data-day="' + i + '"><span><strong>Hari ' +
            (i + 1) + ".</strong> " + escapeHtml(text) + "</span></label></li>";
        }).join("") +
      "</ul>" +
      '<div class="callout callout-green" id="tantangan-selesai" hidden>' +
        '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 10.5l3.5 3.5 7.5-8"/></svg>' +
        "<p><strong>Tujuh hari selesai.</strong> Kebiasaannya sudah terbentuk. Ajak satu teman sekelas untuk memulai tantangan yang sama.</p>" +
      "</div>" +
      '<p><button class="btn btn-quiet" id="tantangan-reset" type="button">Ulangi dari awal</button></p>';

    var boxes = challengeEl.querySelectorAll("[data-day]");
    var track = challengeEl.querySelector(".progress-track");
    var fill = challengeEl.querySelector(".progress-fill");
    var label = challengeEl.querySelector(".progress-text");
    var done = document.getElementById("tantangan-selesai");

    function update() {
      var count = 0;
      boxes.forEach(function (b) { if (b.checked) count++; });
      fill.style.width = (count / total) * 100 + "%";
      track.setAttribute("aria-valuenow", count);
      label.textContent = count + " dari " + total + " hari";
      done.hidden = count < total;
    }

    boxes.forEach(function (box) {
      var key = "tantangan:" + box.dataset.day;
      box.checked = store(key) === "1";
      box.addEventListener("change", function () {
        store(key, box.checked ? "1" : null);
        update();
      });
    });

    document.getElementById("tantangan-reset").addEventListener("click", function () {
      boxes.forEach(function (box) {
        box.checked = false;
        store("tantangan:" + box.dataset.day, null);
      });
      update();
    });

    update();
  }

  function showError() {
    listEl.innerHTML =
      '<div class="callout callout-red">' +
        '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/><path d="M10 6v5M10 13.8v.1" stroke-linecap="round"/></svg>' +
        "<p>Rekomendasi belum bisa dibaca. Jika file ini dibuka langsung dari folder (alamat diawali <code>file://</code>), " +
        "browser memblokir pembacaan file JSON. Buka lewat Live Server di VS Code atau lewat GitHub Pages.</p>" +
      "</div>";
  }

  // Judul grafik diambil dari data Fase 2 supaya tautan "Dasar data" selalu sesuai
  var chartTitlesPromise = getJson("data/energi.json")
    .then(function (data) {
      var map = {};
      data.grafik.forEach(function (g) { map[g.id] = g.judul; });
      return map;
    })
    .catch(function () { return {}; });

  Promise.all([getJson("data/aksi.json"), chartTitlesPromise])
    .then(function (results) {
      var data = results[0];
      renderProps(data);
      renderRecommendations(data.rekomendasi, results[1]);
      renderChallenge(data.tantangan);
    })
    .catch(showError);

  // Salin tautan halaman
  var shareBtn = document.getElementById("share-btn");
  var shareStatus = document.getElementById("share-status");
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var url = location.href.split("#")[0];
      var ok = function () { shareStatus.textContent = "Tautan tersalin."; };
      var fail = function () { shareStatus.textContent = url; };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(ok, fail);
      } else {
        fail();
      }
    });
  }
})();
