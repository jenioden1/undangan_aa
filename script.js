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
let audioContext = null;

// Fungsi untuk unlock audio context dengan teknik Web Audio API
function unlockAudioContext() {
    try {
        // Coba buat AudioContext untuk "unlock" audio
        if (!audioContext) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioContext = new AudioContextClass();
                
                // Coba resume context (ini bisa unlock audio)
                if (audioContext.state === 'suspended') {
                    audioContext.resume().then(() => {
                        console.log('AudioContext resumed');
                    }).catch(err => {
                        console.log('AudioContext resume failed:', err);
                    });
                }
            }
        }
    } catch (e) {
        console.log('AudioContext creation failed:', e);
    }
}

// Fungsi untuk simulate user interaction (optimized - lebih ringan)
function simulateUserInteraction() {
    // Hanya jalankan jika body sudah ada
    if (!document.body) return;
    
    try {
        // Buat invisible div sekali dan reuse jika memungkinkan
        let invisibleDiv = document.getElementById('audio-unlock-helper');
        if (!invisibleDiv) {
            invisibleDiv = document.createElement('div');
            invisibleDiv.id = 'audio-unlock-helper';
            invisibleDiv.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none';
            document.body.appendChild(invisibleDiv);
        }
        
        // Trigger event penting saja (optimized)
        try {
            const clickEvent = new Event('click', { bubbles: true, cancelable: true });
            invisibleDiv.dispatchEvent(clickEvent);
        } catch (e) {
            // Ignore
        }
    } catch (e) {
        // Ignore errors
    }
}

// Fungsi untuk memutar audio dengan teknik muted autoplay (lebih agresif)
function playAudioWithMutedTechnique() {
    if (!audioElement || audioStarted) return;
    
    // Pastikan audio sudah dimuat minimal sebagian
    if (audioElement.readyState === 0) {
        audioElement.load();
        // Tunggu sedikit lalu coba lagi
        setTimeout(() => playAudioWithMutedTechnique(), 30);
        return;
    }
    
    // Teknik 1: Unlock AudioContext dulu
    unlockAudioContext();
    
    // Teknik 2: Simulate user interaction
    simulateUserInteraction();
    
    // Teknik 3: Play dengan muted dulu (browser biasanya mengizinkan ini)
    // Pastikan muted = true sebelum play - ini sangat penting!
    audioElement.muted = true;
    audioElement.volume = 0.5; // Set volume untuk nanti
    
    // Pastikan loop aktif
    audioElement.loop = true;
    
    // Teknik 4: Set playbackRate untuk "trick" browser
    try {
        audioElement.playbackRate = 1.0;
    } catch (e) {
        // Ignore
    }
    
    // Teknik 5: Pastikan autoplay attribute aktif
    audioElement.setAttribute('autoplay', '');
    
    // Teknik 6: Coba play langsung tanpa promise dulu (untuk browser lama)
    try {
        audioElement.play();
        if (!audioElement.paused) {
            audioStarted = true;
            audioUnlocked = true;
            setTimeout(() => {
                if (audioElement) {
                    audioElement.muted = false;
                }
            }, 100);
            return;
        }
    } catch (e) {
        // Continue dengan promise method
    }
    
    // Coba play dengan beberapa teknik sekaligus
    const playPromise = audioElement.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                // Berhasil play dengan muted, sekarang unmute
                audioStarted = true;
                audioUnlocked = true;
                
                // Unmute dengan delay bertahap untuk lebih smooth
                setTimeout(() => {
                    if (audioElement && !audioElement.paused) {
                        audioElement.muted = false;
                        console.log('Audio started and unmuted successfully');
                    }
                }, 200);
            })
            .catch(error => {
                // Jika gagal dengan muted, coba teknik lain
                console.log('Muted autoplay attempt failed:', error);
                
                // Teknik alternatif: Coba dengan volume sangat rendah dulu
                if (audioElement && !audioStarted) {
                    try {
                        audioElement.volume = 0.01;
                        audioElement.muted = false;
                        const retryPromise = audioElement.play();
                        if (retryPromise !== undefined) {
                            retryPromise.then(() => {
                                audioStarted = true;
                                audioUnlocked = true;
                                // Naikkan volume secara bertahap
                                let vol = 0.01;
                                const volumeInterval = setInterval(() => {
                                    if (vol < 0.5 && audioElement) {
                                        vol += 0.05;
                                        audioElement.volume = vol;
                                    } else {
                                        clearInterval(volumeInterval);
                                    }
                                }, 100);
                            }).catch(() => {
                                // Reset untuk retry nanti
                                if (audioElement) {
                                    try {
                                        audioElement.pause();
                                        audioElement.currentTime = 0;
                                        audioElement.muted = true;
                                        audioElement.volume = 0.5;
                                    } catch (e) {
                                        // Ignore
                                    }
                                }
                            });
                        }
                    } catch (e) {
                        // Ignore
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

// Inisialisasi audio - coba segera setelah script dimuat (optimized)
(function initAudio() {
    // Unlock AudioContext sekali saja
    unlockAudioContext();
    
    // Fungsi untuk inisialisasi audio element (optimized)
    function initAudioElement() {
        if (!audioElement) {
            audioElement = document.getElementById('background-music');
        }
        
        if (audioElement && !audioStarted) {
            // Set properties sekali saja
            if (!audioElement.loop) {
                audioElement.loop = true;
                audioElement.volume = 0.5;
                audioElement.muted = true;
                audioElement.setAttribute('autoplay', '');
            }
            
            // Coba play langsung dengan teknik muted autoplay
            playAudioWithMutedTechnique();
        }
    }
    
    // Coba dapatkan audio element segera
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAudioElement, { once: true });
    } else {
        initAudioElement();
    }
    
    // Juga coba saat window load (sekali saja)
    window.addEventListener('load', initAudioElement, { once: true });
    
    // Coba unlock saat page visibility berubah (sekali saja)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && !audioStarted) {
            unlockAudioContext();
            initAudioElement();
        }
    }, { once: true });
})();

