/* Digital Lizard flat site: rewards, accordion, search, policies, menu (vanilla JS) */
(function () {
  var TOTALS = { s1: 30, s2: 10 };
  function keyFor(s) {
    return "ds-done-" + s;
  }
  function pageSeason() {
    return (document.body.dataset && document.body.dataset.season) || "s1";
  }
  function getDone(s) {
    s = s || pageSeason();
    try {
      return JSON.parse(localStorage.getItem(keyFor(s)) || "[]");
    } catch (e) {
      return [];
    }
  }
  function rank(n) {
    if (n >= 30) return "Master";
    if (n >= 15) return "Pro";
    if (n >= 5) return "Explorer";
    if (n >= 1) return "Curious";
    return "Starter";
  }
  function paint() {
    document.querySelectorAll("[data-progress]").forEach(function (el) {
      var s = el.getAttribute("data-season") || "s1";
      var done = getDone(s);
      var t = TOTALS[s] || 30;
      el.textContent = "★ " + done.length * 10 + " pts · " + done.length + "/" + t + " finished" + (s === "s1" ? " · rank: " + rank(done.length) : "");
    });
    document.querySelectorAll(".card").forEach(function (card) {
      var href = card.getAttribute("href") || "";
      var m = /day-(\d+)/.exec(href);
      var s = href.indexOf("/s2/") !== -1 ? "s2" : "s1";
      if (m && getDone(s).indexOf(parseInt(m[1], 10)) !== -1) card.classList.add("done");
    });
    var fb = document.getElementById("finish-btn");
    if (fb) {
      var s0 = pageSeason();
      var day = parseInt(fb.getAttribute("data-day"), 10);
      if (getDone(s0).indexOf(day) !== -1) {
        fb.disabled = true;
        fb.textContent = "Finished ✓ +10 pts collected";
        var rc = document.getElementById("related-card");
        if (rc) rc.hidden = false;
      }
    }
  }

  // finish button (episode pages)
  document.addEventListener("click", function (e) {
    var fb = e.target.closest("#finish-btn");
    if (fb && !fb.disabled) {
      var s1 = pageSeason();
      var day = parseInt(fb.getAttribute("data-day"), 10);
      var done = getDone(s1);
      if (done.indexOf(day) === -1) {
        done.push(day);
        try {
          localStorage.setItem(keyFor(s1), JSON.stringify(done));
        } catch (err) {}
        paint();
      }
      return;
    }
    // accordion
    var head = e.target.closest(".acc-head");
    if (head) {
      var item = head.parentElement;
      var wasOpen = item.classList.contains("open");
      document.querySelectorAll(".acc.open").forEach(function (o) {
        o.classList.remove("open");
        o.querySelector(".acc-head").setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        item.classList.add("open");
        head.setAttribute("aria-expanded", "true");
      }
      return;
    }
    // policy modal
    var pol = e.target.closest("[data-policy]");
    if (pol) {
      openPolicy(pol.getAttribute("data-policy"));
      return;
    }
    if (e.target.closest("[data-close-policy]")) {
      document.getElementById("policy-modal").hidden = true;
      return;
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var m = document.getElementById("policy-modal");
      if (m) m.hidden = true;
    }
  });

  // search filter (index episodes grid)
  var search = document.getElementById("search");
  if (search) {
    search.addEventListener("input", function () {
      var q = search.value.trim().toLowerCase();
      function matchCard(card) {
        var hit = !q || (card.getAttribute("data-title") || "").indexOf(q) !== -1;
        card.style.display = hit ? "" : "none";
        return hit;
      }
      document.querySelectorAll("#ep-groups .topic").forEach(function (topic) {
        var any = false;
        topic.querySelectorAll(".card").forEach(function (card) {
          if (matchCard(card)) any = true;
        });
        topic.style.display = any ? "" : "none";
      });
      // every flat cards section (s2, s3, ...): filter cards, hide section when empty
      document.querySelectorAll("section.episodes .cards[id$='-cards']").forEach(function (wrap) {
        var any = false;
        wrap.querySelectorAll(".card").forEach(function (card) {
          if (matchCard(card)) any = true;
        });
        var sec = wrap.closest("section");
        if (sec) sec.style.display = any || !q ? "" : "none";
      });
    });
    var sbtn = document.getElementById("search-btn");
    if (sbtn) sbtn.addEventListener("click", function () {
      document.getElementById("episodes").scrollIntoView({ behavior: "smooth" });
      setTimeout(function () { search.focus({ preventScroll: true }); }, 500);
    });
  }

  // mobile menu
  var menuBtn = document.getElementById("menu-btn");
  if (menuBtn) menuBtn.addEventListener("click", function () {
    document.getElementById("mnav").classList.toggle("open");
  });

  var POLICY_TEXTS = {
    privacy: ["Privacy Notice", "Digital Lizard runs fully in your browser. Progress and points live only in your device storage, nothing is sent to a server. The newsletter runs through Kit, please see their privacy notice for email handling."],
    terms: ["Terms of Service", "All episodes teach streaming technology in plain language for general education only. Content is written by Michelle for Digital Lizard, all rights reserved. Always check a provider's official terms and local rules before paying for any service."],
    cookies: ["Cookies Notice", "Digital Lizard sets no cookies itself. Your progress stays in local storage on your device, not in cookies. Embedded services such as the Kit newsletter form and Google Fonts may set their own cookies, please see their notices for details."],
    editorial: ["Editorial", "Written by Michelle to explain technology neutrally and point readers to legitimate services, never piracy. Fonts load from Google."]
  };
  function openPolicy(key) {
    var t = POLICY_TEXTS[key];
    if (!t) return;
    document.getElementById("policy-modal-title").textContent = t[0];
    document.getElementById("policy-modal-text").textContent = t[1];
    document.getElementById("policy-modal").hidden = false;
  }

  // reader: progress %, pages, idle fade, menu (episode pages)
  if (document.body.classList.contains("reader")) {
    var fill = document.getElementById("r-fill");
    var pct = document.getElementById("r-pct");
    var left = document.getElementById("r-left");
    var page = document.getElementById("r-page");
    var parts = Array.prototype.slice.call(document.querySelectorAll(".part"));
    var seenParts = {};
    function paintPage() {
      var ids = Object.keys(seenParts).map(Number);
      var cur = ids.length ? Math.max.apply(null, ids) + 1 : 1;
      page.textContent = "Page " + cur + " of " + parts.length;
    }
    if ("IntersectionObserver" in window && parts.length) {
      var pio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var idx = parts.indexOf(en.target);
          if (en.isIntersecting) seenParts[idx] = true;
          else delete seenParts[idx];
        });
        paintPage();
      }, { rootMargin: "-40% 0px -40% 0px" });
      parts.forEach(function (p) { pio.observe(p); });
      paintPage();
    }
    var idleTimer = null;
    function wake() {
      document.body.classList.remove("idle");
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () {
        document.body.classList.add("idle");
      }, 3000);
    }
    function onScroll() {
      var max = document.documentElement.scrollHeight - innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 1;
      var done = Math.round(p * 100);
      fill.style.width = done + "%";
      pct.textContent = done + "%";
      left.textContent = 100 - done + "%";
      wake();
    }
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    ["mousemove", "touchstart", "keydown"].forEach(function (ev) {
      addEventListener(ev, wake, { passive: true });
    });
    onScroll();
    wake();
    var menuBtn = document.getElementById("r-menu-btn");
    if (menuBtn) menuBtn.addEventListener("click", function (ev) {
      ev.stopPropagation();
      var m = document.getElementById("r-menu");
      m.hidden = !m.hidden;
    });
    document.addEventListener("click", function (ev) {
      var m = document.getElementById("r-menu");
      if (m && !m.hidden && !ev.target.closest(".r-menu-wrap")) m.hidden = true;
    });
    var topBtn = document.getElementById("r-top-btn");    if (topBtn) topBtn.addEventListener("click", function () {
      scrollTo({ top: 0, behavior: "smooth" });
      document.getElementById("r-menu").hidden = true;
    });
    var finMenu = document.getElementById("r-finish-menu");
    if (finMenu) finMenu.addEventListener("click", function () {
      document.getElementById("r-menu").hidden = true;
      var fb = document.getElementById("finish-btn");
      if (fb) fb.click();
    });
    // up-next button label + navigation (filled from data attributes)
    var rb = document.getElementById("related-btn");
    if (rb) {
      rb.textContent = rb.getAttribute("data-label") || "";
      rb.addEventListener("click", function () {
        var href = rb.getAttribute("data-href");
        if (href) location.href = href;
      });
    }
    // reader theme (Light/Dark)
    var themeBtn = document.getElementById("theme-btn");
    function setTheme(mode) {
      document.body.dataset.rtheme = mode;
      try { localStorage.setItem("ds-rtheme", mode); } catch (e) {}
      if (themeBtn) themeBtn.textContent = mode === "dark" ? "Dark" : "Light";
    }
    var savedTheme = "light";
    try { savedTheme = localStorage.getItem("ds-rtheme") || "light"; } catch (e) {}
    setTheme(savedTheme === "dark" ? "dark" : "light");
    if (themeBtn) themeBtn.addEventListener("click", function () {
      setTheme(document.body.dataset.rtheme === "dark" ? "light" : "dark");
    });
    // text size stepper: M -> L -> S -> M
    var fsBtn = document.getElementById("fs-btn");
    var fsOrder = ["m", "l", "s"];
    var fsLabel = { m: "M", l: "L", s: "S" };
    function setFs(v) {
      document.body.dataset.rfs = v;
      try { localStorage.setItem("ds-rfs", v); } catch (e) {}
      if (fsBtn) fsBtn.textContent = "Text size · " + fsLabel[v];
    }
    var savedFs = "m";
    try { savedFs = localStorage.getItem("ds-rfs") || "m"; } catch (e) {}
    if (fsOrder.indexOf(savedFs) === -1) savedFs = "m";
    setFs(savedFs);
    if (fsBtn) fsBtn.addEventListener("click", function () {
      var cur = document.body.dataset.rfs || "m";
      setFs(fsOrder[(fsOrder.indexOf(cur) + 1) % fsOrder.length]);
    });
  }


  // season circles: tap one, its episodes open below; tap again to collapse
  (function () {
    var map = { s1: "episodes", s2: "s2" };
    function openSeason(s) {
      ["s1", "s2"].forEach(function (k) {
        var sec = document.getElementById(map[k]);
        var btn = document.querySelector('.season-circle[data-season="' + k + '"]');
        if (k === s && sec.hidden) {
          sec.hidden = false;
          if (btn) {
            btn.classList.add("open");
            btn.setAttribute("aria-expanded", "true");
          }
          setTimeout(function () {
            sec.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 60);
        } else {
          sec.hidden = true;
          if (btn) {
            btn.classList.remove("open");
            btn.setAttribute("aria-expanded", "false");
          }
        }
      });
    }
    // delegated: React re-mounts the circles, direct listeners would die with the swap
    document.addEventListener("click", function (ev) {
      var btn = ev.target.closest ? ev.target.closest(".season-circle") : null;
      if (!btn) return;
      var sec = document.getElementById(map[btn.getAttribute("data-season")]);
      if (sec && !sec.hidden) {
        sec.hidden = true;
        btn.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      } else {
        openSeason(btn.getAttribute("data-season"));
      }
    });
    document.querySelectorAll("[data-open-season]").forEach(function (a) {
      a.addEventListener("click", function () {
        var s = a.getAttribute("data-open-season");
        var sec = document.getElementById(map[s]);
        if (sec && sec.hidden) openSeason(s);
        else if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  })();

  // scroll reveals: same broadcast easing as the kinetic island
  (function () {
    var els = document.querySelectorAll(".rv,.card,.acc");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    els.forEach(function (el) {
      el.classList.add("rv");
      var sibs = Array.prototype.slice.call(el.parentNode.children);
      el.style.transitionDelay = ((sibs.indexOf(el) % 6) * 60) + "ms";
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  })();

  function init() {
    paint();
    // returning from an episode (Back links carry #episodes / #s2): reopen that list
    var h = location.hash;
    var target = h === "#s2" ? "s2" : h === "#episodes" ? "s1" : null;
    if (target) {
      var map = { s1: "episodes", s2: "s2" };
      var sec = document.getElementById(map[target]);
      var btn = document.querySelector('.season-circle[data-season="' + target + '"]');
      if (sec && sec.hidden) {
        sec.hidden = false;
        if (btn) {
          btn.classList.add("open");
          btn.setAttribute("aria-expanded", "true");
        }
        setTimeout(function () {
          sec.scrollIntoView({ block: "start" });
        }, 120);
      }
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
