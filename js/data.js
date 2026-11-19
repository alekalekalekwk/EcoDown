// Halaman Data & Fakta: membaca data/energi.json lalu menggambar grafik dengan Chart.js.

(function () {
  var DATA_URL = "data/energi.json";
  var container = document.getElementById("charts");
  var charts = [];
  var dataset = null;

  function css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Mendukung **tebal** sederhana di kalimat kesimpulan
  function richText(text) {
    return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }

  function sum(list) {
    return list.reduce(function (a, b) { return a + b; }, 0);
  }

  function formatDate(iso) {
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }

  function renderProps(data) {
    var status = document.getElementById("prop-status");
    var updated = document.getElementById("prop-updated");
    var isSample = data.status === "contoh";

    status.innerHTML = isSample
      ? '<span class="tag tag-yellow">Data contoh</span>'
      : '<span class="tag tag-green">Data hasil olahan</span>';
    updated.textContent = data.diperbarui ? formatDate(data.diperbarui) : "-";

    if (isSample && data.catatan) {
      document.getElementById("data-notice-text").textContent = data.catatan;
      document.getElementById("data-notice").hidden = false;
    }
  }

  function tableHtml(item) {
    var multi = item.dataset.length > 1;
    var head = "<th>" + (multi ? "Hari" : "Jawaban") + "</th>";
    item.dataset.forEach(function (ds) {
      head += '<th class="num">' + escapeHtml(ds.nama) + "</th>";
    });
    if (multi) head += '<th class="num">Total</th>';

    var rows = item.label.map(function (label, i) {
      var cells = item.dataset.map(function (ds) {
        return '<td class="num">' + ds.nilai[i] + "</td>";
      }).join("");
      if (multi) {
        cells += '<td class="num">' + sum(item.dataset.map(function (ds) { return ds.nilai[i]; })) + "</td>";
      }
      return "<tr><td>" + escapeHtml(label) + "</td>" + cells + "</tr>";
    }).join("");

    var foot = "<td>Total</td>" + item.dataset.map(function (ds) {
      return '<td class="num">' + sum(ds.nilai) + "</td>";
    }).join("");
    if (multi) {
      foot += '<td class="num">' + sum(item.dataset.map(function (ds) { return sum(ds.nilai); })) + "</td>";
    }

    return '<div class="table-wrap"><table class="table"><thead><tr>' + head +
      "</tr></thead><tbody>" + rows + "</tbody><tfoot><tr>" + foot + "</tr></tfoot></table></div>";
  }

  function blockHtml(item) {
    return (
      '<section class="chart-block" aria-labelledby="judul-' + item.id + '">' +
        '<h2 id="judul-' + item.id + '">' + escapeHtml(item.judul) + "</h2>" +
        '<p class="chart-meta">' + escapeHtml(item.sumber) + " · " + escapeHtml(item.keteranganSumber) + "</p>" +
        '<div class="chart-frame">' +
          '<canvas id="grafik-' + item.id + '" role="img" aria-label="' +
            escapeHtml(item.judul + ". " + item.kesimpulan.replace(/\*\*/g, "")) + '"></canvas>' +
        "</div>" +
        '<p class="chart-caption">' + richText(item.kesimpulan) + "</p>" +
        '<details class="toggle"><summary>Lihat tabel angka</summary><div class="toggle-body">' +
          tableHtml(item) +
        "</div></details>" +
      "</section>"
    );
  }

  function palette(name) {
    var map = {
      green: "--chart-green",
      yellow: "--chart-yellow",
      blue: "--chart-blue",
      gray: "--chart-gray",
      red: "--chart-red"
    };
    return css(map[name] || "--chart-gray");
  }

  function drawCharts() {
    charts.forEach(function (c) { c.destroy(); });
    charts = [];
    if (!dataset || typeof Chart === "undefined") return;

    var text = css("--text");
    var text2 = css("--text-2");
    var grid = css("--border");
    var bg = css("--bg");
    Chart.defaults.font.family = css("--font");
    Chart.defaults.font.size = 13;
    Chart.defaults.color = text2;

    dataset.grafik.forEach(function (item) {
      var horizontal = item.arah === "horizontal";
      var stacked = !!item.bertumpuk;
      var multi = item.dataset.length > 1;
      var valueAxis = {
        beginAtZero: true,
        stacked: stacked,
        grid: { color: grid, drawTicks: false },
        border: { display: false },
        ticks: { precision: 0, padding: 8 }
      };
      var labelAxis = {
        stacked: stacked,
        grid: { display: false },
        border: { color: grid },
        ticks: { color: text, padding: 6 }
      };

      var chart = new Chart(document.getElementById("grafik-" + item.id), {
        type: "bar",
        data: {
          labels: item.label,
          datasets: item.dataset.map(function (ds) {
            return {
              label: ds.nama,
              data: ds.nilai,
              backgroundColor: palette(ds.warna),
              borderRadius: stacked ? 0 : 3,
              borderSkipped: false,
              maxBarThickness: horizontal ? 26 : 44,
              borderColor: bg,
              borderWidth: stacked ? { top: 1 } : 0
            };
          })
        },
        options: {
          indexAxis: horizontal ? "y" : "x",
          maintainAspectRatio: false,
          animation: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? false : { duration: 400 },
          scales: horizontal ? { x: valueAxis, y: labelAxis } : { x: labelAxis, y: valueAxis },
          plugins: {
            legend: {
              display: multi,
              position: "bottom",
              labels: { boxWidth: 10, boxHeight: 10, padding: 16, color: text2 }
            },
            tooltip: {
              backgroundColor: text,
              titleColor: bg,
              bodyColor: bg,
              padding: 8,
              cornerRadius: 4,
              displayColors: multi,
              callbacks: {
                label: function (ctx) {
                  var v = ctx.parsed[horizontal ? "x" : "y"];
                  return (multi ? ctx.dataset.label + ": " : "") + v + " " + item.satuan;
                }
              }
            }
          }
        }
      });
      charts.push(chart);
    });
  }

  function showError(message) {
    container.innerHTML =
      '<div class="callout callout-red">' +
        '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/><path d="M10 6v5M10 13.8v.1" stroke-linecap="round"/></svg>' +
        "<p>" + message + "</p>" +
      "</div>";
  }

  fetch(DATA_URL)
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      dataset = data;
      renderProps(data);
      container.innerHTML = data.grafik.map(blockHtml).join("");
      if (typeof Chart === "undefined") {
        showError("Library grafik (Chart.js) gagal dimuat. Periksa koneksi internet lalu muat ulang halaman.");
        return;
      }
      drawCharts();
    })
    .catch(function () {
      showError(
        "Data grafik belum bisa dibaca. Jika file ini dibuka langsung dari folder (alamat diawali <code>file://</code>), " +
        "browser memblokir pembacaan file JSON. Buka lewat Live Server di VS Code atau lewat GitHub Pages."
      );
    });

  document.addEventListener("themechange", drawCharts);
})();
