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

// Fungsi untuk simulate user interaction (teknik advanced)
function simulateUserInteraction() {
    try {
        // Teknik 1: Buat invisible div dan trigger click event
        const invisibleDiv = document.createElement('div');
        invisibleDiv.style.position = 'absolute';
        invisibleDiv.style.left = '-9999px';
        invisibleDiv.style.width = '1px';
        invisibleDiv.style.height = '1px';
        invisibleDiv.style.opacity = '0';
        invisibleDiv.style.pointerEvents = 'none';
        document.body.appendChild(invisibleDiv);
        
        // Trigger berbagai event
        const events = ['mousedown', 'mouseup', 'click', 'touchstart', 'touchend'];
        events.forEach(eventType => {
            try {
                const event = new Event(eventType, { bubbles: true, cancelable: true });
                invisibleDiv.dispatchEvent(event);
            } catch (e) {
                // Ignore
            }
        });
        
        // Hapus setelah beberapa detik
        setTimeout(() => {
            if (invisibleDiv.parentNode) {
                invisibleDiv.parentNode.removeChild(invisibleDiv);
            }
        }, 1000);
    } catch (e) {
        console.log('Simulate interaction failed:', e);
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

// Inisialisasi audio - coba segera setelah script dimuat
(function initAudio() {
    // Unlock AudioContext segera (sebelum DOM ready)
    unlockAudioContext();
    
    // Simulate user interaction segera - beberapa kali
    simulateUserInteraction();
    setTimeout(() => simulateUserInteraction(), 10);
    setTimeout(() => simulateUserInteraction(), 50);
    
    // Fungsi untuk inisialisasi audio element
    function initAudioElement() {
        if (!audioElement) {
            audioElement = document.getElementById('background-music');
        }
        
        if (audioElement && !audioStarted) {
            // Set properties
            audioElement.loop = true;
            audioElement.volume = 0.5;
            audioElement.muted = true; // Pastikan muted untuk autoplay
            audioElement.setAttribute('autoplay', '');
            
            // Unlock dan simulate
            unlockAudioContext();
            simulateUserInteraction();
            
            // Coba play langsung dengan teknik muted autoplay
            playAudioWithMutedTechnique();
        }
    }
    
    // Coba dapatkan audio element segera
    if (document.readyState === 'loading') {
        // DOM belum siap, tunggu dulu
        document.addEventListener('DOMContentLoaded', function() {
            initAudioElement();
            // Coba lagi setelah delay singkat
            setTimeout(initAudioElement, 10);
            setTimeout(initAudioElement, 50);
        });
    } else {
        // DOM sudah siap
        initAudioElement();
        // Coba lagi setelah delay singkat
        setTimeout(initAudioElement, 10);
        setTimeout(initAudioElement, 50);
    }
    
    // Juga coba saat window load
    window.addEventListener('load', function() {
        initAudioElement();
        setTimeout(initAudioElement, 10);
        setTimeout(initAudioElement, 100);
    });
    
    // Teknik tambahan: Coba unlock saat page visibility berubah
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && !audioStarted) {
            unlockAudioContext();
            simulateUserInteraction();
            initAudioElement();
        }
    });
    
    // Coba init setiap beberapa ms sampai berhasil
    let initAttempts = 0;
    const initInterval = setInterval(function() {
        if (!audioStarted && initAttempts < 20) {
            initAttempts++;
            initAudioElement();
        } else if (audioStarted) {
            clearInterval(initInterval);
        }
    }, 100);
})();

