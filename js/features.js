// ==========================================
// ✅ ATHR PLATFORM - DEDICATED VIDEO PLAYER SCRIPT (V9.2)
// ==========================================

(function() {
  'use strict';

  // --- انتظار تحميل الـ DOM ---
  // نستخدم هذا لضمان أن الكود يعمل سواء تم تحميله
  // في الـ <head> أو نهاية الـ <body>
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePlayer);
  } else {
    initializePlayer();
  }

  function initializePlayer() {
    console.log('🎬 Initializing video player...');
    
    const videoPlayer = document.getElementById('videoPlayer');
    const video = document.getElementById('video'); // نفترض أن الـ video له id="video"
    
    if (!videoPlayer || !video) {
      console.log('⚠️ Video player elements (videoPlayer or video) not found on this page');
      return;
    }

    // --- جلب كل العناصر ---
    const videoBars = document.getElementById('videoBars');
    const simplePlayBtn = document.getElementById('simplePlayBtn');
    const simpleFullscreenBtn = document.getElementById('simpleFullscreenBtn');
    const simpleProgress = document.getElementById('simpleProgress');
    const simpleProgressFilled = document.getElementById('simpleProgressFilled');
    const simpleCurrentTime = document.getElementById('simpleCurrentTime');
    const simpleDuration = document.getElementById('simpleDuration');
    const playBtn = document.getElementById('playBtn');
    const skipBack = document.getElementById('skipBack');
    const skipForward = document.getElementById('skipForward');
    const progressWrapper = document.getElementById('progressWrapper');
    const progressFilled = document.getElementById('progressFilled');
    const progressBuffered = document.getElementById('progressBuffered');
    const currentTimeEl = document.getElementById('currentTime');
    const remainingTimeEl = document.getElementById('remainingTime');
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const closeBtn = document.getElementById('closeBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const tapLeft = document.getElementById('tapLeft');
    const tapRight = document.getElementById('tapRight');


    let controlsTimeout;
    let isDragging = false;
    let isFullscreen = false;

    // --- دوال مساعدة ---

    function formatTime(seconds) {
      if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      return hrs > 0 
        ? `${hrs}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}` 
        : `${mins}:${secs.toString().padStart(2,'0')}`;
    }

    function togglePlay() {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }

    function toggleFullscreen() {
      if (!isFullscreen) {
        videoPlayer.classList.add('fullscreen-mode');
        if (videoPlayer.requestFullscreen) {
          videoPlayer.requestFullscreen();
        } else if (videoPlayer.webkitRequestFullscreen) {
          videoPlayer.webkitRequestFullscreen(); // Safari
        }
        isFullscreen = true;
        showControls();
      } else {
        exitFullscreen();
      }
    }

    function exitFullscreen() {
      videoPlayer.classList.remove('fullscreen-mode');
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen(); // Safari
      }
      isFullscreen = false;
      if (videoBars) videoBars.classList.remove('hidden');
    }

    function showControls() {
      if (!isFullscreen) return;
      videoPlayer.classList.add('show-controls');
      if (videoBars) videoBars.classList.remove('hidden');
      
      clearTimeout(controlsTimeout);
      controlsTimeout = setTimeout(() => {
        if (!video.paused && !isDragging) {
          videoPlayer.classList.remove('show-controls');
          if (videoBars) videoBars.classList.add('hidden');
        }
      }, 3000);
    }

    function skipBackward() {
      video.currentTime = Math.max(0, video.currentTime - 10);
      showTapIndicator('left');
    }

    function skipForwardFunc() {
      video.currentTime = Math.min(video.duration, video.currentTime + 10);
      showTapIndicator('right');
    }

    function showTapIndicator(side) {
      const indicator = side === 'left' ? tapLeft : tapRight;
      if (indicator) {
        indicator.classList.add('active');
        setTimeout(() => indicator.classList.remove('active'), 500);
      }
    }

    function updateProgress() {
      if (!isDragging && video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        if (simpleProgressFilled) simpleProgressFilled.style.width = `${progress}%`;
        if (progressFilled) progressFilled.style.width = `${progress}%`;
        
        const timeStr = formatTime(video.currentTime);
        if (simpleCurrentTime) simpleCurrentTime.textContent = timeStr;
        if (currentTimeEl) currentTimeEl.textContent = timeStr;
        if (remainingTimeEl) remainingTimeEl.textContent = '-' + formatTime(video.duration - video.currentTime);
      }
    }

    function handleSeek(e, el) {
      const rect = el.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      if (clientX === undefined) return; // منع الأخطاء
      
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const time = percent * video.duration;
      if (!isNaN(time)) {
        video.currentTime = time;
        const progress = percent * 100;
        if (simpleProgressFilled) simpleProgressFilled.style.width = `${progress}%`;
        if (progressFilled) progressFilled.style.width = `${progress}%`;
      }
    }

    function updateVolumeIcon() {
      if (!volumeBtn) return;
      const vol = video.volume;
      const icon = video.muted || vol === 0 ? 'fa-volume-xmark' : vol < 0.5 ? 'fa-volume-low' : 'fa-volume-up';
      volumeBtn.innerHTML = `<i class="fas ${icon}"></i>`;
    }

    function updateVolumeSliderBg() {
      if (!volumeSlider) return;
      const percent = video.volume * 100;
      volumeSlider.style.background = `linear-gradient(to right, #fff ${percent}%, rgba(255, 255, 255, 0.3) ${percent}%)`;
    }

    // --- ربط مستمعي الأحداث ---
    
    video.addEventListener('loadstart', () => { if (loadingSpinner) loadingSpinner.classList.add('active'); });
    video.addEventListener('canplay', () => { if (loadingSpinner) loadingSpinner.classList.remove('active'); });
    video.addEventListener('loadedmetadata', () => {
      if (simpleDuration) simpleDuration.textContent = formatTime(video.duration);
      if (remainingTimeEl) remainingTimeEl.textContent = '-' + formatTime(video.duration);
      if (isFullscreen) showControls();
    });
    video.addEventListener('play', () => {
      videoPlayer.classList.remove('paused');
      if (simplePlayBtn) simplePlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
      if (playBtn) playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    });
    video.addEventListener('pause', () => {
      videoPlayer.classList.add('paused');
      if (simplePlayBtn) simplePlayBtn.innerHTML = '<i class="fas fa-play"></i>';
      if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
      showControls();
    });
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('progress', () => {
      if (video.buffered.length > 0 && progressBuffered && video.duration > 0) {
        progressBuffered.style.width = `${(video.buffered.end(0) / video.duration) * 100}%`;
      }
    });

    if (simplePlayBtn) simplePlayBtn.addEventListener('click', togglePlay);
    if (simpleFullscreenBtn) simpleFullscreenBtn.addEventListener('click', toggleFullscreen);
    if (simpleProgress) simpleProgress.addEventListener('click', (e) => handleSeek(e, simpleProgress));
    
    if (playBtn) playBtn.addEventListener('click', togglePlay);
    if (skipBack) skipBack.addEventListener('click', skipBackward);
    if (skipForward) skipForward.addEventListener('click', skipForwardFunc);
    if (closeBtn) closeBtn.addEventListener('click', exitFullscreen);

    if (volumeBtn) {
      volumeBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        updateVolumeIcon();
      });
    }

    if (volumeSlider) {
      volumeSlider.addEventListener('input', () => {
        video.volume = volumeSlider.value;
        video.muted = false;
        updateVolumeIcon();
        updateVolumeSliderBg();
      });
    }

    // --- مستمعي السحب (Dragging) ---
    if (progressWrapper) {
      progressWrapper.addEventListener('mousedown', (e) => {
        isDragging = true;
        videoPlayer.classList.add('dragging');
        handleSeek(e, progressWrapper);
      });
      progressWrapper.addEventListener('touchstart', (e) => {
        isDragging = true;
        videoPlayer.classList.add('dragging');
        handleSeek(e, progressWrapper);
      }, { passive: true });
      progressWrapper.addEventListener('click', (e) => handleSeek(e, progressWrapper));
    }

    document.addEventListener('mousemove', (e) => { if (isDragging && progressWrapper) handleSeek(e, progressWrapper); });
    document.addEventListener('touchmove', (e) => { if (isDragging && progressWrapper) handleSeek(e, progressWrapper); }, { passive: true });
    document.addEventListener('mouseup', () => { if (isDragging) { isDragging = false; videoPlayer.classList.remove('dragging'); } });
    document.addEventListener('touchend', () => { if (isDragging) { isDragging = false; videoPlayer.classList.remove('dragging'); } });

    // --- مستمعي النقر المزدوج (Double Tap) ---
    let tapCount = 0;
    let tapTimeout;
    let lastTapX = 0;

    video.addEventListener('click', (e) => {
      if (!isFullscreen) {
        togglePlay();
        return;
      }

      tapCount++;
      lastTapX = e.clientX || (e.touches && e.touches[0].clientX);
      clearTimeout(tapTimeout);

      if (tapCount === 1) {
        tapTimeout = setTimeout(() => {
          togglePlay();
          tapCount = 0;
        }, 300);
      } else if (tapCount === 2) {
        const rect = video.getBoundingClientRect();
        (lastTapX - rect.left > rect.width / 2 ? skipForwardFunc : skipBackward)();
        tapCount = 0;
      }
    });

    // --- مستمعي التحكم (Controls Visibility) ---
    videoPlayer.addEventListener('mousemove', showControls);
    videoPlayer.addEventListener('touchstart', showControls, { passive: true });
    document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) exitFullscreen(); });
    document.addEventListener('webkitfullscreenchange', () => { if (!document.webkitIsFullScreen) exitFullscreen(); });

    // --- مستمعي لوحة المفاتيح (Keyboard Shortcuts) ---
    document.addEventListener('keydown', (e) => {
      // تجاهل إذا كان المستخدم يكتب في حقل إدخال
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForwardFunc();
          break;
        case 'm':
          e.preventDefault();
          video.muted = !video.muted;
          updateVolumeIcon();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    });

    // --- التهيئة الأولية ---
    updateVolumeIcon();
    updateVolumeSliderBg();

    console.log('✅ Video player initialized');
    console.log('⌨️ Shortcuts: Space/K=Play, ←/→=Skip, M=Mute, F=Fullscreen');
  
  } // --- نهاية دالة initializePlayer ---

})();