// Main functionality for InstaMax Landing Page - Multi-Product Support
interface NavData { logo: string; buttonText: string; }
interface HeroData { badge: string; title: string; description: string; primaryButton: string; secondaryButton: string; trust: { safe: string; fast: string; }; }
interface FeatureItem { icon: string; title: string; description: string; color: string; bgColor: string; }
interface FeaturesData { title: string; subtitle: string; items: FeatureItem[]; }
interface InstallStep { icon: string; title: string; description: string; }
interface InstallData { title: string; subtitle: string; steps: InstallStep[]; }
interface FAQItem { question: string; answer: string; }
interface FAQData { title: string; subtitle: string; items: FAQItem[]; }
interface FooterData { brand: string; subtitle: string; disclaimer: string; socials: { icon: string; href: string; }[]; copyright: string; }
interface VersionInfo { label: string; link: string; filename: string; size: string; }
interface ProductInfo { name: string; desc: string; link?: string; filename?: string; size?: string; versions?: VersionInfo[]; }
interface DownloadData {
    adLink: string;
    products: { [key: string]: ProductInfo };
    modal: { title: string; desc: string; hint: string; };
}

let downloadData: DownloadData;
let selectedLink = "";

document.addEventListener('DOMContentLoaded', async () => {
    await loadStrings();
    initScrollProgress();
    initDownloadLogic();
    initFAQ();
    initScrollAnimations();
    initSmoothScroll();
    // @ts-ignore
    if (window.lucide) window.lucide.createIcons();
});

async function loadStrings() {
    try {
        const [nav, hero, features, install, faq, footer, download] = await Promise.all([
            fetch('/strings/nav.json').then(r => r.json()),
            fetch('/strings/hero.json').then(r => r.json()),
            fetch('/strings/features.json').then(r => r.json()),
            fetch('/strings/install.json').then(r => r.json()),
            fetch('/strings/faq.json').then(r => r.json()),
            fetch('/strings/footer.json').then(r => r.json()),
            fetch('/strings/download.json').then(r => r.json())
        ]);

        downloadData = download;
        injectNav(nav);
        injectHero(hero);
        injectFeatures(features);
        injectInstall(install);
        injectFAQ(faq);
        injectFooter(footer);
        injectModal(download);
    } catch (error) {
        console.error("Error loading strings:", error);
    }
}

function injectNav(data: NavData) {
    setText('nav-logo', data.logo);
    setText('nav-download-btn', data.buttonText);
}

function injectHero(data: HeroData) {
    const badge = document.getElementById('hero-badge');
    if (badge) badge.innerHTML = `<i data-lucide="star" class="w-3 h-3 mr-2 fill-current"></i><span>${data.badge}</span>`;
    setText('hero-title', data.title, true);
    setText('hero-desc', data.description);
    setText('hero-primary-btn', `<i data-lucide="download" class="w-5 h-5 mr-2"></i> ${data.primaryButton}`, true);
    setText('learn-more', data.secondaryButton);
    setText('trust-safe', data.trust.safe);
    setText('trust-fast', data.trust.fast);
}

function injectFeatures(data: FeaturesData) {
    setText('features-title', data.title, true);
    setText('features-subtitle', data.subtitle);
    const container = document.getElementById('features-container');
    if (container) {
        container.innerHTML = data.items.map((item, index) => `
            <div class="feature-card animate-up" style="transition-delay: ${index * 0.1}s">
                <div class="icon-box ${item.bgColor}">
                    <i data-lucide="${item.icon}" class="${item.color}"></i>
                </div>
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            </div>
        `).join('');
    }
}

function injectInstall(data: InstallData) {
    setText('install-title', data.title, true);
    setText('install-subtitle', data.subtitle);
    const container = document.getElementById('install-container');
    if (container) {
        container.innerHTML = data.steps.map((step, index) => `
            <div class="install-card animate-up" style="transition-delay: ${index * 0.2}s">
                <div class="step-icon-wrapper">
                    <i data-lucide="${step.icon}"></i>
                </div>
                <h3>${step.title}</h3>
                <p>${step.description}</p>
            </div>
        `).join('');
    }
}

function injectFAQ(data: FAQData) {
    setText('faq-title', data.title, true);
    setText('faq-subtitle', data.subtitle);
    const container = document.getElementById('faq-container');
    if (container) {
        container.innerHTML = data.items.map(item => `
            <div class="faq-item">
                <button class="faq-toggle">
                    <span>${item.question}</span>
                    <i data-lucide="chevron-down"></i>
                </button>
                <div class="faq-content">
                    <p>${item.answer}</p>
                </div>
            </div>
        `).join('');
    }
}

function injectFooter(data: FooterData) {
    setText('footer-brand', data.brand);
    setText('footer-subtitle', data.subtitle);
    setText('footer-copy', data.copyright);
    setText('footer-disclaimer', data.disclaimer);
    const socialsDiv = document.getElementById('footer-socials');
    if (socialsDiv) {
        socialsDiv.innerHTML = data.socials.map(s => `
            <a href="${s.href}" class="social-link" title="Follow us">
                <i data-lucide="${s.icon}" class="lucide-${s.icon}"></i>
            </a>
        `).join('');
    }
}

function injectModal(data: DownloadData) {
    setText('modal-title-select', data.modal.title);
    setText('modal-desc-select', data.modal.desc);
    setText('modal-hint', data.modal.hint);
}

