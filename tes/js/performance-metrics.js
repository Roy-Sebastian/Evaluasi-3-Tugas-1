(() => {
  // Only run in browsers that support the Performance API
  if (!window.performance || !window.performance.timing) return;
  
  // Performance metrics to measure
  const metrics = {
    FCP: 0,    // First Contentful Paint
    LCP: 0,    // Largest Contentful Paint
    TTI: 0,    // Time to Interactive
    TBT: 0,    // Total Blocking Time
    CLS: 0,    // Cumulative Layout Shift
    TTFB: 0,   // Time to First Byte
    FID: 0     // First Input Delay
  };
  
  // Store reference values for performance benchmarks
  const benchmarks = {
    FCP: { good: 1800, needsImprovement: 3000 },
    LCP: { good: 2500, needsImprovement: 4000 },
    TTI: { good: 3800, needsImprovement: 7300 },
    TBT: { good: 200, needsImprovement: 600 },
    CLS: { good: 0.1, needsImprovement: 0.25 },
    TTFB: { good: 800, needsImprovement: 1800 },
    FID: { good: 100, needsImprovement: 300 }
  };
  
  // Performance entry types to observe
  const entryTypes = [
    'navigation',
    'resource',
    'paint',
    'largest-contentful-paint',
    'layout-shift',
    'longtask',
    'first-input'
  ];
  
  // Create performance observers
  const observers = {};
  
  // Helper function to evaluate metric status
  function evaluateMetric(metricName, value) {
    const benchmark = benchmarks[metricName];
    if (!benchmark) return 'unknown';
    
    if (value <= benchmark.good) return 'good';
    if (value <= benchmark.needsImprovement) return 'needs-improvement';
    return 'poor';
  }
  
  // Helper function to format output with color
  function formatMetricOutput(metricName, value, unit = 'ms') {
    const status = evaluateMetric(metricName, value);
    const formattedValue = unit === 'ms' ? Math.round(value) : value.toFixed(3);
    
    // Add emoji indicators for visual feedback
    let statusIndicator = '❓';
    if (status === 'good') statusIndicator = '✅';
    if (status === 'needs-improvement') statusIndicator = '⚠️';
    if (status === 'poor') statusIndicator = '❌';
    
    return `${statusIndicator} ${metricName}: ${formattedValue}${unit}`;
  }
  
  // Measure First Contentful Paint
  observers.paint = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntriesByName('first-contentful-paint');
    if (entries.length > 0) {
      metrics.FCP = entries[0].startTime;
      console.log(formatMetricOutput('FCP', metrics.FCP));
    }
  });
  
  // Measure Largest Contentful Paint
  observers.lcp = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      metrics.LCP = lastEntry.startTime;
      console.log(formatMetricOutput('LCP', metrics.LCP));
    }
  });
  
  // Measure Cumulative Layout Shift
  observers.cls = new PerformanceObserver((entryList) => {
    let clsValue = 0;
    entryList.getEntries().forEach(entry => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });
    metrics.CLS = clsValue;
    console.log(formatMetricOutput('CLS', metrics.CLS, ''));
  });
  
  // Measure Total Blocking Time
  let longTasksTotal = 0;
  observers.longtask = new PerformanceObserver((entryList) => {
    entryList.getEntries().forEach(entry => {
      const blockingTime = entry.duration - 50;
      if (blockingTime > 0) {
        longTasksTotal += blockingTime;
        metrics.TBT = longTasksTotal;
      }
    });
  });
  
  // Measure First Input Delay
  observers.fid = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    if (entries.length > 0) {
      metrics.FID = entries[0].processingStart - entries[0].startTime;
      console.log(formatMetricOutput('FID', metrics.FID));
    }
  });
  
  // Measure Time to First Byte
  window.addEventListener('load', () => {
    if (performance.getEntriesByType('navigation').length > 0) {
      metrics.TTFB = performance.getEntriesByType('navigation')[0].responseStart;
      console.log(formatMetricOutput('TTFB', metrics.TTFB));
    }
  });
  
  // Start observing available entry types
  for (const type of entryTypes) {
    try {
      if (observers[type]) {
        observers[type].observe({ 
          type: type, 
          buffered: true 
        });
      } else if (type === 'paint') {
        observers.paint.observe({ 
          type: type, 
          buffered: true 
        });
      } else if (type === 'largest-contentful-paint') {
        observers.lcp.observe({ 
          type: type, 
          buffered: true 
        });
      } else if (type === 'layout-shift') {
        observers.cls.observe({ 
          type: type, 
          buffered: true 
        });
      } else if (type === 'longtask') {
        observers.longtask.observe({ 
          type: type, 
          buffered: true 
        });
      } else if (type === 'first-input') {
        observers.fid.observe({ 
          type: type, 
          buffered: true 
        });
      }
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }
  
  // Report complete metrics summary
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('\n-------- PERFORMANCE METRICS SUMMARY --------');
      console.log(formatMetricOutput('TTFB', metrics.TTFB));
      console.log(formatMetricOutput('FCP', metrics.FCP));
      console.log(formatMetricOutput('LCP', metrics.LCP));
      console.log(formatMetricOutput('FID', metrics.FID));
      console.log(formatMetricOutput('TBT', metrics.TBT));
      console.log(formatMetricOutput('CLS', metrics.CLS, ''));
      console.log('-------------------------------------------');
      
      // Calculate approximate overall performance score
      const weightedScore = calculatePerformanceScore(metrics);
      console.log(`Estimated Performance Score: ${weightedScore}/100`);
      console.log('-------------------------------------------\n');
    }, 5000);
  });
  
  // Simple function to estimate performance score based on Core Web Vitals weightings
  function calculatePerformanceScore(metrics) {
    // Normalize metrics to 0-1 scale where 1 is perfect
    const normalized = {
      LCP: metrics.LCP <= benchmarks.LCP.good ? 1 : 
           metrics.LCP <= benchmarks.LCP.needsImprovement ? 0.5 : 0.1,
      FID: metrics.FID <= benchmarks.FID.good ? 1 : 
           metrics.FID <= benchmarks.FID.needsImprovement ? 0.5 : 0.1,
      CLS: metrics.CLS <= benchmarks.CLS.good ? 1 : 
           metrics.CLS <= benchmarks.CLS.needsImprovement ? 0.5 : 0.1,
      TBT: metrics.TBT <= benchmarks.TBT.good ? 1 : 
           metrics.TBT <= benchmarks.TBT.needsImprovement ? 0.5 : 0.1,
      FCP: metrics.FCP <= benchmarks.FCP.good ? 1 : 
           metrics.FCP <= benchmarks.FCP.needsImprovement ? 0.5 : 0.1
    };
    
    // Apply weightings similar to Lighthouse
    const weightedScore = (
      normalized.LCP * 25 + 
      normalized.FID * 25 + 
      normalized.CLS * 15 + 
      normalized.TBT * 25 + 
      normalized.FCP * 10
    );
    
    return Math.round(weightedScore);
  }
})();