/**
 * Performance Video Manager
 * Automatically pauses/resumes background video based on page performance
 * Combines FPS monitoring and long task detection for optimal performance
 */

class PerformanceVideoManager {
  constructor(options = {}) {
    // Configuration options with defaults
    this.config = {
      // FPS thresholds
      minFPS: options.minFPS || 25,
      fpsCheckDuration: options.fpsCheckDuration || 2000, // milliseconds
      
      // Long task threshold
      longTaskThreshold: options.longTaskThreshold || 100, // milliseconds
      longTaskTolerance: options.longTaskTolerance || 3, // number of long tasks before pausing
      
      // Recovery settings
      recoveryCheckInterval: options.recoveryCheckInterval || 3000, // milliseconds
      recoveryDuration: options.recoveryDuration || 5000, // good performance duration before resume
      
      // Video selector
      videoSelector: options.videoSelector || 'video',
      
      // Debug mode
      debug: options.debug !== undefined ? options.debug : true
    };

    // State management
    this.state = {
      isVideoPlaying: true,
      isPaused: false,
      lastFrameTime: performance.now(),
      frameCount: 0,
      fps: 60,
      fpsHistory: [],
      longTaskCount: 0,
      lastLongTaskTime: 0,
      performanceGoodSince: performance.now(),
      monitoringActive: false
    };

    // DOM elements
    this.video = null;

    // Bound methods for event listeners
    this.boundCheckFrame = this.checkFrame.bind(this);
    this.boundCheckRecovery = this.checkRecovery.bind(this);

    // Performance observer
    this.longTaskObserver = null;

    // RAF ID for cleanup
    this.rafId = null;
    this.recoveryIntervalId = null;

    // Initialize
    this.init();
  }

