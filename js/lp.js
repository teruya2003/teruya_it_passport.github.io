(function(){
  const LINE_LINK = "https://line.me/R/ti/p/%40yourlineid"; // <-- 実際のLINEリンクに差し替えてください
  const btnLine = document.getElementById('btn-line');
  const stickyLine = document.getElementById('sticky-line');
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modal-close');
  const modalLineOpen = document.getElementById('modal-line-open');
  const copyBtn = document.getElementById('copy-link');
  const downloadBtn = document.getElementById('btn-download');

  function isMobile(){
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function openLineDirect(){
    window.location.href = LINE_LINK;
  }

  function openModal(){
    if (!modal) return;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden','true');
  }

  [btnLine, stickyLine].forEach(b => {
    b && b.addEventListener('click', (e) => {
      if (isMobile()) {
        openLineDirect();
      } else {
        openModal();
      }
    });
  });

  modalClose && modalClose.addEventListener('click', closeModal);
  modal && modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  modalLineOpen && modalLineOpen.addEventListener('click', (e) => {
    modalLineOpen.href = LINE_LINK;
    window.open(LINE_LINK, '_blank');
  });

  copyBtn && copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(LINE_LINK);
      copyBtn.textContent = 'コピーしました';
      setTimeout(()=> copyBtn.textContent = 'LINEリンクをコピー', 2000);
    } catch (err) {
      copyBtn.textContent = 'コピーに失敗';
    }
  });

  downloadBtn && downloadBtn.addEventListener('click', () => {
    try { localStorage.setItem('lp_free_text_downloaded','1'); } catch(e){}
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('inview');
        io.unobserve(en.target);
      }
    });
  }, {threshold: 0.12});
  document.querySelectorAll('.will-inview').forEach(el => io.observe(el));

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  try {
    if (localStorage.getItem('lp_line_added') === '1') {
      btnLine && (btnLine.textContent = 'LINEに追加済み（感謝）');
      stickyLine && (stickyLine.textContent = '追加済み');
    }
  } catch(e){}
})();