// Inisialisasi audio saat halaman dimuat (optimized)
document.addEventListener('DOMContentLoaded', function() {
    if (!audioElement) {
        audioElement = document.getElementById('background-music');
    }
    
    if (!audioElement) return;
    
    // Unlock AudioContext sekali
    unlockAudioContext();
    
    // Set properties sekali
    audioElement.loop = true;
    audioElement.volume = 0.5;
    audioElement.muted = true;
    audioElement.setAttribute('autoplay', '');
    
    // Preload metadata saja (lebih ringan dari auto)
    audioElement.preload = 'metadata';
    
    // Coba play dengan requestAnimationFrame (lebih efisien)
    requestAnimationFrame(() => {
        if (!audioStarted) {
            playAudioWithMutedTechnique();
        }
    });
    
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
        if (audioElement && !audioStarted) {
            audioElement.load();
            unlockAudioContext();
            simulateUserInteraction();
            setTimeout(() => {
                if (!audioStarted) {
                    playAudioWithMutedTechnique();
                }
            }, 200);
        }
    });
    
    // Fungsi untuk mencoba memutar audio (optimized dengan debounce)
    let tryPlayTimeout = null;
    const tryPlay = function() {
        if (audioStarted || !audioElement) return;
        
        // Debounce: cancel previous timeout
        if (tryPlayTimeout) {
            clearTimeout(tryPlayTimeout);
        }
        
        tryPlayTimeout = setTimeout(() => {
            if (!audioStarted && audioElement) {
                playAudioWithMutedTechnique();
            }
        }, 50);
    };
    
    // Coba putar audio dengan timing yang lebih efisien
    tryPlay();
    setTimeout(tryPlay, 100);
    setTimeout(tryPlay, 300);
    setTimeout(tryPlay, 500);
    
    // Tunggu audio dimuat dengan event yang penting saja (optimized)
    const handleAudioReady = function() {
        if (!audioStarted) {
            tryPlay();
        }
    };
    
    // Hanya listen event yang penting
    audioElement.addEventListener('canplay', handleAudioReady, { once: true });
    audioElement.addEventListener('canplaythrough', handleAudioReady, { once: true });
    
    // Coba saat audio sudah cukup dimuat
    if (audioElement.readyState >= 2) {
        tryPlay();
    }
    
    // Coba saat page fully loaded (sekali saja)
    window.addEventListener('load', tryPlay, { once: true });
    
    // Gunakan Visibility API - coba putar saat tab menjadi visible (sekali)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && !audioStarted) {
            unlockAudioContext();
            tryPlay();
        }
    }, { once: true });
    
    // Coba saat window focus (sekali)
    window.addEventListener('focus', function() {
        if (!audioStarted) {
            unlockAudioContext();
            tryPlay();
        }
    }, { once: true });
    
    // Event listener untuk interaksi user (optimized dengan debounce)
    let interactionTimeout = null;
    const handleUserInteraction = function() {
        if (audioStarted) return;
        
        // Debounce: cancel previous timeout
        if (interactionTimeout) {
            clearTimeout(interactionTimeout);
        }
        
        interactionTimeout = setTimeout(() => {
            if (!audioStarted) {
                unlockAudioContext();
                tryPlay();
            }
        }, 100);
    };
    
    // Hanya listen event yang penting (optimized)
    const interactionEvents = ['click', 'touchstart', 'scroll', 'mousedown', 'keydown'];
    interactionEvents.forEach(eventType => {
        document.addEventListener(eventType, handleUserInteraction, { once: true, passive: true });
    });
    
    // Retry mechanism: coba lagi setiap beberapa detik jika belum berhasil (optimized)
    let retryCount = 0;
    const maxRetries = 15; // Dikurangi dari 40
    const retryInterval = setInterval(function() {
        if (!audioStarted && retryCount < maxRetries) {
            retryCount++;
            // Unlock setiap beberapa retry
            if (retryCount % 3 === 0) {
                unlockAudioContext();
            }
            tryPlay();
        } else if (audioStarted) {
            clearInterval(retryInterval);
        }
    }, 500); // Dikurangi frekuensi dari 150ms ke 500ms
    
    // Fallback: coba lagi setelah beberapa detik (optimized)
    setTimeout(function() {
        if (!audioStarted) {
            unlockAudioContext();
            tryPlay();
        }
    }, 2000);
});

