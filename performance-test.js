// Performance Test Script for Modern Resume Design
// Run this in browser console to test performance metrics

const performanceTest = {
  // Test CSS parsing performance
  testCSSPerformance() {
    console.log('🎯 Testing CSS Performance...');
    
    const startTime = performance.now();
    
    // Test CSS variable access speed
    const testElement = document.createElement('div');
    document.body.appendChild(testElement);
    
    // Test 1000 CSS variable accesses
    for (let i = 0; i < 1000; i++) {
      testElement.style.color = 'var(--color-accent)';
      testElement.style.background = 'var(--color-bg-primary)';
      testElement.style.padding = 'var(--space-4)';
    }
    
    const endTime = performance.now();
    document.body.removeChild(testElement);
    
    console.log(`✅ CSS Variable Performance: ${(endTime - startTime).toFixed(2)}ms for 1000 operations`);
    return endTime - startTime;
  },
  
  // Test animation performance
  testAnimationPerformance() {
    console.log('🎬 Testing Animation Performance...');
    
    const testCards = document.querySelectorAll('.card, .experience-card');
    if (testCards.length === 0) {
      console.log('⚠️ No cards found for animation testing');
      return;
    }
    
    const startTime = performance.now();
    
    // Trigger hover animations
    testCards.forEach(card => {
      card.dispatchEvent(new MouseEvent('mouseenter'));
      setTimeout(() => {
        card.dispatchEvent(new MouseEvent('mouseleave'));
      }, 100);
    });
    
    setTimeout(() => {
      const endTime = performance.now();
      console.log(`✅ Animation Performance: ${(endTime - startTime).toFixed(2)}ms for ${testCards.length} cards`);
    }, 500);
  },
  
  // Test responsive performance
  testResponsivePerformance() {
    console.log('📱 Testing Responsive Performance...');
    
    const breakpoints = [320, 768, 1024, 1440, 1920];
    const results = [];
    
    breakpoints.forEach(width => {
      const startTime = performance.now();
      
      // Simulate viewport change
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', `width=${width}, initial-scale=1.0`);
      }
      
      // Force reflow
      document.body.offsetHeight;
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      results.push({ width, duration });
      console.log(`✅ ${width}px viewport: ${duration.toFixed(2)}ms`);
    });
    
    return results;
  },
  
  // Test bundle size impact
  testBundleSize() {
    console.log('📦 Testing Bundle Size Impact...');
    
    // Count CSS rules
    let totalRules = 0;
    let cssVariables = 0;
    
    for (let i = 0; i < document.styleSheets.length; i++) {
      try {
        const sheet = document.styleSheets[i];
        if (sheet.cssRules) {
          totalRules += sheet.cssRules.length;
          
          // Count CSS variables
          for (let j = 0; j < sheet.cssRules.length; j++) {
            const rule = sheet.cssRules[j];
            if (rule.style && rule.style.cssText) {
              const matches = rule.style.cssText.match(/--[\w-]+/g);
              if (matches) {
                cssVariables += matches.length;
              }
            }
          }
        }
      } catch {
        // Cross-origin stylesheet, skip
      }
    }
    
    console.log(`✅ Total CSS Rules: ${totalRules}`);
    console.log(`✅ CSS Variables: ${cssVariables}`);
    
    return { totalRules, cssVariables };
  },
  
  // Test memory usage
  testMemoryUsage() {
    console.log('🧠 Testing Memory Usage...');
    
    if (performance.memory) {
      const memory = performance.memory;
      console.log(`✅ Used JS Heap: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`✅ Total JS Heap: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`✅ JS Heap Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
      
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    } else {
      console.log('⚠️ Memory API not available in this browser');
      return null;
    }
  },
  
  // Test Core Web Vitals
  testCoreWebVitals() {
    console.log('⚡ Testing Core Web Vitals...');
    
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log(`✅ Largest Contentful Paint: ${lastEntry.startTime.toFixed(2)}ms`);
      });
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch {
        console.log('⚠️ LCP measurement not supported');
      }
      
      // First Input Delay (simulated)
      document.addEventListener('click', function measureFID() {
        const fidStart = performance.now();
        setTimeout(() => {
          const fid = performance.now() - fidStart;
          console.log(`✅ First Input Delay (simulated): ${fid.toFixed(2)}ms`);
        }, 0);
        document.removeEventListener('click', measureFID);
      }, { once: true });
    }
    
    // Cumulative Layout Shift (basic check)
    let cumulativeLayoutShift = 0;
    const resizeObserver = new ResizeObserver(() => {
      cumulativeLayoutShift += 0.001; // Simplified CLS calculation
    });
    
    document.querySelectorAll('section, .card').forEach(el => {
      resizeObserver.observe(el);
    });
    
    setTimeout(() => {
      console.log(`✅ Cumulative Layout Shift (estimated): ${cumulativeLayoutShift.toFixed(3)}`);
      resizeObserver.disconnect();
    }, 2000);
  },
  
  // Run all tests
  runAllTests() {
    console.log('🚀 Starting Performance Test Suite...');
    console.log('=====================================');
    
    const results = {
      cssPerformance: this.testCSSPerformance(),
      bundleSize: this.testBundleSize(),
      memoryUsage: this.testMemoryUsage(),
      timestamp: new Date().toISOString()
    };
    
    this.testAnimationPerformance();
    this.testResponsivePerformance();
    this.testCoreWebVitals();
    
    console.log('=====================================');
    console.log('✅ Performance Test Suite Complete!');
    console.log('Results:', results);
    
    return results;
  }
};

// Auto-run tests if script is loaded directly
if (typeof window !== 'undefined' && document.readyState === 'complete') {
  performanceTest.runAllTests();
} else if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => performanceTest.runAllTests(), 1000);
  });
}

// Export for manual testing
if (typeof window !== 'undefined') {
  window.performanceTest = performanceTest;
}