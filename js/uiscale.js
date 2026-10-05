(function(){  /* ============ UI 自适应缩放 ============ */
  function updateUIScale() {
    const BASE_W = 640;
    const BASE_H = 480;
    const raw = Math.min(
      window.innerWidth  / BASE_W,
      window.innerHeight / BASE_H
    );
    const scale = Math.max(0.75, Math.min(raw, 2.0));
    document.documentElement.style.setProperty(
      '--ui-scale',
      scale.toFixed(3)
    );
  }
  window.addEventListener('resize', updateUIScale);
  window.addEventListener('orientationchange', updateUIScale);
  updateUIScale();
  })()