// Inisialisasi langsung - coba play audio segera setelah script dimuat (optimized)
(function immediateInit() {
    // Unlock sekali
    unlockAudioContext();
    
    // Coba dapatkan audio element dan play langsung
    function tryImmediatePlay() {
        if (!audioElement) {
            audioElement = document.getElementById('background-music');
        }
        
        if (audioElement && !audioStarted) {
            if (!audioElement.loop) {
                audioElement.loop = true;
                audioElement.volume = 0.5;
                audioElement.muted = true;
                audioElement.setAttribute('autoplay', '');
            }
            
            playAudioWithMutedTechnique();
        }
    }
    
    // Coba segera dan sekali lagi setelah delay
    tryImmediatePlay();
    setTimeout(tryImmediatePlay, 200);
    
    // Coba saat window load (sekali)
    window.addEventListener('load', tryImmediatePlay, { once: true });
})();

// ========== TOMBOL PLAY/PAUSE MUSIK ==========
function initMusicToggleButton() {
    const musicBtn = document.getElementById('music-toggle-btn');
    const playIcon = musicBtn?.querySelector('.play-icon');
    const pauseIcon = musicBtn?.querySelector('.pause-icon');
    
    if (!musicBtn || !audioElement) return;
    
    // Fungsi untuk update icon tombol
    function updateButtonIcon(isPlaying) {
        if (playIcon && pauseIcon) {
            if (isPlaying) {
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'flex';
                musicBtn.classList.add('playing');
            } else {
                playIcon.style.display = 'flex';
                pauseIcon.style.display = 'none';
                musicBtn.classList.remove('playing');
            }
        }
    }
    
    // Fungsi untuk toggle play/pause
    function toggleMusic() {
        if (!audioElement) return;
        
        if (audioElement.paused) {
            // Play musik
            audioElement.muted = false;
            const playPromise = audioElement.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        audioStarted = true;
                        updateButtonIcon(true);
                    })
                    .catch(error => {
                        console.log('Error playing music:', error);
                    });
            } else {
                audioElement.play();
                audioStarted = true;
                updateButtonIcon(true);
            }
        } else {
            // Pause musik
            audioElement.pause();
            updateButtonIcon(false);
        }
    }
    
    // Event listener untuk tombol
    musicBtn.addEventListener('click', toggleMusic);
    
    // Update icon berdasarkan status audio
    function checkAudioStatus() {
        if (audioElement) {
            updateButtonIcon(!audioElement.paused && !audioElement.muted);
        }
    }
    
    // Check status saat audio events
    audioElement.addEventListener('play', () => {
        if (!audioElement.muted) {
            updateButtonIcon(true);
        }
    });
    
    audioElement.addEventListener('pause', () => {
        updateButtonIcon(false);
    });
    
    // Check status secara berkala (untuk handle autoplay)
    setInterval(checkAudioStatus, 500);
    
    // Initial check
    setTimeout(checkAudioStatus, 1000);
}

// Inisialisasi tombol saat DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // Tunggu audio element ready
    setTimeout(initMusicToggleButton, 500);
});

// Juga coba saat window load
window.addEventListener('load', function() {
    setTimeout(initMusicToggleButton, 300);
});
