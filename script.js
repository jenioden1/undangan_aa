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
    
    // Kapitalisasi setiap kata
    return name
        .split(' ')
        .map(word => {
            if (word.length === 0) return '';
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
