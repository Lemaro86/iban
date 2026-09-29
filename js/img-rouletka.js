// Слайдшоу фото по наведению (.img-rouletka), перенесено из script.js (index.html).
(function initImgRouletka() {
    const roulettes = document.querySelectorAll('.img-rouletka');
    const STEP_MS = 300;

    roulettes.forEach((el) => {
        const items = el.querySelectorAll('img, video');
        if (!items.length) return;

        const video = el.querySelector('video');
        let index = 0;
        let timer = null;

        const show = (i) => {
            items.forEach((item, idx) => item.classList.toggle('is-active', idx === i));
        };

        // Переключение мгновенное (без фейда). Когда очередь доходит до видео
        // (последний элемент, если оно есть) — слайдшоу ставится на паузу,
        // видео проигрывается один раз, а после его окончания цикл идёт с начала.
        const next = () => {
            index++;
            if (video && index === items.length - 1) {
                clearInterval(timer);
                timer = null;
                show(index);
                video.currentTime = 0;
                video.play();
                return;
            }
            if (index >= items.length) index = 0;
            show(index);
        };

        const start = () => {
            if (timer) return;
            timer = setInterval(next, STEP_MS);
        };

        const stop = () => {
            clearInterval(timer);
            timer = null;
            index = 0;
            show(0);
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
        };

        if (video) {
            video.addEventListener('ended', () => {
                index = 0;
                show(0);
                start();
            });
        }

        el.addEventListener('mouseenter', start);
        el.addEventListener('mouseleave', stop);
    });
})();
