/**
 * AELEX Architectural Hardware — Hero Section Controller
 * Handles auto-play slider, progress bar, touch gestures, and responsive mobile nav
 */

document.addEventListener('DOMContentLoaded', () => {
  // Add js-enabled class to body for progressive enhancement
  document.body.classList.add('js-enabled');

  // DOM Element Selectors
  const slides = document.querySelectorAll('.hero-slide');
  const currentNumEl = document.getElementById('current-slide-num');
  const totalNumEl = document.getElementById('total-slide-num');
  const progressBar = document.getElementById('slider-progress-bar');
  const prevBtn = document.getElementById('prev-slide-btn');
  const nextBtn = document.getElementById('next-slide-btn');
  const sliderWrapper = document.getElementById('hero-slider');
  
  // Mobile Nav Elements
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');

  // Slider State Configuration
  const SLIDE_DURATION = 5500; // 5.5 seconds per slide
  const totalSlides = slides.length;
  let currentSlideIndex = 0;
  let autoPlayTimer = null;
  let progressAnimation = null;
  let startTime = 0;
  let elapsedTime = 0;
  let isPaused = false;

  // Touch Swipe Variables
  let touchStartX = 0;
  let touchEndX = 0;

  // Initialize Slider Counter if slides exist
  if (totalNumEl && totalSlides > 0) {
    totalNumEl.textContent = String(totalSlides).padStart(2, '0');
  }

  /**
   * Navigate to a specific slide index
   * @param {number} targetIndex 
   */
  function goToSlide(targetIndex) {
    if (totalSlides === 0) return;

    if (targetIndex < 0) {
      targetIndex = totalSlides - 1;
    } else if (targetIndex >= totalSlides) {
      targetIndex = 0;
    }

    if (currentSlideIndex === targetIndex && slides[currentSlideIndex].classList.contains('active')) {
      return;
    }

    // Remove active class from previous slide
    slides.forEach((slide) => {
      slide.classList.remove('active');
      slide.setAttribute('aria-hidden', 'true');
    });

    // Activate new slide
    currentSlideIndex = targetIndex;
    if (slides[currentSlideIndex]) {
      slides[currentSlideIndex].classList.add('active');
      slides[currentSlideIndex].setAttribute('aria-hidden', 'false');
    }

    // Update Counter Text
    if (currentNumEl) {
      currentNumEl.textContent = String(currentSlideIndex + 1).padStart(2, '0');
    }

    // Reset & Restart Timer & Progress Bar
    resetAutoPlay();
  }

  /**
   * Start auto-play and sync progress bar animation
   */
  function startAutoPlay() {
    if (totalSlides === 0) return;

    stopAutoPlay();
    startTime = performance.now();
    elapsedTime = 0;

    function step(now) {
      if (!isPaused) {
        elapsedTime = now - startTime;
        const progressPercentage = Math.min((elapsedTime / SLIDE_DURATION) * 100, 100);
        
        if (progressBar) {
          progressBar.style.width = `${progressPercentage}%`;
        }

        if (elapsedTime >= SLIDE_DURATION) {
          goToSlide(currentSlideIndex + 1);
          return;
        }
      } else {
        // Adjust start time to hold position while paused
        startTime = now - elapsedTime;
      }

      progressAnimation = requestAnimationFrame(step);
    }

    progressAnimation = requestAnimationFrame(step);
  }

  /**
   * Stop timer and cancel animation frame
   */
  function stopAutoPlay() {
    if (progressAnimation) {
      cancelAnimationFrame(progressAnimation);
      progressAnimation = null;
    }
    if (progressBar) {
      progressBar.style.width = '0%';
    }
  }

  /**
   * Reset autoplay sequence
   */
  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  // Next & Previous Controls
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentSlideIndex + 1);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentSlideIndex - 1);
    });
  }

  // Keyboard Navigation
  if (totalSlides > 0) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        goToSlide(currentSlideIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        goToSlide(currentSlideIndex - 1);
      }
    });
  }

  // Pause on Hover / Focus
  if (sliderWrapper && totalSlides > 0) {
    sliderWrapper.addEventListener('mouseenter', () => {
      isPaused = true;
    });

    sliderWrapper.addEventListener('mouseleave', () => {
      isPaused = false;
    });

    // Touch Swipe Support for Mobile / Tablet
    sliderWrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      isPaused = true;
    }, { passive: true });

    sliderWrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      isPaused = false;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const swipeThreshold = 50; // minimum distance in px
    const diffX = touchEndX - touchStartX;

    if (Math.abs(diffX) > swipeThreshold) {
      if (diffX < 0) {
        // Swiped left -> Next slide
        goToSlide(currentSlideIndex + 1);
      } else {
        // Swiped right -> Previous slide
        goToSlide(currentSlideIndex - 1);
      }
    }
  }

  // Mobile Navigation Drawer Handler
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      } else {
        mobileDrawer.classList.add('open');
        mobileToggle.classList.add('open');
        mobileToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      }
    });

    // Mobile Product Accordion Submenu Handler
    const mobileDropdown = mobileDrawer.querySelector('.mobile-nav-dropdown');
    const mobileDropdownHeader = mobileDrawer.querySelector('.mobile-dropdown-header');
    const toggleBtn = mobileDrawer.querySelector('.mobile-dropdown-toggle');
    const toggleIcon = mobileDrawer.querySelector('.toggle-icon');

    if (mobileDropdownHeader && mobileDropdown) {
      mobileDropdownHeader.addEventListener('click', (e) => {
        // Prevent top-level product link navigation so user can toggle accordion
        e.preventDefault();
        e.stopPropagation();

        const isOpen = mobileDropdown.classList.contains('open');
        if (isOpen) {
          mobileDropdown.classList.remove('open');
          if (toggleIcon) toggleIcon.textContent = '+';
          if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
        } else {
          mobileDropdown.classList.add('open');
          if (toggleIcon) toggleIcon.textContent = '−';
          if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
        }
      });
    }

    // Close mobile drawer when clicking any nav link (including submenu links)
    const mobileLinks = mobileDrawer.querySelectorAll('a');
    mobileLinks.forEach(link => {
      // Skip the main dropdown trigger link since it handles toggle above
      if (link.classList.contains('mobile-nav-link-main')) return;

      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // IntersectionObserver for Scroll Reveal Animations
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.05
  };

  const revealSections = document.querySelectorAll('.brand-editorial-section, .product-showcase-section, .product-collection-section, .site-footer, .about-hero-clean, .about-intro-clean, .about-philosophy-clean, .about-craft-clean, .about-cta-clean, .product-hero-clean, .product-collection-clean, .product-editorial-clean, .product-showcase-alt, .product-cta-clean, .product-collection-editorial, .category-showcase-section, .product-slider-section, .asym-product-card');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target); // Trigger once
        }
      });
    }, observerOptions);

    revealSections.forEach(section => {
      revealObserver.observe(section);
      // Immediately reveal section if already inside the viewport
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom >= 0) {
        section.classList.add('in-view');
      }
    });
  } else {
    // Fallback if IntersectionObserver not supported
    revealSections.forEach(section => {
      section.classList.add('in-view');
    });
  }

  // ==========================================================================
  // AELEX Professional Product Slider Controller
  // ==========================================================================
  const prodTrack = document.getElementById('prod-slider-track');
  const prodPrevBtn = document.getElementById('prod-slider-prev');
  const prodNextBtn = document.getElementById('prod-slider-next');
  const prodDotsWrap = document.getElementById('prod-slider-dots');
  const prodViewport = document.getElementById('prod-slider-viewport');

  if (prodTrack && prodViewport) {
    const cards = Array.from(prodTrack.children);
    let currentProdIndex = 0;
    let prodTouchStartX = 0;
    let prodTouchEndX = 0;
    let prodAutoPlayTimer = null;

    function getVisibleCardCount() {
      const w = window.innerWidth;
      if (w <= 575) return 1;
      if (w <= 992) return 2;
      if (w <= 1200) return 3;
      return 4;
    }

    function getMaxIndex() {
      const visible = getVisibleCardCount();
      return Math.max(0, cards.length - visible);
    }

    function createDots() {
      if (!prodDotsWrap) return;
      prodDotsWrap.innerHTML = '';
      const maxIndex = getMaxIndex();
      for (let i = 0; i <= maxIndex; i++) {
        const dot = document.createElement('button');
        dot.className = `slider-dot ${i === currentProdIndex ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => updateProdSlider(i));
        prodDotsWrap.appendChild(dot);
      }
    }

    function updateProdSlider(targetIndex) {
      const maxIndex = getMaxIndex();
      currentProdIndex = Math.max(0, Math.min(targetIndex, maxIndex));

      if (cards.length > 0) {
        const cardWidth = cards[0].getBoundingClientRect().width;
        const gap = parseFloat(window.getComputedStyle(prodTrack).gap) || 28;
        const moveAmount = currentProdIndex * (cardWidth + gap);
        prodTrack.style.transform = `translateX(-${moveAmount}px)`;
      }

      if (prodDotsWrap) {
        const dots = Array.from(prodDotsWrap.children);
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === currentProdIndex);
        });
      }
    }

    if (prodNextBtn) {
      prodNextBtn.addEventListener('click', () => {
        const maxIndex = getMaxIndex();
        updateProdSlider(currentProdIndex >= maxIndex ? 0 : currentProdIndex + 1);
      });
    }

    if (prodPrevBtn) {
      prodPrevBtn.addEventListener('click', () => {
        const maxIndex = getMaxIndex();
        updateProdSlider(currentProdIndex <= 0 ? maxIndex : currentProdIndex - 1);
      });
    }

    // Touch and Drag support
    prodViewport.addEventListener('touchstart', (e) => {
      prodTouchStartX = e.changedTouches[0].screenX;
      stopProdAutoPlay();
    }, { passive: true });

    prodViewport.addEventListener('touchend', (e) => {
      prodTouchEndX = e.changedTouches[0].screenX;
      handleProdSwipe();
      startProdAutoPlay();
    }, { passive: true });

    let isMouseDown = false;
    prodViewport.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      prodTouchStartX = e.clientX;
      stopProdAutoPlay();
    });

    prodViewport.addEventListener('mouseup', (e) => {
      if (!isMouseDown) return;
      isMouseDown = false;
      prodTouchEndX = e.clientX;
      handleProdSwipe();
      startProdAutoPlay();
    });

    prodViewport.addEventListener('mouseleave', () => {
      isMouseDown = false;
      startProdAutoPlay();
    });

    prodViewport.addEventListener('mouseenter', () => {
      stopProdAutoPlay();
    });

    function handleProdSwipe() {
      const diff = prodTouchEndX - prodTouchStartX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) {
          updateProdSlider(currentProdIndex + 1);
        } else {
          updateProdSlider(currentProdIndex - 1);
        }
      }
    }

    function startProdAutoPlay() {
      stopProdAutoPlay();
      prodAutoPlayTimer = setInterval(() => {
        const maxIndex = getMaxIndex();
        updateProdSlider(currentProdIndex >= maxIndex ? 0 : currentProdIndex + 1);
      }, 5000);
    }

    function stopProdAutoPlay() {
      if (prodAutoPlayTimer) {
        clearInterval(prodAutoPlayTimer);
        prodAutoPlayTimer = null;
      }
    }

    // Window resize handler
    window.addEventListener('resize', () => {
      createDots();
      updateProdSlider(currentProdIndex);
    });

    // Init
    createDots();
    updateProdSlider(0);
    startProdAutoPlay();
  }

  // Start initial autoplay if hero slides exist
  if (totalSlides > 0) {
    startAutoPlay();
  }

  // ==========================================================================
  // SCROLL-BASED REVEAL ANIMATION CONTROLLER (INTERSECTION OBSERVER)
  // ==========================================================================
  const revealTargets = document.querySelectorAll(
    '.asym-product-card, .reveal-element, .reveal-left, .reveal-right, .product-collection-editorial, .category-showcase-section, .product-slider-section'
  );

  if ('IntersectionObserver' in window && revealTargets.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view', 'is-visible');
            // Unobserve element after reveal to keep visible on reverse scroll
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealTargets.forEach((target) => {
      revealObserver.observe(target);
    });
  } else {
    // Fallback if IntersectionObserver is unsupported
    revealTargets.forEach((target) => {
      target.classList.add('in-view', 'is-visible');
    });
  }
});


