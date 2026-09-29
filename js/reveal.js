// Плавное появление элементов, оставшихся со style="opacity:0"
// (раньше это делал Webflow IX2, но страница экспортирована без его конфига).
(() => {
    // Подстрока "opacity:0" не ищем — GSAP Draggable переписывает атрибут style
    // и браузер переформатирует его в "opacity: 0" (с пробелом), substring-селектор перестаёт совпадать.
    const candidates = document.querySelectorAll('[style*="opacity"]');
    const elements = [];
    candidates.forEach((el) => {
        if (el.style.opacity !== '0') return;
        if (el.closest('.sticker-wrapper') || el.closest('.box-5')) {
            el.style.opacity = '1';
        } else {
            elements.push(el);
        }
    });
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
        elements.forEach((el) => {
            el.style.opacity = '1';
        });
        return;
    }

    elements.forEach((el) => {
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        el.style.transform = 'translateY(16px)';
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px'
    });

    elements.forEach((el) => observer.observe(el));
})();
