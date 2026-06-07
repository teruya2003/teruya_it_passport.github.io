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

  const btnIntroLine = document.getElementById('btn-intro-line');
  
  // ============================================
  // LINE追加ボタンの処理
  // ============================================
  [btnHeroLine, btnHowtoLine, btnFinalLine, btnStickyLine, btnIntroLine].forEach(btn => {
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
  // スクロールダウン誘導
  // ============================================
  const scrollDownIndicator = document.querySelector('.scroll-down-indicator');
  const painSection = document.querySelector('.pain-section');
  
  if (scrollDownIndicator && painSection) {
    // 初期状態で確実に表示
    scrollDownIndicator.classList.remove('hidden');
    scrollDownIndicator.style.display = 'flex';
    scrollDownIndicator.style.opacity = '1';
    
    // クリックで次のセクションにスクロール
    scrollDownIndicator.addEventListener('click', function() {
      painSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    // スクロールしたら表示を非表示にする（遅延を追加）
    let hasScrolled = false;
    window.addEventListener('scroll', function() {
      if (!hasScrolled && window.scrollY > 100) {
        hasScrolled = true;
        setTimeout(() => {
          scrollDownIndicator.classList.add('hidden');
        }, 500);
      }
    }, { passive: true });
  }

  // ============================================
  // スクロールアニメーション
  // ============================================
  const observerOptions = {
    threshold: 0.05,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // requestAnimationFrameを使ってスムーズにアニメーションを開始
        requestAnimationFrame(() => {
          // stats-sectionの場合はinviewクラスを追加
          if (entry.target.classList.contains('stats-section')) {
            entry.target.classList.add('inview');
          } else {
            entry.target.classList.add('fade-in-up');
          }
        });
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // アニメーション対象要素を監視
  const animatedElements = document.querySelectorAll(
    '.will-inview, .content-card, .step-item, .faq-item, .stats-section, .pain-item, .text-offer-content, .intro-content, .story-item'
  );
  
  animatedElements.forEach(el => {
    observer.observe(el);
  });

  // フックコピーのアニメーション制御
  const hookCopyBlock = document.querySelector('.hook-copy-block');
  const hookCopyLine1 = document.querySelector('.hook-copy-line1');
  const hookCopyLine2 = document.querySelector('.hook-copy-line2');
  
  if (hookCopyBlock && hookCopyLine1 && hookCopyLine2) {
    const hookObserver = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            hookCopyLine1.classList.add('animate-slide-in-left');
            hookCopyLine2.classList.add('animate-slide-in-right');
          });
          hookObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px -50px 0px'
    });

    hookObserver.observe(hookCopyBlock);
  }

  // サポート実績アイテムのアニメーション制御
  const supportAchievementItems = document.querySelectorAll('.support-achievement-item');
  const supportAchievementsSection = document.querySelector('.support-achievements-section');
  
  if (supportAchievementItems.length > 0 && supportAchievementsSection) {
    const achievementObserver = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          supportAchievementItems.forEach((item, index) => {
            requestAnimationFrame(() => {
              item.classList.add('animate-slide-in');
            });
          });
          achievementObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px'
    });

    achievementObserver.observe(supportAchievementsSection);
  }

  // ============================================
  // Sticky CTAの表示制御
  // ============================================
  const stickyCTA = document.querySelector('.sticky-cta');
  const storySection = document.querySelector('.story-section');
  const finalCTASection = document.querySelector('.final-cta-section');
  
  if (stickyCTA) {
    let hasShownSticky = false;
    
    // final-cta-sectionが表示されているかチェックする関数
    function checkFinalCTAVisible() {
      if (!finalCTASection) return false;
      const rect = finalCTASection.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    }
    
    // Sticky CTAの表示/非表示を更新する関数
    function updateStickyCTA() {
      if (!hasShownSticky) return;
      if (checkFinalCTAVisible()) {
        stickyCTA.classList.remove('visible');
      } else {
        stickyCTA.classList.add('visible');
      }
    }
    
    // ストーリーセクションの監視
    if (storySection) {
      const storyObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
          // ストーリーセクションが表示されたら、sticky CTAを表示開始
          if (entry.isIntersecting && !hasShownSticky) {
            hasShownSticky = true;
            updateStickyCTA();
          }
          // ストーリーセクションを通過した後も表示を維持
          if (!entry.isIntersecting && hasShownSticky) {
            updateStickyCTA();
          }
        });
      }, {
        threshold: 0.01,
        rootMargin: '0px'
      });

      storyObserver.observe(storySection);
    } else {
      // ストーリーセクションが見つからない場合は、スクロール量で判定
      let scrollCheckDone = false;
      window.addEventListener('scroll', function() {
        if (scrollCheckDone || hasShownSticky) return;
        if (window.scrollY > 1000) {
          hasShownSticky = true;
          scrollCheckDone = true;
          updateStickyCTA();
        }
      }, { passive: true });
    }
    
    // 最終CTAセクションの監視
    if (finalCTASection) {
      const finalCTAObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
          if (hasShownSticky) {
            updateStickyCTA();
          }
        });
      }, {
        threshold: 0.1
      });

      finalCTAObserver.observe(finalCTASection);
      
      // スクロールイベントでも最終CTAセクションの表示状態をチェック
      let scrollTimeout = null;
      window.addEventListener('scroll', function() {
        if (!hasShownSticky) return;
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
          updateStickyCTA();
        }, 100);
      }, { passive: true });
    }
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
  // 合格実績ギャラリー（CSS アニメーション + JS 制御）
  // ============================================
  function initGallery(galleryId) {
    const gallery = document.getElementById(galleryId);
    if (!gallery) return;
    const wrapper = gallery.parentElement;

    // 画像を末尾に複製してシームレスループを実現
    Array.from(gallery.querySelectorAll('.result-image')).forEach(img => {
      gallery.appendChild(img.cloneNode(true));
    });

    // 複製後の描画を待ってからアニメーション開始（黒画面防止）
    requestAnimationFrame(() => requestAnimationFrame(() => {
      gallery.style.animationPlayState = 'running';
    }));

    if (!wrapper) return;

    // ホバーで一時停止（PC）
    wrapper.addEventListener('mouseenter', () => {
      gallery.style.animationPlayState = 'paused';
    });
    wrapper.addEventListener('mouseleave', () => {
      gallery.style.animationPlayState = 'running';
    });

    // タッチで一時停止（モバイル）
    let touchTimer;
    wrapper.addEventListener('touchstart', () => {
      clearTimeout(touchTimer);
      gallery.style.animationPlayState = 'paused';
    }, { passive: true });
    wrapper.addEventListener('touchend', () => {
      touchTimer = setTimeout(() => {
        gallery.style.animationPlayState = 'running';
      }, 1500);
    }, { passive: true });
  }

  initGallery('resultsGallery1');
  initGallery('resultsGallery2');

  // ============================================
  // デバッグ用: トラッキングデータの確認
  // ============================================
  if (window.location.search.includes('debug=true')) {
    console.log('LP Events:', JSON.parse(localStorage.getItem('lp_events') || '[]'));
  }

})();

