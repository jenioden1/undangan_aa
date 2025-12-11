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
let audioUnlocked = false;

// Fungsi untuk memutar audio dengan teknik muted autoplay
function playAudioWithMutedTechnique() {
    if (!audioElement || audioStarted) return;
    
    // Pastikan audio sudah dimuat minimal sebagian
    if (audioElement.readyState === 0) {
        audioElement.load();
        // Tunggu sedikit lalu coba lagi
        setTimeout(() => playAudioWithMutedTechnique(), 100);
        return;
    }
    
    // Teknik: Play dengan muted dulu (browser biasanya mengizinkan ini)
    // Pastikan muted = true sebelum play - ini sangat penting!
    audioElement.muted = true;
    audioElement.volume = 0.5; // Set volume untuk nanti
    
    // Pastikan loop aktif
    audioElement.loop = true;
    
    // Coba play
    const playPromise = audioElement.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                // Berhasil play dengan muted, sekarang unmute
                audioStarted = true;
                audioUnlocked = true;
                
                // Unmute setelah delay singkat (browser perlu waktu untuk "mengizinkan" unmute)
                setTimeout(() => {
                    if (audioElement && !audioElement.paused) {
                        audioElement.muted = false;
                        console.log('Audio started and unmuted successfully');
                    }
                }, 300);
            })
            .catch(error => {
                // Jika gagal dengan muted, coba lagi setelah delay
                console.log('Muted autoplay attempt failed:', error);
                // Reset dan coba lagi nanti (akan dicoba oleh retry mechanism)
                if (audioElement) {
                    try {
                        audioElement.pause();
                        audioElement.currentTime = 0;
                    } catch (e) {
                        // Ignore pause errors
                    }
                }
            });
    } else {
        // Fallback untuk browser lama
        try {
            audioElement.play();
            if (!audioElement.paused) {
                audioElement.muted = false;
                audioStarted = true;
                audioUnlocked = true;
            }
        } catch (e) {
            console.log('Error playing audio:', e);
        }
    }
}

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
        setTimeout(() => attemptPlay(), 50);
        return;
    }
    
    // Pastikan tidak muted untuk teknik normal
    audioElement.muted = false;
    audioElement.volume = 0.5;
    
    // Coba putar dengan berbagai teknik
    const playPromise = audioElement.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                // Audio berhasil diputar
                audioStarted = true;
                audioUnlocked = true;
                console.log('Background music started');
            })
            .catch(error => {
                // Autoplay mungkin diblokir, coba teknik muted autoplay
                if (!audioStarted) {
                    playAudioWithMutedTechnique();
                }
            });
    } else {
        // Fallback untuk browser lama
        try {
            audioElement.play();
            audioStarted = true;
            audioUnlocked = true;
        } catch (e) {
            // Coba teknik muted autoplay jika gagal
            if (!audioStarted) {
                playAudioWithMutedTechnique();
            }
        }
    }
}

