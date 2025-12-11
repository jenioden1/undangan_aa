// Fungsi untuk scroll ke halaman detail
function scrollToDetail() {
    document.getElementById('detail').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Fungsi untuk memformat nama (mengubah underscore menjadi spasi dan kapitalisasi)
function formatName(name) {
    if (!name) return null;
    
    try {
        name = decodeURIComponent(name);
    } catch (e) {
        // Jika decode gagal, gunakan nama asli
    }
    
    // Ganti underscore (_) dengan spasi
    name = name
        .replace(/_/g, ' ')
        .replace(/[-+]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    
    // Kapitalisasi setiap kata, dengan pengecualian untuk gelar akademik
    return name
        .split(' ')
        .map(word => {
            if (word.length === 0) return '';
            
            // Deteksi gelar akademik (pattern: huruf tunggal diikuti titik dan huruf, contoh: S.E, S.Kom, S.Pd)
            // Pattern: [A-Za-z]\.[A-Za-z]+ (contoh: S.E, S.Kom, S.Pd, dll)
            const degreePattern = /^([A-Za-z])\.([A-Za-z]+)$/;
            
            const degreeMatch = word.match(degreePattern);
            if (degreeMatch) {
                // Jika adalah gelar, pastikan huruf pertama kapital, sisanya sesuai yang diketik
                const firstLetter = degreeMatch[1].toUpperCase();
                const afterDot = degreeMatch[2]; // Pertahankan format asli setelah titik
                return firstLetter + '.' + afterDot;
            }
            
            // Untuk kata biasa, kapitalisasi normal
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
}

// Fungsi untuk membaca nama tamu dari hash URL
function getGuestNameFromURL() {
    // Prioritas 1: Hash URL (index.html#jeni atau index.html#jeni_adi_hidayat)
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
        const hashName = hash.substring(1); // Hapus karakter #
        if (hashName) {
            return formatName(hashName);
        }
    }
    
    // Prioritas 2: Query parameter (index.html?nama=jeni)
    const urlParams = new URLSearchParams(window.location.search);
    const queryName = urlParams.get('nama');
    if (queryName) {
        return formatName(queryName);
    }
    
    return null;
}

// Fungsi untuk menampilkan nama tamu
function displayGuestName() {
    const namaTamuElement = document.getElementById('nama-tamu');
    if (!namaTamuElement) return;
    
    const guestName = getGuestNameFromURL();
    
    if (guestName) {
        namaTamuElement.textContent = guestName;
    } else {
        namaTamuElement.textContent = 'Bapak/Ibu/Saudara/i';
    }
}

// Smooth scroll behavior untuk semua anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Tampilkan nama tamu saat halaman dimuat
    displayGuestName();
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add fade-in animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe sections for animation
    const sections = document.querySelectorAll('.cover-page, .detail-page');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});

// Update nama tamu saat hash berubah (untuk navigasi tanpa reload)
window.addEventListener('hashchange', displayGuestName);

// Variabel global untuk tracking status audio
let audioStarted = false;
let audioElement = null;

// Fungsi untuk memutar background music dengan retry mechanism
function playBackgroundMusic() {
    if (!audioElement || audioStarted) return;
    
    // Set volume
    audioElement.volume = 0.5; // Set volume ke 50% agar tidak terlalu keras
    
    // Coba putar langsung
    attemptPlay();
}

function attemptPlay() {
    if (!audioElement || audioStarted) return;
    
    // Pastikan audio sudah dimuat minimal sebagian
    if (audioElement.readyState === 0) {
        // Audio belum dimuat sama sekali, load dulu
        audioElement.load();
        // Coba lagi setelah load
        setTimeout(() => attemptPlay(), 100);
        return;
    }
    
    // Coba putar dengan berbagai teknik
    const playPromise = audioElement.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                // Audio berhasil diputar
                audioStarted = true;
                console.log('Background music started');
            })
            .catch(error => {
                // Autoplay mungkin diblokir, coba lagi dengan teknik lain
                console.log('Autoplay attempt failed, retrying...', error);
                // Coba lagi setelah delay singkat
                setTimeout(() => {
                    if (!audioStarted) {
                        attemptPlay();
                    }
                }, 200);
            });
    } else {
        // Fallback untuk browser lama
        try {
            audioElement.play();
            audioStarted = true;
        } catch (e) {
            console.log('Error playing audio:', e);
        }
    }
}

// Inisialisasi audio - coba segera setelah script dimuat
(function initAudio() {
    // Coba dapatkan audio element segera
    audioElement = document.getElementById('background-music');
    
    if (audioElement) {
        // Pastikan audio akan looping
        audioElement.loop = true;
        audioElement.volume = 0.5;
        
        // Coba putar segera
        attemptPlay();
    }
})();

// Inisialisasi audio saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    audioElement = document.getElementById('background-music');
    
    if (!audioElement) return;
    
    // Pastikan audio akan looping
    audioElement.loop = true;
    audioElement.volume = 0.5;
    
    // Preload audio untuk memastikan siap diputar
    audioElement.preload = 'auto';
    
    // Event listener untuk memastikan audio tetap looping jika berhenti (backup jika loop gagal)
    audioElement.addEventListener('ended', function() {
        if (audioElement && audioElement.loop) {
            // Jika loop aktif tapi masih berhenti, restart manual
            audioElement.currentTime = 0;
            audioElement.play().catch(error => {
                console.log('Error restarting music:', error);
            });
        }
    });
    
    // Event listener untuk error handling
    audioElement.addEventListener('error', function(e) {
        console.log('Audio error:', e);
        // Coba reload audio jika error
        if (audioElement) {
            audioElement.load();
            setTimeout(() => attemptPlay(), 500);
        }
    });
    
    // Coba putar audio segera - beberapa kali dengan delay berbeda
    const tryPlay = function() {
        if (!audioStarted) {
            playBackgroundMusic();
        }
    };
    
    // Coba segera
    tryPlay();
    
    // Coba lagi setelah 100ms
    setTimeout(tryPlay, 100);
    
    // Coba lagi setelah 300ms
    setTimeout(tryPlay, 300);
    
    // Coba lagi setelah 500ms
    setTimeout(tryPlay, 500);
    
    // Tunggu audio dimuat jika belum siap
    if (audioElement.readyState < 2) {
        audioElement.addEventListener('canplay', tryPlay, { once: true });
        audioElement.addEventListener('canplaythrough', tryPlay, { once: true });
        audioElement.addEventListener('loadeddata', tryPlay, { once: true });
    }
    
    // Coba lagi saat page fully loaded
    window.addEventListener('load', function() {
        setTimeout(tryPlay, 100);
        setTimeout(tryPlay, 500);
    });
    
    // Retry mechanism: coba lagi setiap beberapa detik jika belum berhasil
    let retryCount = 0;
    const maxRetries = 15;
    const retryInterval = setInterval(function() {
        if (!audioStarted && retryCount < maxRetries) {
            retryCount++;
            tryPlay();
        } else if (audioStarted) {
            clearInterval(retryInterval);
        }
    }, 500);
    
    // Fallback: jika masih belum berhasil setelah beberapa detik, coba dengan interaksi
    setTimeout(function() {
        if (!audioStarted) {
            // Tambahkan event listener sebagai fallback
            const fallbackHandler = function() {
                if (!audioStarted) {
                    tryPlay();
                }
            };
            document.addEventListener('click', fallbackHandler, { once: true, passive: true });
            document.addEventListener('touchstart', fallbackHandler, { once: true, passive: true });
            document.addEventListener('scroll', fallbackHandler, { once: true, passive: true });
        }
    }, 3000);
});
