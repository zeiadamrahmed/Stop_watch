var ms = 0;
var s = 0;
var m = 0;
var h = 0;
var time = null;
var paused = false;

var timeDisplay = document.getElementById("time");

function update() {
  var hh = String(h).padStart(2, "0");
  var mm = String(m).padStart(2, "0");
  var ss = String(s).padStart(2, "0");
  var mss = String(ms).padStart(2, "0");
  timeDisplay.innerText = `${hh}:${mm}:${ss}:${mss}`;
}

function start() {
  if (time) return;

  paused = false;
  time = setInterval(() => {
    ms++;
    if (ms == 100) {
      ms = 0;
      s++;
    }
    if (s == 60) {
      s = 0;
      m++;
    }
    if (m == 60) {
      m = 0;
      h++;
    }
    update();
  }, 10);

  stopBtn.disabled = false;
  stopBtn.innerText = "Stop";
  stopBtn.classList.remove("btn-success");
  stopBtn.classList.add("btn-danger");
}

function startWithSound() {
  if (time) return;

  const rec = reciters[reciterSelect.value];
  if (!rec) return;

  const num = String(surahSelect.value).padStart(3, "0");
  startSound.src = `${rec.server}${num}.mp3`;
  startSound.currentTime = 0;
  startSound.play();
  start();
}

var startSound = new Audio();
var reciterSelect = document.getElementById("reciter");
var surahSelect = document.getElementById("surah");

let reciters = []; // كل القرّاء
let surahNames = []; // أسماء السور

async function loadData() {
  try {
    const [r, s] = await Promise.all([
      fetch("https://mp3quran.net/api/v3/reciters?language=ar").then((x) =>
        x.json(),
      ),
      fetch("https://mp3quran.net/api/v3/suwar?language=ar").then((x) =>
        x.json(),
      ),
    ]);

    surahNames = s.suwar;

    // نعمل عنصر لكل (قارئ + رواية)
    reciters = [];
    r.reciters.forEach((rec) => {
      rec.moshaf.forEach((m) => {
        reciters.push({
          label: `${rec.name} - ${m.name}`,
          server: m.server,
          surahList: m.surah_list.split(",").map(Number),
        });
      });
    });

    fillReciters();
  } catch (e) {
    console.error("فشل تحميل البيانات", e);
  }
}

function fillReciters() {
  reciterSelect.innerHTML = "";
  reciters.forEach((r, i) => reciterSelect.add(new Option(r.label, i)));

  const savedReciter = localStorage.getItem("reciter");
  if (savedReciter && reciters[savedReciter])
    reciterSelect.value = savedReciter;

  fillSurahs();
}

// السور المتاحة للقارئ المختار بس
function fillSurahs() {
  const rec = reciters[reciterSelect.value];
  surahSelect.innerHTML = "";

  rec.surahList.forEach((num) => {
    const name = surahNames.find((x) => x.id === num)?.name || "";
    surahSelect.add(new Option(`${num}. ${name}`, num));
  });

  const savedSurah = localStorage.getItem("surah");
  if (savedSurah && rec.surahList.includes(Number(savedSurah))) {
    surahSelect.value = savedSurah;
  }
}

reciterSelect.onchange = () => {
  localStorage.setItem("reciter", reciterSelect.value);
  fillSurahs();
};
surahSelect.onchange = () => localStorage.setItem("surah", surahSelect.value);

loadData();

function pause() {
  clearInterval(time);
  time = null;
  paused = true;

  stopBtn.innerText = "Continue";
  stopBtn.classList.remove("btn-danger");
  stopBtn.classList.add("btn-success");
}

function toggleStop() {
  if (time) {
    pause();
  } else if (paused) {
    start();
  }
}

function reset() {
  clearInterval(time);
  time = null;
  paused = false;
  ms = s = m = h = 0;
  update();
}

var savedTimes = document.getElementById("savedTimes");
// بنشا مصفوفه ل الاوقات المحفوظه
var saved = JSON.parse(localStorage.getItem("savedTimes")) || [];
// بتحفظ الوقت في قائمة المتصفح
function persist() {
  localStorage.setItem("savedTimes", JSON.stringify(saved));
}

function render() {
  savedTimes.innerHTML = "";

  saved.forEach((t, i) => {
    const li = document.createElement("li");

    const text = document.createElement("span");
    text.innerText = ` • ${t} `;

    const delBtn = document.createElement("button");
    delBtn.innerHTML = '<i class="bi bi-trash"></i>';
    delBtn.className = "btn btn-sm btn-outline-danger";
    delBtn.onclick = () => deleteTime(i);

    li.appendChild(text);
    li.appendChild(delBtn);
    savedTimes.appendChild(li);
  });
}

function saveTime() {
  if (h === 0 && m === 0 && s === 0 && ms === 0) return;

  saved.push(timeDisplay.innerText);
  persist();
  render();
}

function deleteTime(index) {
  saved.splice(index, 1);
  persist();
  render();
}

render();

var hourHand = document.getElementById("hour");
var minuteHand = document.getElementById("minut");
var secondHand = document.getElementById("second");
var digitalTime = document.getElementById("digitalTime");
var dateText = document.getElementById("dateText");

function clock() {
  var date = new Date();
  var h = date.getHours();
  var m = date.getMinutes();
  var s = date.getSeconds();

  //  العقارب
  var secDeg = (s / 60) * 360;
  var minDeg = (m / 60) * 360 + (s / 60) * 6;
  var hourDeg = ((h % 12) / 12) * 360 + (m / 60) * 30;

  secondHand.style.transform = `translateX(-50%) rotate(${secDeg}deg)`;
  minuteHand.style.transform = `translateX(-50%) rotate(${minDeg}deg)`;
  hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;

  // الارقام
  digitalTime.innerText = date.toLocaleTimeString("en-US");

  // التاريخ
  dateText.innerText = date.toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

clock();
setInterval(clock, 1000);
