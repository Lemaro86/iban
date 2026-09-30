/* При наведении на карточку прячем картинку и запускаем видео,
   при уходе курсора — ставим видео на паузу и возвращаем картинку.
   Карточки без <video> пропускаются. */
(function () {
    const selectors = [".picture-box-3", ".item-mobile-1", ".item-mobile-3"];

    selectors.forEach((selector) => {
        const box = document.querySelector(selector);
        if (!box) return;

        const video = box.querySelector("video");
        const picture = box.querySelector("img") || box.querySelector(".item-mobile-picture");
        if (!video || !picture) return;

        video.style.visibility = "hidden";

        box.addEventListener("pointerenter", () => {
            picture.style.visibility = "hidden";
            video.style.visibility = "unset";
            video.play();
        });

        box.addEventListener("pointerleave", () => {
            picture.style.visibility = "unset";
            video.style.visibility = "hidden";
            video.pause();
        });
    });
})();
