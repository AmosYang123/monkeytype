// Applies the last theme/font before first paint so a non-default theme doesn't flash serika dark.
// ConfigProvider keeps localStorage "themeBoot" in sync: { colors: {"--bg-color": "#...", ...}, font: "Roboto Mono" }.
(function () {
  try {
    var raw = localStorage.getItem("themeBoot");
    if (!raw) return;
    var boot = JSON.parse(raw);
    var root = document.documentElement;
    if (boot && boot.colors) {
      for (var k in boot.colors) {
        if (/^--[a-z-]+-color$/.test(k) && /^#[0-9a-fA-F]{3,8}$/.test(boot.colors[k])) root.style.setProperty(k, boot.colors[k]);
      }
    }
    if (boot && typeof boot.font === "string" && /^[\w ]+$/.test(boot.font)) {
      root.style.setProperty("--font", '"' + boot.font + '", "Roboto Mono", monospace');
    }
  } catch (e) {
    // storage blocked or corrupt: default theme
  }
})();
