/* Static port of the /ycode page interactivity.
   Replaces the React state in app/ycode/page.tsx and components/ycode-nav.tsx:
   1. Nav compacts (shorter, blurred, bordered) after scrolling 40px.
   2. OS tabs swap the install command with a retype animation.
   3. Copy button writes the command to the clipboard and flips to a check icon for 2s. */
(function () {
  "use strict";

  var FG = "#e8e6e0";
  var ACCENT = "#ef8445";

  /* ---------- 1. Nav scroll state ---------- */

  var nav = document.getElementById("ycode-nav");

  function onScroll() {
    var scrolled = window.scrollY > 40;
    nav.style.height = scrolled ? "52px" : "64px";
    nav.style.borderBottom = scrolled
      ? "1px solid rgba(232,230,224,0.07)"
      : "1px solid transparent";
    nav.style.backdropFilter = scrolled ? "blur(10px)" : "none";
    nav.style.webkitBackdropFilter = scrolled ? "blur(10px)" : "none";
    nav.style.background = scrolled ? "rgba(9,29,30,0.88)" : "transparent";
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 2. Install command OS tabs ---------- */

  var INSTALL_CMDS = {
    windows: { prompt: "PS C:\\>", cmd: "winget install oxalabs.ycode" },
    macos: { prompt: "~ %", cmd: "brew install oxalabs/tap/ycode" },
    linux: { prompt: "~ $", cmd: "curl -fsSL oxalabs.sh | sh" }
  };

  var TAB_ACTIVE = {
    color: "#ffffff",
    opacity: "1",
    background: "#000000",
    border: "1px solid " + FG + "40",
    borderBottom: "1px solid #000000"
  };
  var TAB_INACTIVE = {
    color: FG,
    opacity: "0.4",
    background: "transparent",
    border: "1px solid " + FG + "15",
    borderBottom: "1px solid " + FG + "15"
  };

  var tabButtons = Array.prototype.slice.call(
    document.querySelectorAll(".os-tab-btn")
  );
  var promptEl = document.getElementById("install-prompt");
  var cmdEl = document.getElementById("install-cmd");
  var currentOs = "windows";

  function setTabStyle(btn, styles) {
    btn.style.color = styles.color;
    btn.style.opacity = styles.opacity;
    btn.style.background = styles.background;
    btn.style.border = styles.border;
    btn.style.borderBottom = styles.borderBottom;
  }

  function selectOs(id) {
    var entry = INSTALL_CMDS[id];
    if (!entry) return;
    currentOs = id;

    tabButtons.forEach(function (btn) {
      setTabStyle(btn, btn.getAttribute("data-os") === id ? TAB_ACTIVE : TAB_INACTIVE);
    });

    promptEl.textContent = entry.prompt;
    cmdEl.textContent = entry.cmd;

    // Restart the retype animation (React did this by remounting via key change)
    cmdEl.classList.remove("install-cmd");
    void cmdEl.offsetWidth; // force reflow
    cmdEl.classList.add("install-cmd");
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      selectOs(btn.getAttribute("data-os"));
    });
  });

  /* ---------- 3. Copy button ---------- */

  var copyBtn = document.getElementById("copy-btn");
  var iconCopy = document.getElementById("copy-icon-copy");
  var iconCheck = document.getElementById("copy-icon-check");
  var copyTimer = null;

  function setCopied(state) {
    copyBtn.style.color = state ? ACCENT : FG;
    copyBtn.style.background = state ? ACCENT + "12" : FG + "10";
    copyBtn.style.border = "1px solid " + (state ? ACCENT + "50" : FG + "30");
    copyBtn.setAttribute("aria-label", state ? "Copied" : "Copy install command");

    var incoming = state ? iconCheck : iconCopy;
    var outgoing = state ? iconCopy : iconCheck;
    outgoing.style.display = "none";
    incoming.style.display = "block";
    // Replay the icon pop animation (React remounted the svg)
    incoming.style.animation = "none";
    void incoming.offsetWidth; // force reflow
    incoming.style.animation = "";
  }

  copyBtn.addEventListener("click", function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(INSTALL_CMDS[currentOs].cmd);
    }
    setCopied(true);
    clearTimeout(copyTimer);
    copyTimer = setTimeout(function () {
      setCopied(false);
    }, 2000);
  });
})();
