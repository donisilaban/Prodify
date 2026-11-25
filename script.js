const KUNCI = "todo-tasks";

const dataAwal = [
  { id: 1, name: "PT DSD", date: "2026-10-25", done: false },
  { id: 2, name: "PT BaProg", date: "2026-10-30", done: false },
  { id: 3, name: "To do list Exer", date: "2026-10-29", done: true }
];

const bulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const form = document.getElementById("form");
const inputNama = document.getElementById("inputNama");
const inputTanggal = document.getElementById("inputTanggal");
const daftar = document.getElementById("daftar");
const ringkasan = document.getElementById("ringkasan");
const filterBar = document.getElementById("filter");
const tombolHapusSelesai = document.getElementById("tombolHapusSelesai");

let filterAktif = "semua";
let tasks = muat();

function muat(){
  try {
    const tersimpan = localStorage.getItem(KUNCI);
    if (tersimpan !== null) {
      return JSON.parse(tersimpan);
    }
  } catch (error) {
    console.error("Gagal membaca data:", error);
  }
  return dataAwal;
}

function simpan(){
  try {
    localStorage.setItem(KUNCI, JSON.stringify(tasks));
  } catch (error) {
    console.error("Gagal menyimpan data:", error);
  }
}

function formatTanggal(tanggal){
  const bagian = tanggal.split("-");
  return bagian[2] + " " + bulan[Number(bagian[1]) - 1] + " " + bagian[0];
}

function aman(teks){
  return teks.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function hariIni(){
  return new Date().toLocaleDateString("en-CA");
}


function statusTugas(task){
  if (task.done) return "selesai";
  if (task.date < hariIni()) return "overdue";
  return "belum";
}

function cocokFilter(task){
  const status = statusTugas(task);
  if (filterAktif === "semua") return true;
  if (filterAktif === "belum") return status !== "selesai";
  return status === filterAktif;
}

const infoStatus = {
  selesai: { kelas: "badge-selesai", label: "Selesai" },
  overdue: { kelas: "badge-overdue", label: "Overdue" },
  belum:   { kelas: "badge-belum",   label: "Belum selesai" }
};

const pesanKosong = {
  semua:   "Belum ada tugas. Tambahkan satu di atas.",
  belum:   "Tidak ada tugas yang belum selesai.",
  overdue: "Tidak ada tugas yang overdue.",
  selesai: "Belum ada tugas yang selesai."
};


function tampilkan(){
  const terlihat = tasks.filter(cocokFilter);

  if (terlihat.length === 0){
    daftar.innerHTML = `<li class="kosong">${pesanKosong[filterAktif]}</li>`;
  } else {
    daftar.innerHTML = terlihat.map(function (task){
      const info = infoStatus[statusTugas(task)];
      const centang = task.done ? "checked" : "";
      const kelasNama = task.done ? "nama-selesai" : "";

      return `
        <li class="item">
          <label class="flex flex-1 items-center gap-3 cursor-pointer">
            <input type="checkbox" class="cek" data-id="${task.id}" ${centang}>
            <span class="${kelasNama}">${aman(task.name)}</span>
          </label>
          <span class="tanggal">${formatTanggal(task.date)}</span>
          <span class="badge ${info.kelas}">${info.label}</span>
          <button type="button" class="hapus" data-id="${task.id}"
            aria-label="Hapus tugas ${aman(task.name)}">✕</button>
        </li>`;
    }).join("");
  }

  const sisa = tasks.filter(function (t){ return !t.done; }).length;

  if (tasks.length === 0){
    ringkasan.textContent = "";
  } else if (sisa === 0){
    ringkasan.textContent = "Semua tugas sudah selesai.";
  } else {
    ringkasan.textContent = sisa + " tugas belum selesai";
  }

  const adaSelesai = tasks.some(function (t){ return t.done; });
  tombolHapusSelesai.hidden = !adaSelesai;

  filterBar.querySelectorAll(".chip").forEach(function (chip){
    chip.classList.toggle("aktif", chip.dataset.filter === filterAktif);
  });
}

function perbarui(){
  simpan();
  tampilkan();
}


daftar.addEventListener("change", function (event){
  if (event.target.classList.contains("cek")){
    const id = Number(event.target.dataset.id);
    const task = tasks.find(function (t){ return t.id === id; });
    if (task){
      task.done = !task.done;
      perbarui();
    }
  }
});

daftar.addEventListener("click", function (event){
  const tombol = event.target.closest(".hapus");
  if (tombol){
    const id = Number(tombol.dataset.id);
    tasks = tasks.filter(function (t){ return t.id !== id; });
    perbarui();
  }
});

filterBar.addEventListener("click", function (event){
  const chip = event.target.closest(".chip");
  if (chip){
    filterAktif = chip.dataset.filter;
    tampilkan();
  }
});

tombolHapusSelesai.addEventListener("click", function (){
  tasks = tasks.filter(function (t){ return !t.done; });
  perbarui();
});

form.addEventListener("submit", function (event){
  event.preventDefault();

  if (inputNama.value.trim() === "" || inputTanggal.value === ""){
    alert("Isi nama tugas dan tanggalnya dulu ya.");
    return;
  }

  tasks.push({
    id: Date.now(),
    name: inputNama.value.trim(),
    date: inputTanggal.value,
    done: false
  });

  inputNama.value = "";
  inputTanggal.value = "";
  perbarui();
});

tampilkan();
