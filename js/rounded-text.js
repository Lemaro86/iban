(function () {
    function initRoundedText(el) {
        var text = el.textContent.trim();
        if (!text) return;

        var chars = Array.from(text);
        var angleStep = 360 / chars.length;

        el.textContent = "";
        el.setAttribute("aria-label", text);

        chars.forEach(function (char, i) {
            var span = document.createElement("span");
            span.textContent = char === " " ? " " : char;
            span.style.setProperty("--angle", angleStep * i);
            el.appendChild(span);
        });
    }

    function initRoundedText2(el) {
        var text = el.textContent.trim();
        if (!text) return;

        var chars = Array.from(text);
        var angleStep = 360 / chars.length;

        el.textContent = "";
        el.setAttribute("aria-label", text);

        chars.forEach(function (char, i) {
            var span = document.createElement("span");
            span.textContent = char === " " ? " " : char;
            span.style.setProperty("--angle", angleStep * i);
            el.appendChild(span);
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll(".rounded_text").forEach(initRoundedText);
    });

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll(".rounded_text2").forEach(initRoundedText2);
    });


})();