  /**
   * Initialize the performance manager
   */
  init() {
    this.log('🚀 Initializing Performance Video Manager');

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  /**
   * Setup video element and start monitoring
   */
  setup() {
    // Find video element
    this.video = document.querySelector(this.config.videoSelector);

    if (!this.video) {
      this.log('⚠️ No video element found with selector:', this.config.videoSelector);
      return;
    }

    this.log('✅ Video element found:', this.video);

    // Wait for video to be ready
    if (this.video.readyState >= 2) {
      this.startMonitoring();
    } else {
      this.video.addEventListener('loadeddata', () => this.startMonitoring(), { once: true });
    }
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    if (this.state.monitoringActive) {
      this.log('⚠️ Monitoring already active');
      return;
    }

    this.log('📊 Starting performance monitoring');
    this.state.monitoringActive = true;

    // Start FPS monitoring
    this.startFPSMonitoring();

    // Start long task monitoring
    this.startLongTaskMonitoring();

    this.log('✅ Performance monitoring active');
  }

  /**
   * Start FPS monitoring using requestAnimationFrame
   */
  startFPSMonitoring() {
    const checkFrame = (currentTime) => {
      if (!this.state.monitoringActive) return;

      // Calculate FPS
      const delta = currentTime - this.state.lastFrameTime;
      const currentFPS = 1000 / delta;

      this.state.fps = currentFPS;
      this.state.frameCount++;
      this.state.lastFrameTime = currentTime;

      // Store FPS in history (keep last 2 seconds worth)
      this.state.fpsHistory.push({
        fps: currentFPS,
        time: currentTime
      });

      // Clean old FPS history
      const cutoffTime = currentTime - this.config.fpsCheckDuration;
      this.state.fpsHistory = this.state.fpsHistory.filter(
        entry => entry.time > cutoffTime
      );

      // Check if FPS is consistently low
      if (this.state.fpsHistory.length > 30) { // At least 30 frames (~0.5s at 60fps)
        const avgFPS = this.state.fpsHistory.reduce((sum, entry) => sum + entry.fps, 0) / 
                       this.state.fpsHistory.length;

        if (avgFPS < this.config.minFPS && !this.state.isPaused) {
          this.log(`⚠️ Low FPS detected: ${avgFPS.toFixed(2)} (threshold: ${this.config.minFPS})`);
          this.pauseVideo('low-fps');
        } else if (avgFPS >= this.config.minFPS && this.state.isPaused) {
          // Performance is good, update recovery timer
          if (this.state.performanceGoodSince === null) {
            this.state.performanceGoodSince = currentTime;
          }
        } else if (avgFPS < this.config.minFPS) {
          // Still bad performance, reset recovery timer
          this.state.performanceGoodSince = null;
        }
      }

      // Continue monitoring
      this.rafId = requestAnimationFrame(checkFrame);
    };

    this.rafId = requestAnimationFrame(checkFrame);
  }

  /**
   * Start long task monitoring using PerformanceObserver
   */
  startLongTaskMonitoring() {
    // Check if PerformanceObserver is supported
    if (!window.PerformanceObserver) {
      this.log('⚠️ PerformanceObserver not supported in this browser');
      return;
    }

    try {
      this.longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > this.config.longTaskThreshold) {
            this.state.longTaskCount++;
            this.state.lastLongTaskTime = performance.now();

            this.log(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms (threshold: ${this.config.longTaskThreshold}ms)`);

            // Check if too many long tasks occurred
            if (this.state.longTaskCount >= this.config.longTaskTolerance && !this.state.isPaused) {
              this.pauseVideo('long-tasks');
            }
          }
        }
      });

      // Observe longtask entries
      this.longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.log('✅ Long task monitoring active');
    } catch (error) {
      this.log('⚠️ Could not start long task monitoring:', error.message);
    }
  }

  /**
   * Pause the video due to performance issues
   */
  pauseVideo(reason) {
    if (this.state.isPaused) return;

    this.log(`⏸️ Pausing video due to: ${reason}`);
    this.state.isPaused = true;
    this.state.performanceGoodSince = null;

    if (this.video && !this.video.paused) {
      this.video.pause();
      this.log('✅ Video paused (frame remains visible)');
    }

    // Start checking for recovery
    if (!this.recoveryIntervalId) {
      this.recoveryIntervalId = setInterval(
        this.boundCheckRecovery,
        this.config.recoveryCheckInterval
      );
      this.log('✅ Recovery monitoring started');
    }
  }

  /**
   * Check if performance has recovered and resume video
   */
  checkRecovery() {
    if (!this.state.isPaused) {
      if (this.recoveryIntervalId) {
        clearInterval(this.recoveryIntervalId);
        this.recoveryIntervalId = null;
      }
      return;
    }

    const now = performance.now();

    // Check FPS recovery
    const recentFPS = this.state.fpsHistory.slice(-60); // Last ~1 second at 60fps
    const avgRecentFPS = recentFPS.length > 0
      ? recentFPS.reduce((sum, entry) => sum + entry.fps, 0) / recentFPS.length
      : 0;

    // Check long task recovery (no long tasks in last 5 seconds)
    const timeSinceLastLongTask = now - this.state.lastLongTaskTime;
    const longTasksRecovered = timeSinceLastLongTask > 5000;

    // Both conditions must be good
    const performanceGood = avgRecentFPS >= this.config.minFPS && longTasksRecovered;

    if (performanceGood) {
      if (this.state.performanceGoodSince === null) {
        this.state.performanceGoodSince = now;
        this.log(`✅ Performance recovered. Monitoring for ${this.config.recoveryDuration}ms before resume...`);
      } else {
        const recoveryDuration = now - this.state.performanceGoodSince;
        
        if (recoveryDuration >= this.config.recoveryDuration) {
          this.resumeVideo();
        } else {
          this.log(`⏳ Performance stable for ${recoveryDuration.toFixed(0)}ms / ${this.config.recoveryDuration}ms`);
        }
      }
    } else {
      // Performance not good yet, reset recovery timer
      if (this.state.performanceGoodSince !== null) {
        this.log(`⚠️ Performance degraded again (FPS: ${avgRecentFPS.toFixed(2)}, Long tasks OK: ${longTasksRecovered})`);
        this.state.performanceGoodSince = null;
      }
    }

    // Reset long task counter periodically
    if (timeSinceLastLongTask > 10000) {
      this.state.longTaskCount = 0;
    }
  }

  /**
   * Resume video playback
   */
  resumeVideo() {
    if (!this.state.isPaused) return;

    this.log('▶️ Resuming video playback');
    this.state.isPaused = false;
    this.state.longTaskCount = 0;
    this.state.performanceGoodSince = performance.now();

    if (this.video && this.video.paused) {
      this.video.play().catch(error => {
        this.log('⚠️ Could not resume video:', error.message);
      });
    }

    // Stop recovery monitoring
    if (this.recoveryIntervalId) {
      clearInterval(this.recoveryIntervalId);
      this.recoveryIntervalId = null;
      this.log('✅ Recovery monitoring stopped');
    }
  }

  /**
   * Stop all monitoring and cleanup
   */
  destroy() {
    this.log('🛑 Destroying Performance Video Manager');

    this.state.monitoringActive = false;

    // Cancel RAF
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Stop recovery interval
    if (this.recoveryIntervalId) {
      clearInterval(this.recoveryIntervalId);
      this.recoveryIntervalId = null;
    }

    // Disconnect long task observer
    if (this.longTaskObserver) {
      this.longTaskObserver.disconnect();
      this.longTaskObserver = null;
    }

    this.log('✅ Cleanup complete');
  }

  /**
   * Console logging with debug flag
   */
  log(...args) {
    if (this.config.debug) {
      console.log('[PerformanceVideoManager]', ...args);
    }
  }

  /**
   * Get current performance stats
   */
  getStats() {
    const recentFPS = this.state.fpsHistory.slice(-60);
    const avgFPS = recentFPS.length > 0
      ? recentFPS.reduce((sum, entry) => sum + entry.fps, 0) / recentFPS.length
      : 0;

    return {
      isPaused: this.state.isPaused,
      currentFPS: this.state.fps.toFixed(2),
      averageFPS: avgFPS.toFixed(2),
      longTaskCount: this.state.longTaskCount,
      timeSinceLastLongTask: performance.now() - this.state.lastLongTaskTime,
      performanceGoodSince: this.state.performanceGoodSince
    };
  }
}

// Usage Example and Lazy Initialization
// =====================================

// Initialize ONLY after all page content has fully loaded (lazy loading)
if (typeof window !== 'undefined') {
  let videoManager = null;

  const initVideoManager = () => {
    console.log('[PerformanceVideoManager] 🎯 Page fully loaded - initializing video manager');
    
    // Configuration - Customize these values as needed
    const config = {
      // FPS threshold - pause video if FPS drops below this
      minFPS: 25,
      
      // How long to monitor FPS before making a decision (ms)
      fpsCheckDuration: 2000,
      
      // Long task threshold - tasks longer than this are problematic (ms)
      longTaskThreshold: 100,
      
      // How many long tasks before pausing video
      longTaskTolerance: 3,
      
      // How often to check if performance has recovered (ms)
      recoveryCheckInterval: 3000,
      
      // How long performance must be good before resuming (ms)
      recoveryDuration: 5000,
      
      // Video element selector
      videoSelector: 'video',
      
      // Enable/disable console logging
      debug: true
    };

    // Create and initialize the manager
    videoManager = new PerformanceVideoManager(config);

    // Optional: Expose to window for debugging
    window.videoManager = videoManager;

    // Optional: Log stats periodically for debugging
    if (config.debug) {
      setInterval(() => {
        const stats = videoManager.getStats();
        console.log('📊 Performance Stats:', stats);
      }, 10000); // Every 10 seconds
    }
  };

  // LAZY LOADING: Wait for complete page load (all resources: images, styles, scripts, etc.)
  // This ensures the performance manager doesn't interfere with initial page load
  if (document.readyState === 'complete') {
    // Page already loaded
    initVideoManager();
  } else {
    // Wait for the 'load' event (fires after ALL resources are loaded)
    window.addEventListener('load', () => {
      // Add a small delay to ensure everything is settled
      setTimeout(initVideoManager, 500);
    });
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceVideoManager;
}