// 追加: 受け取りボタンにバウンドクラスを付与 / 停止する制御
(function(){
  // バウンスアニメーションを適用するボタンのIDリスト
  const buttonIds = ['btn-howto-line', 'btn-final-line'];
  
  buttonIds.forEach(buttonId => {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    const startBounce = () => btn.classList.add('is-bouncing');
    const stopBounce  = () => btn.classList.remove('is-bouncing');

    // ページ読み込み後に少し遅らせて開始
    window.requestAnimationFrame(() => {
      setTimeout(() => {
        // IntersectionObserver が使えるなら視界に入ったら開始・停止
        if ('IntersectionObserver' in window) {
          const io = new IntersectionObserver(entries => {
            entries.forEach(en => {
              if (en.isIntersecting) startBounce();
              else stopBounce();
            });
          }, { threshold: 0.35 });
          io.observe(btn);
        } else {
          startBounce();
        }
      }, 600);
    });

    // ホバー／フォーカス中はアニメを停止（アクセシビリティ向上）
    btn.addEventListener('mouseenter', stopBounce);
    btn.addEventListener('mouseleave', startBounce);
    btn.addEventListener('focus', stopBounce);
    btn.addEventListener('blur', startBounce);

    // クリック時は一旦停止してから再開（不意の動きを抑える）
    btn.addEventListener('click', () => {
      stopBounce();
      setTimeout(startBounce, 800);
    });
  });
})();
