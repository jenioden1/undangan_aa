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

// Fungsi untuk memutar background music
function playBackgroundMusic() {
    const audio = document.getElementById('background-music');
    if (audio) {
        audio.volume = 0.5; // Set volume ke 50% agar tidak terlalu keras
        const playPromise = audio.play();
        
        // Handle promise jika browser memblokir autoplay
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    // Audio berhasil diputar
                    console.log('Background music started');
                })
                .catch(error => {
                    // Autoplay diblokir, akan dicoba lagi saat user berinteraksi
                    console.log('Autoplay blocked, will try again on user interaction');
                });
        }
    }
}

// Coba putar audio saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('background-music');
    
    if (audio) {
        // Pastikan audio akan looping
        audio.loop = true;
        
        // Event listener untuk memastikan audio tetap looping jika berhenti
        audio.addEventListener('ended', function() {
            audio.currentTime = 0;
            audio.play().catch(error => {
                console.log('Error restarting music:', error);
            });
        });
        
        // Coba putar audio langsung
        playBackgroundMusic();
        
        // Jika autoplay diblokir, coba lagi saat user berinteraksi
        let musicStarted = false;
        const startMusicOnInteraction = function() {
            if (!musicStarted) {
                if (audio && audio.paused) {
                    playBackgroundMusic();
                    musicStarted = true;
                    // Hapus event listener setelah musik mulai
                    document.removeEventListener('click', startMusicOnInteraction);
                    document.removeEventListener('scroll', startMusicOnInteraction);
                    document.removeEventListener('touchstart', startMusicOnInteraction);
                }
            }
        };
        
        // Coba putar saat user klik, scroll, atau touch
        document.addEventListener('click', startMusicOnInteraction, { once: true });
        document.addEventListener('scroll', startMusicOnInteraction, { once: true });
        document.addEventListener('touchstart', startMusicOnInteraction, { once: true });
    }
});
