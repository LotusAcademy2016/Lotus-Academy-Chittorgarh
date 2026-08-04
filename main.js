// Lotus Academy — shared behaviour
document.addEventListener('DOMContentLoaded', function () {

  // build the marigold toran garland (repeats to fill width, doubled for seamless drift)
  document.querySelectorAll('.toran').forEach(function (t) {
    var row = document.createElement('div');
    row.className = 'toran-row';
    var unitsHtml = '';
    for (var i = 0; i < 40; i++) {
      unitsHtml += '<span class="toran-unit"><span class="string"></span><span class="bloom"></span><span class="leaf"></span></span>';
    }
    row.innerHTML = unitsHtml + unitsHtml; // doubled for the seamless drift loop
    t.appendChild(row);
  });

  // mobile nav toggle
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  // scroll-reveal
  var revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // animated stat counters
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var done = false;
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !done) {
          done = true;
          var start = null, duration = 1200;
          function step(ts) {
            if (!start) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target + suffix;
          }
          requestAnimationFrame(step);
          io2.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    io2.observe(el);
  });

  // lightbox for gallery photos
  var lightbox = document.getElementById('lightbox');
  if (lightbox) {
    var lbImg = lightbox.querySelector('img');
    document.querySelectorAll('.photo-grid button[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        lbImg.src = btn.getAttribute('data-full');
        lbImg.alt = btn.getAttribute('data-alt') || '';
        lightbox.classList.add('open');
      });
    });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
        lightbox.classList.remove('open');
        lbImg.src = '';
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { lightbox.classList.remove('open'); lbImg.src = ''; }
    });
  }

  // gallery filter buttons
  var filterBar = document.querySelector('.filters');
  if (filterBar) {
    var buttons = filterBar.querySelectorAll('.filter-btn');
    var albums = document.querySelectorAll('.album');
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        buttons.forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        var target = b.getAttribute('data-filter');
        albums.forEach(function (al) {
          if (target === 'all' || al.getAttribute('data-cat') === target) {
            al.style.display = '';
          } else {
            al.style.display = 'none';
          }
        });
      });
    });
  }
});