function setText(id: string, text: string, isHtml = false) {
    const el = document.getElementById(id);
    if (el) { el[isHtml ? 'innerHTML' : 'textContent'] = text; }
}

function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (progressBar) progressBar.style.width = scrolled + "%";
    });
}

function initDownloadLogic() {
    const triggers = document.querySelectorAll('.download-trigger');
    const modal = document.getElementById('download-modal');
    const initialContent = document.getElementById('modal-initial-content');
    const selectionContent = document.getElementById('modal-selection-content');
    const countdownContent = document.getElementById('modal-countdown-content');
    const productBtns = document.querySelectorAll('.product-btn');
    const versionSelector = document.getElementById('version-selector');
    const versionsContainer = document.getElementById('versions-container');
    const backBtn = document.getElementById('back-to-products');
    const startBtn = document.getElementById('start-step-download');

    triggers.forEach(btn => {
        btn.addEventListener('click', () => {
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                resetModal();
            }
        });
    });

    function resetModal() {
        if (selectionContent) selectionContent.style.display = 'block';
        if (initialContent) initialContent.style.display = 'none';
        if (countdownContent) countdownContent.style.display = 'none';
        if (versionSelector) versionSelector.style.display = 'none';

        // Show product selection elements
        const title = document.getElementById('modal-title-select');
        const desc = document.getElementById('modal-desc-select');
        const selector = document.querySelector('.product-selector') as HTMLElement;
        if (title) title.style.display = 'block';
        if (desc) desc.style.display = 'block';
        if (selector) selector.style.display = 'flex';
    }

    productBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const productKey = (btn as HTMLElement).dataset.product;
            if (!productKey || !downloadData.products[productKey]) return;
            const product = downloadData.products[productKey];

            if (product.versions) {
                // Hide product selection elements
                const title = document.getElementById('modal-title-select');
                const desc = document.getElementById('modal-desc-select');
                const selector = document.querySelector('.product-selector') as HTMLElement;
                if (title) title.style.display = 'none';
                if (desc) desc.style.display = 'none';
                if (selector) selector.style.display = 'none';

                // Update title with product name
                const vTitle = document.getElementById('versions-title');
                if (vTitle) vTitle.innerHTML = `Available versions of <span>${product.name}</span>`;

                if (versionsContainer) {
                    versionsContainer.innerHTML = product.versions.map(v => `
                        <button class="btn btn-block version-btn" 
                                data-link="${v.link}" data-file="${v.filename}" data-size="${v.size}" data-name="${product.name}">
                            <div class="btn-icon">
                                <i data-lucide="download-cloud" class="w-5 h-5"></i>
                            </div>
                            <div class="flex flex-col items-start">
                                <span class="text-white font-semibold">${v.label}</span>
                                <span class="text-xs text-white/40">${v.size} • Safe & Secure</span>
                            </div>
                            <i data-lucide="chevron-right" class="ml-auto w-4 h-4 text-white/20"></i>
                        </button>
                    `).join('');

                    // Re-run lucide icons for the new elements
                    // @ts-ignore
                    if (window.lucide) window.lucide.createIcons();

                    versionsContainer.querySelectorAll('.version-btn').forEach(vBtn => {
                        vBtn.addEventListener('click', (e) => {
                            const target = e.currentTarget as HTMLElement;
                            showFinalStep(target.dataset.name || "", target.dataset.file || "", target.dataset.size || "", target.dataset.link || "");
                        });
                    });
                }
                if (versionSelector) versionSelector.style.display = 'block';
            } else if (product.link) {
                showFinalStep(product.name, product.filename || "", product.size || "", product.link);
            }
        });
    });

    backBtn?.addEventListener('click', () => {
        resetModal();
    });

    function showFinalStep(name: string, file: string, size: string, link: string) {
        if (selectionContent) selectionContent.style.display = 'none';
        if (initialContent) initialContent.style.display = 'block';
        setText('modal-title', name);
        setText('modal-filename', file);
        setText('modal-filesize', size);
        setText('start-step-download', "Start Download");
        selectedLink = link;
    }

    startBtn?.addEventListener('click', () => {
        if (downloadData) window.open(downloadData.adLink, '_blank');
        if (initialContent) initialContent.style.display = 'none';
        if (countdownContent) countdownContent.style.display = 'block';
        let count = 5;
        const timerText = document.getElementById('countdown-timer');
        if (timerText) timerText.textContent = count.toString();
        const interval = setInterval(() => {
            count--;
            if (timerText) timerText.textContent = count.toString();
            if (count === 0) {
                clearInterval(interval);
                window.location.href = selectedLink;
                setTimeout(closeModal, 1500);
            }
        }, 1000);
    });

    function closeModal() {
        if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
    }
    document.querySelector('.modal-close')?.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
}

function initFAQ() {
    const container = document.getElementById('faq-container');
    container?.addEventListener('click', (e) => {
        const toggle = (e.target as HTMLElement).closest('.faq-toggle');
        if (!toggle) return;
        const item = toggle.closest('.faq-item');
        if (!item) return;
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(other => other.classList.remove('active'));
        if (!isActive) item.classList.add('active');
    });
}
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    const watch = () => { document.querySelectorAll('.animate-up:not(.visible)').forEach(el => observer.observe(el)); };
    watch();
    setTimeout(watch, 1000);
}
function initSmoothScroll() {
    document.getElementById('learn-more')?.addEventListener('click', () => {
        document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
    });
}
