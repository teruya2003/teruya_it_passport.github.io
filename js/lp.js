(function() {
  'use strict';

  // ============================================
  // 設定
  // ============================================
  const LINE_LINK = "https://lin.ee/ag15BZe";

  // ============================================
  // 要素の取得
  // ============================================
  const btnHeroLine = document.getElementById('btn-hero-line');
  const btnHowtoLine = document.getElementById('btn-howto-line');
  const btnFinalLine = document.getElementById('btn-final-line');
  const btnStickyLine = document.getElementById('sticky-line');
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modal-close');
  const modalLineOpen = document.getElementById('modal-line-open');
  const copyBtn = document.getElementById('copy-link');
  const faqItems = document.querySelectorAll('.faq-item');

  // ============================================
  // ユーティリティ関数
  // ============================================
  function isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function trackEvent(eventName, data) {
    try {
      const events = JSON.parse(localStorage.getItem('lp_events') || '[]');
      events.push({
        event: eventName,
        data: data,
        timestamp: Date.now()
      });
      localStorage.setItem('lp_events', JSON.stringify(events));
    } catch(e) {
      console.warn('トラッキング保存に失敗しました');
    }
  }

  function openLineDirect() {
    trackEvent('line_click', { source: 'direct', isMobile: true });
    window.location.href = LINE_LINK;
  }

  function openModal(source) {
    trackEvent('line_click', { source: source, isMobile: false });
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // ============================================
  // LINE追加ボタンの処理
  // ============================================
  [btnHeroLine, btnHowtoLine, btnFinalLine, btnStickyLine].forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const source = this.id.replace('btn-', '').replace('-line', '');
      
      if (isMobile()) {
        openLineDirect();
      } else {
        openModal(source);
      }
    });
  });

  // ============================================
  // モーダルの処理
  // ============================================
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  if (modalLineOpen) {
    modalLineOpen.addEventListener('click', function(e) {
      e.preventDefault();
      trackEvent('line_modal_open', {});
      window.open(LINE_LINK, '_blank');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async function() {
      try {
        await navigator.clipboard.writeText(LINE_LINK);
        this.textContent = '✓ コピーしました';
        this.style.background = 'var(--primary)';
        this.style.color = '#ffffff';
        trackEvent('line_link_copied', {});
        
        setTimeout(() => {
          this.textContent = 'LINEリンクをコピー';
          this.style.background = '';
          this.style.color = '';
        }, 2000);
      } catch (err) {
        this.textContent = 'コピーに失敗';
        trackEvent('line_link_copy_failed', { error: err.message });
      }
    });
  }

  // ESCキーでモーダルを閉じる
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // ============================================
  // FAQアコーディオン
  // ============================================
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', function() {
      const isActive = item.classList.contains('active');
      
      // 他のFAQを閉じる
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });

      // クリックしたFAQを開閉
      item.classList.toggle('active', !isActive);
      
      trackEvent('faq_toggle', { 
        question: item.querySelector('.faq-q-text')?.textContent || '',
        isOpen: !isActive
      });
    });
  });

  // ============================================
  // スクロールアニメーション
  // ============================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // アニメーション対象要素を監視
  const animatedElements = document.querySelectorAll(
    '.hero-container, .bonus-card, .target-card, .content-card, .step-item, .faq-item'
  );
  
  animatedElements.forEach(el => {
    observer.observe(el);
  });

  // ============================================
  // Sticky CTAの表示制御
  // ============================================
  const stickyCTA = document.querySelector('.sticky-cta');
  const finalCTASection = document.querySelector('.final-cta-section');
  
  if (stickyCTA && finalCTASection) {
    const stickyObserver = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        // 最終CTAセクションが表示されている間はSticky CTAを非表示
        stickyCTA.style.display = entry.isIntersecting ? 'none' : 'block';
      });
    }, {
      threshold: 0.1
    });

    stickyObserver.observe(finalCTASection);
  }

  // ============================================
  // スクロール時のヘッダー処理（必要に応じて）
  // ============================================
  let lastScrollTop = 0;
  const scrollThreshold = 100;

  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > scrollThreshold && scrollTop > lastScrollTop) {
      // 下にスクロール中
      trackEvent('scroll_down', { position: scrollTop });
    }
    
    lastScrollTop = scrollTop;
  });

  // ============================================
  // ページ読み込み時の処理
  // ============================================
  window.addEventListener('load', function() {
    trackEvent('page_load', {
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height
    });

    // 画像の遅延読み込み完了を確認
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', function() {
          this.classList.add('loaded');
        });
      }
    });
  });

  // ============================================
  // パフォーマンス最適化: スムーススクロール
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        trackEvent('anchor_click', { target: href });
      }
    });
  });

  // ============================================
  // 合格実績ギャラリー（自動スクロール）
  // ============================================
  const resultsGallery1 = document.getElementById('resultsGallery1');
  const resultsGallery2 = document.getElementById('resultsGallery2');
  
  // 画像を複製して無限スクロールを実現
  function duplicateImages(gallery) {
    if (!gallery) return;
    
    const images = gallery.querySelectorAll('.result-image');
    const imageArray = Array.from(images);
    
    // 画像を複製して追加（無限スクロール用）
    imageArray.forEach(img => {
      const clone = img.cloneNode(true);
      gallery.appendChild(clone);
    });
  }
  
  if (resultsGallery1) {
    duplicateImages(resultsGallery1);
  }
  
  if (resultsGallery2) {
    duplicateImages(resultsGallery2);
  }
  
  // 画像読み込み完了時の処理
  document.querySelectorAll('.result-image').forEach(img => {
    img.addEventListener('load', function() {
      this.classList.add('loaded');
    });
    
    // 既に読み込まれている場合
    if (img.complete) {
      img.classList.add('loaded');
    }
    
    // エラーハンドリング
    img.addEventListener('error', function() {
      console.warn('画像の読み込みに失敗しました:', this.src);
    });
  });

  // ============================================
  // デバッグ用: トラッキングデータの確認
  // ============================================
  if (window.location.search.includes('debug=true')) {
    console.log('LP Events:', JSON.parse(localStorage.getItem('lp_events') || '[]'));
  }

})();
