/* ==========================================================================
   IAN & KLARISSE WEDDING WEBSITE
   Custom JavaScript: Countdown Timer + RSVP Form Handling
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ------------------------------------------------------------------------
     1. COUNTDOWN TIMER
     Counts down to the wedding date below.
     EDIT THIS DATE to match your actual wedding date/time.
  ------------------------------------------------------------------------ */
  const WEDDING_DATE = new Date('December 27, 2026 00:00:00').getTime();

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = WEDDING_DATE - now;

    if (distance < 0) {
      // Wedding day has arrived / passed
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      clearInterval(countdownInterval);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  // Run immediately, then update every second
  updateCountdown();
  const countdownInterval = setInterval(updateCountdown, 1000);


  /* ------------------------------------------------------------------------
     2. RSVP FORM HANDLING
     Basic client-side validation + success message.
     Replace the "TODO" section below with your own backend / Google Form /
     Formspree / EmailJS integration to actually receive submissions.
  ------------------------------------------------------------------------ */
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpSuccessMsg = document.getElementById('rsvpSuccessMsg');

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Use Bootstrap's built-in validation styling
      if (!rsvpForm.checkValidity()) {
        e.stopPropagation();
        rsvpForm.classList.add('was-validated');
        return;
      }

      // Collect form data
      const formData = new FormData(rsvpForm);
      const data = Object.fromEntries(formData.entries());

      // TODO: Send `data` to your backend, Google Form, Formspree, EmailJS, etc.
      // Example (Formspree):
      // fetch('https://formspree.io/f/your-form-id', {
      //   method: 'POST',
      //   headers: { 'Accept': 'application/json' },
      //   body: formData
      // });
      console.log('RSVP submitted:', data);

      // Show success message and reset form
      rsvpForm.reset();
      rsvpForm.classList.remove('was-validated');
      rsvpSuccessMsg.classList.remove('d-none');

      // Hide success message again after a few seconds (optional)
      setTimeout(() => {
        rsvpSuccessMsg.classList.add('d-none');
      }, 6000);
    });
  }


  /* ------------------------------------------------------------------------
     3. SMOOTH SCROLL FOR "SAVE YOUR SEAT" / ANCHOR LINKS
     (Bootstrap/CSS scroll-behavior already handles most of this,
      this is a fallback for older browsers.)
  ------------------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

});

// Justified Gallery + Lightbox
(function () {
  const gallery = document.getElementById('imageGallery');
  if (!gallery) return; // safety check in case this page doesn't have the gallery

  const imgs = Array.from(gallery.querySelectorAll('img'));

  function getTargetRowHeight() {
  const width = window.innerWidth;
  if (width <= 480) return 110;   // small phones
  if (width <= 768) return 150;   // tablets
  return 300;                     // desktop
  }
  const MARGIN = 4;

  function buildJustifiedGallery() {
    const containerWidth = gallery.clientWidth;
    const TARGET_ROW_HEIGHT = getTargetRowHeight(); // ← use the function here
    const ready = imgs.every(img => img.naturalWidth > 0);
    if (!ready) return;

    gallery.innerHTML = '';
    let row = [];
    let rowAspectSum = 0;

    imgs.forEach((img, i) => {
      const aspect = img.naturalWidth / img.naturalHeight;
      row.push({ img, aspect });
      rowAspectSum += aspect;

      const estWidth = rowAspectSum * TARGET_ROW_HEIGHT + (row.length - 1) * MARGIN;
      const isLast = i === imgs.length - 1;

      if (estWidth >= containerWidth || isLast) {
        const availableWidth = containerWidth - (row.length - 1) * MARGIN;
        let rowHeight = availableWidth / rowAspectSum;

        if (isLast && rowHeight > TARGET_ROW_HEIGHT * 1.5) {
          rowHeight = TARGET_ROW_HEIGHT;
        }

        const rowDiv = document.createElement('div');
        rowDiv.className = 'gallery-row';

        row.forEach(item => {
          item.img.style.height = rowHeight + 'px';
          item.img.style.width = (item.aspect * rowHeight) + 'px';
          rowDiv.appendChild(item.img);
        });

        gallery.appendChild(rowDiv);
        row = [];
        rowAspectSum = 0;
      }
    });
  }

  let loadedCount = 0;
  imgs.forEach(img => {
    if (img.complete) {
      loadedCount++;
    } else {
      img.addEventListener('load', () => {
        loadedCount++;
        if (loadedCount === imgs.length) buildJustifiedGallery();
      });
      img.addEventListener('error', () => {
        loadedCount++;
        if (loadedCount === imgs.length) buildJustifiedGallery();
      });
    }
  });
  if (loadedCount === imgs.length) buildJustifiedGallery();

  window.addEventListener('resize', () => {
    clearTimeout(window._galleryResizeTimer);
    window._galleryResizeTimer = setTimeout(buildJustifiedGallery, 150);
  });

  // ---- Lightbox ----
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = imgs[currentIndex].src;
    lightbox.classList.add('active');
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + imgs.length) % imgs.length;
    lightboxImg.src = imgs[currentIndex].src;
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % imgs.length;
    lightboxImg.src = imgs[currentIndex].src;
  }

  gallery.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
      const index = imgs.indexOf(e.target);
      openLightbox(index);
    }
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });
})();
