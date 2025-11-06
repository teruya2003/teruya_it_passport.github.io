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
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
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
    
    // ストーリーセクションの監視
    if (storySection) {
      const storyObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
          // 「私がITパスポートを教えることになった理由」ブロックが表示されたら、sticky CTAを表示
          if (entry.isIntersecting && !hasShownSticky) {
            hasShownSticky = true;
            stickyCTA.classList.add('visible');
          }
        });
      }, {
        threshold: 0.3
      });

      storyObserver.observe(storySection);
    }
    
    // 最終CTAセクションが表示されている間はSticky CTAを非表示
    if (finalCTASection) {
      const finalCTAObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
          if (hasShownSticky) {
            // 最終CTAセクションが表示されている間はSticky CTAを非表示
            if (entry.isIntersecting) {
              stickyCTA.classList.remove('visible');
            } else {
              stickyCTA.classList.add('visible');
            }
          }
        });
      }, {
        threshold: 0.1
      });

      finalCTAObserver.observe(finalCTASection);
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
  // 合格実績ギャラリー（自動スクロール + タッチ操作）
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
  
  // 自動スクロール管理機能（無限ループ改善版）
  function setupTouchScroll(gallery, isRightScroll) {
    if (!gallery) return;
    
    const wrapper = gallery.parentElement; // .results-gallery-wrapper
    if (!wrapper) return;
    
    // 画像の幅を取得して、1セット分の幅を計算
    const images = gallery.querySelectorAll('.result-image');
    if (images.length === 0) return;
    
    const firstImage = images[0];
    const imageWidth = firstImage.offsetWidth || 280;
    const gap = 20;
    const singleSetWidth = (imageWidth + gap) * images.length - gap; // 1セット分の幅
    
    let autoScrollInterval = null;
    let isUserInteracting = false;
    let isScrolling = false;
    
    // 無限ループチェック関数
    function checkAndResetScroll() {
      if (isScrolling) return; // リセット中は処理しない
      
      const scrollLeft = wrapper.scrollLeft;
      const scrollWidth = wrapper.scrollWidth;
      const clientWidth = wrapper.clientWidth;
      const maxScroll = scrollWidth - clientWidth;
      
      // 右スクロールの場合：最後の画像に到達したら最初に戻る
      if (isRightScroll) {
        if (scrollLeft >= singleSetWidth - 10) { // 少し余裕を持たせる
          isScrolling = true;
          wrapper.scrollLeft = 0;
          setTimeout(() => {
            isScrolling = false;
          }, 50);
        }
      } 
      // 左スクロールの場合：最初の画像に到達したら最後に戻る
      else {
        if (scrollLeft <= 10) { // 少し余裕を持たせる
          isScrolling = true;
          wrapper.scrollLeft = singleSetWidth;
          setTimeout(() => {
            isScrolling = false;
          }, 50);
        }
      }
    }
    
    // 自動スクロール関数
    function startAutoScroll() {
      if (autoScrollInterval) return;
      
      autoScrollInterval = setInterval(() => {
        if (!isUserInteracting && wrapper && !isScrolling) {
          const currentScroll = wrapper.scrollLeft;
          
          // スクロール位置を更新
          if (isRightScroll) {
            wrapper.scrollLeft = currentScroll + 1; // 右スクロール（左から右へ）
          } else {
            wrapper.scrollLeft = currentScroll - 1; // 左スクロール（右から左へ）
          }
          
          // 無限ループチェック
          checkAndResetScroll();
        }
      }, 30); // 30msごとに更新（スムーズな動き）
    }
    
    function stopAutoScroll() {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }
    }
    
    // ユーザーがスクロールしているかを検出
    let scrollTimeout = null;
    let lastScrollLeft = wrapper.scrollLeft;
    
    wrapper.addEventListener('scroll', function() {
      // ユーザーが手動でスクロールしているかチェック
      const currentScroll = wrapper.scrollLeft;
      const scrollDiff = Math.abs(currentScroll - lastScrollLeft);
      
      if (scrollDiff > 5) { // 5px以上動いていたらユーザー操作と判断
        isUserInteracting = true;
        stopAutoScroll();
        
        // 無限ループチェック（ユーザー操作時も）
        checkAndResetScroll();
      }
      
      lastScrollLeft = currentScroll;
      
      // スクロールが止まったら自動スクロールを再開
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isUserInteracting = false;
        startAutoScroll();
      }, 2000); // 2秒間操作がなければ再開
    }, { passive: true });
    
    // タッチ開始時に自動スクロールを停止
    wrapper.addEventListener('touchstart', function() {
      isUserInteracting = true;
      stopAutoScroll();
    }, { passive: true });
    
    // タッチ終了時に一定時間後に自動スクロールを再開
    wrapper.addEventListener('touchend', function() {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isUserInteracting = false;
        startAutoScroll();
      }, 2000);
    }, { passive: true });
    
    // ホバー時に自動スクロールを一時停止（PCのみ）
    wrapper.addEventListener('mouseenter', function() {
      stopAutoScroll();
    });
    
    wrapper.addEventListener('mouseleave', function() {
      if (!isUserInteracting) {
        startAutoScroll();
      }
    });
    
    // 初期化：自動スクロールを開始
    setTimeout(() => {
      // 左スクロールの場合は、最初に右端に移動
      if (!isRightScroll) {
        setTimeout(() => {
          const scrollWidth = wrapper.scrollWidth;
          const clientWidth = wrapper.clientWidth;
          wrapper.scrollLeft = scrollWidth - clientWidth;
        }, 100);
      }
      
      setTimeout(() => {
        startAutoScroll();
      }, 500);
    }, 1000);
  }
  
  if (resultsGallery1) {
    duplicateImages(resultsGallery1);
    setupTouchScroll(resultsGallery1, true); // 右スクロール
  }
  
  if (resultsGallery2) {
    duplicateImages(resultsGallery2);
    setupTouchScroll(resultsGallery2, false); // 左スクロール
  }

  // ネイティブスクロールのスナップ動作を無効化（スムーズなスクロールのため）
  document.querySelectorAll('.results-gallery-wrapper').forEach(wrapper => {
    wrapper.style.scrollSnapType = 'none';
  });
  
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
