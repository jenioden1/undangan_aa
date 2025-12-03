const heroButton = document.getElementById("openInvitation");
const loader = document.getElementById("loader");
const bgm = document.getElementById("bgm");
const musicToggle = document.getElementById("musicToggle");
const darkToggle = document.getElementById("darkModeToggle");
const lightbox = document.getElementById("lightbox");
const lightboxImg = lightbox.querySelector("img");
const lightboxClose = lightbox.querySelector(".lightbox-close");
const galleryItems = document.querySelectorAll(".gallery-item");
const countdownDate = new Date("2025-12-20T09:00:00+07:00").getTime();
const form = document.getElementById("rsvpForm");
const formFeedback = document.getElementById("formFeedback");
const shareBtn = document.getElementById("shareWa");
const floatingContainer = document.querySelector(".floating-florals");

let musicPlaying = false;

const floralColors = ["rgba(212,175,55,0.4)", "rgba(245,212,215,0.5)", "rgba(255,255,255,0.3)"];
function generateFlorals(amount = 12) {
  for (let i = 0; i < amount; i += 1) {
    const span = document.createElement("span");
    span.style.left = `${Math.random() * 100}%`;
    span.style.bottom = `${Math.random() * 100}px`;
    span.style.backgroundColor = floralColors[i % floralColors.length];
    span.style.animationDelay = `${Math.random() * 10}s`;
    span.style.animationDuration = `${18 + Math.random() * 10}s`;
    floatingContainer.appendChild(span);
  }
}

function hideLoader() {
  loader.classList.add("hide");
  setTimeout(() => loader.remove(), 600);
}

window.addEventListener("load", () => {
  setTimeout(hideLoader, 1200);
  generateFlorals();
});

function startMusic() {
  bgm.play().then(() => {
    musicPlaying = true;
    musicToggle.querySelector(".label").textContent = "Jeda Musik";
  });
}

heroButton.addEventListener("click", () => {
  document.querySelector("#pembuka").scrollIntoView({ behavior: "smooth" });
  if (!musicPlaying) {
    startMusic();
  }
});

musicToggle.addEventListener("click", () => {
  if (musicPlaying) {
    bgm.pause();
    musicToggle.querySelector(".label").textContent = "Putar Musik";
  } else {
    startMusic();
  }
  musicPlaying = !musicPlaying;
});

darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

function countdownTick() {
  const now = Date.now();
  const difference = countdownDate - now;
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);
  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
  if (difference < 0) {
    document.querySelector(".countdown-timer").textContent = "Acara telah berlangsung. Terima kasih atas doa Anda.";
    clearInterval(countdownInterval);
  }
}

const countdownInterval = setInterval(countdownTick, 1000);
countdownTick();

// Section reveal animations
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".fade-left, .fade-right, .slide-up").forEach(el => observer.observe(el));

// Lightbox
galleryItems.forEach(item => {
  item.addEventListener("click", () => {
    lightboxImg.src = item.src;
    lightbox.classList.add("open");
  });
});

lightboxClose.addEventListener("click", () => lightbox.classList.remove("open"));
lightbox.addEventListener("click", e => {
  if (e.target === lightbox) lightbox.classList.remove("open");
});

// RSVP submit
form.addEventListener("submit", async e => {
  e.preventDefault();
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData);
  payload.timestamp = new Date().toISOString();
  formFeedback.textContent = "Mengirim data...";
  try {
    const scriptURL = "https://script.google.com/macros/s/YOUR-SCRIPT-ID/exec";
    const response = await fetch(scriptURL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Network error");
    formFeedback.textContent = "Terima kasih! Konfirmasi Anda tersimpan.";
    form.reset();
  } catch (error) {
    localStorage.setItem("rsvpBackup", JSON.stringify(payload));
    formFeedback.textContent = "Berhasil disimpan secara lokal. Periksa koneksi Anda.";
  }
});

shareBtn.addEventListener("click", () => {
  const text = encodeURIComponent(
    `Halo! Kami mengundang Anda ke pernikahan Yuli & Eful pada 20 Desember 2025 di Parung Lesang, Banjar. Detail lengkap ada di tautan berikut: https://contoh-undangan.com`
  );
  window.open(`https://wa.me/?text=${text}`, "_blank");
});