// Inisialisasi audio saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    audioElement = document.getElementById('background-music');
    
    if (!audioElement) return;
    
    // Unlock AudioContext segera setelah DOM ready - beberapa kali
    unlockAudioContext();
    setTimeout(() => unlockAudioContext(), 10);
    setTimeout(() => unlockAudioContext(), 50);
    
    // Simulate user interaction - beberapa kali
    simulateUserInteraction();
    setTimeout(() => simulateUserInteraction(), 10);
    setTimeout(() => simulateUserInteraction(), 50);
    
    // Pastikan audio akan looping
    audioElement.loop = true;
    audioElement.volume = 0.5;
    audioElement.muted = true; // Pastikan muted untuk autoplay
    audioElement.setAttribute('autoplay', '');
    
    // Preload audio untuk memastikan siap diputar
    audioElement.preload = 'auto';
    
    // Coba play segera - beberapa kali dengan teknik berbeda
    playAudioWithMutedTechnique();
    
    // Teknik: Coba play dengan requestAnimationFrame (kadang lebih berhasil)
    requestAnimationFrame(() => {
        if (!audioStarted && audioElement) {
            playAudioWithMutedTechnique();
        }
    });
    
    // Coba lagi setelah beberapa frame
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (!audioStarted && audioElement) {
                playAudioWithMutedTechnique();
            }
        });
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
        unlockAudioContext();
        simulateUserInteraction();
        setTimeout(tryPlay, 10);
    }
    
    // Coba lagi saat page fully loaded
    window.addEventListener('load', function() {
        unlockAudioContext();
        simulateUserInteraction();
        setTimeout(tryPlay, 50);
        setTimeout(tryPlay, 200);
        setTimeout(tryPlay, 500);
    });
    
    // Teknik tambahan: Gunakan IntersectionObserver untuk detect visibility
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting && !audioStarted) {
                    unlockAudioContext();
                    simulateUserInteraction();
                    setTimeout(tryPlay, 50);
                }
            });
        }, { threshold: 0.1 });
        
        // Observe body element
        if (document.body) {
            observer.observe(document.body);
        }
    }
    
    // Gunakan Visibility API - coba putar saat tab menjadi visible
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && !audioStarted) {
            unlockAudioContext();
            simulateUserInteraction();
            setTimeout(tryPlay, 50);
        }
    });
    
    // Coba saat window focus (untuk mobile dan desktop)
    window.addEventListener('focus', function() {
        if (!audioStarted) {
            unlockAudioContext();
            simulateUserInteraction();
            setTimeout(tryPlay, 50);
        }
    });
    
    // Coba saat window blur (kadang trigger saat halaman pertama kali load)
    window.addEventListener('blur', function() {
        if (!audioStarted) {
            unlockAudioContext();
            setTimeout(tryPlay, 50);
        }
    });
    
    // Coba saat mouse move (interaksi halus) - tidak hanya sekali
    document.addEventListener('mousemove', function() {
        if (!audioStarted) {
            unlockAudioContext();
            setTimeout(tryPlay, 5);
        }
    }, { passive: true });
    
    // Coba saat touch (untuk mobile) - tidak hanya sekali
    document.addEventListener('touchstart', function() {
        if (!audioStarted) {
            unlockAudioContext();
            simulateUserInteraction();
            setTimeout(tryPlay, 5);
        }
    }, { passive: true });
    
    // Coba saat pointer move (untuk touch dan mouse)
    document.addEventListener('pointermove', function() {
        if (!audioStarted) {
            unlockAudioContext();
            setTimeout(tryPlay, 5);
        }
    }, { passive: true });
    
    // Coba saat ada interaksi apapun dengan halaman
    const anyInteraction = function() {
        if (!audioStarted) {
            unlockAudioContext();
            simulateUserInteraction();
            setTimeout(tryPlay, 5);
        }
    };
    
    // Tambahkan listener untuk berbagai event interaksi
    ['mousedown', 'mouseup', 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'click'].forEach(eventType => {
        document.addEventListener(eventType, anyInteraction, { passive: true });
    });
    
    // Retry mechanism: coba lagi setiap beberapa detik jika belum berhasil
    let retryCount = 0;
    const maxRetries = 40; // Lebih banyak retry
    const retryInterval = setInterval(function() {
        if (!audioStarted && retryCount < maxRetries) {
            retryCount++;
            // Unlock dan simulate setiap beberapa retry
            if (retryCount % 5 === 0) {
                unlockAudioContext();
                simulateUserInteraction();
            }
            tryPlay();
        } else if (audioStarted) {
            clearInterval(retryInterval);
        }
    }, 150); // Lebih sering retry (setiap 150ms)
    
    // Fallback: coba lagi dengan lebih agresif setelah beberapa detik
    setTimeout(function() {
        if (!audioStarted) {
            unlockAudioContext();
            simulateUserInteraction();
            tryPlay();
        }
    }, 1500);
    
    // Coba lagi setelah 2 detik
    setTimeout(function() {
        if (!audioStarted) {
            unlockAudioContext();
            simulateUserInteraction();
            tryPlay();
        }
    }, 2000);
    
    // Coba lagi setelah 3 detik
    setTimeout(function() {
        if (!audioStarted) {
            unlockAudioContext();
            simulateUserInteraction();
            tryPlay();
        }
    }, 3000);
    
    // Tambahkan event listener untuk interaksi user sebagai fallback
    const fallbackHandler = function() {
        if (!audioStarted) {
            unlockAudioContext();
            simulateUserInteraction();
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

// Inisialisasi langsung - coba play audio segera setelah script dimuat
(function immediateInit() {
    // Unlock segera
    unlockAudioContext();
    simulateUserInteraction();
    
    // Coba dapatkan audio element dan play langsung
    function tryImmediatePlay() {
        if (!audioElement) {
            audioElement = document.getElementById('background-music');
        }
        
        if (audioElement && !audioStarted) {
            audioElement.loop = true;
            audioElement.volume = 0.5;
            audioElement.muted = true;
            audioElement.setAttribute('autoplay', '');
            
            unlockAudioContext();
            simulateUserInteraction();
            playAudioWithMutedTechnique();
        }
    }
    
    // Coba segera
    tryImmediatePlay();
    
    // Coba lagi setelah delay singkat
    setTimeout(tryImmediatePlay, 10);
    setTimeout(tryImmediatePlay, 50);
    setTimeout(tryImmediatePlay, 100);
    setTimeout(tryImmediatePlay, 200);
    setTimeout(tryImmediatePlay, 500);
    
    // Coba saat window load
    if (window.addEventListener) {
        window.addEventListener('load', function() {
            tryImmediatePlay();
            setTimeout(tryImmediatePlay, 10);
            setTimeout(tryImmediatePlay, 50);
        });
    }
})();