// Inisialisasi audio - coba segera setelah script dimuat
(function initAudio() {
    // Coba dapatkan audio element segera
    if (document.readyState === 'loading') {
        // DOM belum siap, tunggu dulu
        document.addEventListener('DOMContentLoaded', function() {
            audioElement = document.getElementById('background-music');
            if (audioElement) {
                audioElement.loop = true;
                audioElement.volume = 0.5;
                // Coba dengan teknik muted autoplay
                playAudioWithMutedTechnique();
            }
        });
    } else {
        // DOM sudah siap
        audioElement = document.getElementById('background-music');
        if (audioElement) {
            audioElement.loop = true;
            audioElement.volume = 0.5;
            // Coba dengan teknik muted autoplay
            playAudioWithMutedTechnique();
        }
    }
    
    // Juga coba saat window load
    window.addEventListener('load', function() {
        if (!audioElement) {
            audioElement = document.getElementById('background-music');
        }
        if (audioElement && !audioStarted) {
            audioElement.loop = true;
            audioElement.volume = 0.5;
            // Coba dengan teknik muted autoplay
            playAudioWithMutedTechnique();
        }
    });
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
    
    // Fungsi untuk mencoba memutar audio
    const tryPlay = function() {
        if (!audioStarted && audioElement) {
            // Gunakan teknik muted autoplay (lebih berhasil di browser modern)
            playAudioWithMutedTechnique();
        }
    };
    
    // Coba putar audio segera - beberapa kali dengan delay berbeda
    // Coba segera setelah DOM ready
    tryPlay();
    
    // Coba dengan timing yang lebih agresif
    setTimeout(tryPlay, 10);
    setTimeout(tryPlay, 30);
    setTimeout(tryPlay, 50);
    setTimeout(tryPlay, 100);
    setTimeout(tryPlay, 150);
    setTimeout(tryPlay, 200);
    setTimeout(tryPlay, 300);
    setTimeout(tryPlay, 400);
    setTimeout(tryPlay, 500);
    setTimeout(tryPlay, 700);
    setTimeout(tryPlay, 1000);
    
    // Tunggu audio dimuat dengan berbagai event
    // Tambahkan listener untuk semua event audio yang relevan
    const audioEvents = ['loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'playing'];
    audioEvents.forEach(eventType => {
        audioElement.addEventListener(eventType, function() {
            if (!audioStarted) {
                setTimeout(tryPlay, 10);
            }
        }, { once: false }); // Bukan once, karena mungkin perlu retry
    });
    
    // Juga coba saat audio sudah cukup dimuat
    if (audioElement.readyState >= 1) {
        // Audio sudah mulai dimuat, coba play segera
        setTimeout(tryPlay, 10);
    }
    
    // Coba lagi saat page fully loaded
    window.addEventListener('load', function() {
        setTimeout(tryPlay, 50);
        setTimeout(tryPlay, 200);
        setTimeout(tryPlay, 500);
    });
    
    // Gunakan Visibility API - coba putar saat tab menjadi visible
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && !audioStarted) {
            setTimeout(tryPlay, 100);
        }
    });
    
    // Coba saat window focus (untuk mobile dan desktop)
    window.addEventListener('focus', function() {
        if (!audioStarted) {
            setTimeout(tryPlay, 100);
        }
    });
    
    // Coba saat window blur (kadang trigger saat halaman pertama kali load)
    window.addEventListener('blur', function() {
        if (!audioStarted) {
            setTimeout(tryPlay, 100);
        }
    });
    
    // Coba saat mouse move (interaksi halus) - tidak hanya sekali
    document.addEventListener('mousemove', function() {
        if (!audioStarted) {
            setTimeout(tryPlay, 10);
        }
    }, { passive: true });
    
    // Coba saat touch (untuk mobile) - tidak hanya sekali
    document.addEventListener('touchstart', function() {
        if (!audioStarted) {
            setTimeout(tryPlay, 10);
        }
    }, { passive: true });
    
    // Coba saat pointer move (untuk touch dan mouse)
    document.addEventListener('pointermove', function() {
        if (!audioStarted) {
            setTimeout(tryPlay, 10);
        }
    }, { passive: true });
    
    // Coba saat ada interaksi apapun dengan halaman
    const anyInteraction = function() {
        if (!audioStarted) {
            setTimeout(tryPlay, 10);
        }
    };
    
    // Tambahkan listener untuk berbagai event interaksi
    ['mousedown', 'mouseup', 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'click'].forEach(eventType => {
        document.addEventListener(eventType, anyInteraction, { passive: true });
    });
    
    // Retry mechanism: coba lagi setiap beberapa detik jika belum berhasil
    let retryCount = 0;
    const maxRetries = 30; // Lebih banyak retry
    const retryInterval = setInterval(function() {
        if (!audioStarted && retryCount < maxRetries) {
            retryCount++;
            tryPlay();
        } else if (audioStarted) {
            clearInterval(retryInterval);
        }
    }, 200); // Lebih sering retry (setiap 200ms)
    
    // Fallback: coba lagi dengan lebih agresif setelah beberapa detik
    setTimeout(function() {
        if (!audioStarted) {
            // Coba play sekali lagi
            tryPlay();
        }
    }, 1500);
    
    // Coba lagi setelah 2 detik
    setTimeout(function() {
        if (!audioStarted) {
            tryPlay();
        }
    }, 2000);
    
    // Coba lagi setelah 3 detik
    setTimeout(function() {
        if (!audioStarted) {
            tryPlay();
        }
    }, 3000);
    
    // Tambahkan event listener untuk interaksi user sebagai fallback
    const fallbackHandler = function() {
        if (!audioStarted) {
            tryPlay();
        }
    };
    document.addEventListener('click', fallbackHandler, { once: true, passive: true });
    document.addEventListener('touchstart', fallbackHandler, { once: true, passive: true });
    document.addEventListener('touchend', fallbackHandler, { once: true, passive: true });
    document.addEventListener('scroll', fallbackHandler, { once: true, passive: true });
    document.addEventListener('mousedown', fallbackHandler, { once: true, passive: true });
    document.addEventListener('keydown', fallbackHandler, { once: true, passive: true });
});
