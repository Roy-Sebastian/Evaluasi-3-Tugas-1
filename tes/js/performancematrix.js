(() => {
  // Only run in browsers that support the Performance API
  if (!window.performance || !window.performance.timing) return;
  
  // Performance metrics to measure
  const metrics = {
    FCP: 0,    // First Contentful Paint
    LCP: 0,    // Largest Contentful Paint
    TTI: 0,    // Time to Interactive
    TBT: 0,    // Total Blocking Time
    CLS: 0     // Cumulative Layout Shift
  };
  
  // Measure First Contentful Paint
  const fcpObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    metrics.FCP = entries[0].startTime;
    console.log('First Contentful Paint (FCP):', Math.round(metrics.FCP), 'ms');
  });
  fcpObserver.observe({ type: 'paint', buffered: true });
  
  // Measure Largest Contentful Paint
  const lcpObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    metrics.LCP = lastEntry.startTime;
    console.log('Largest Contentful Paint (LCP):', Math.round(metrics.LCP), 'ms');
  });
  lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  
  // Measure Time to Interactive (approximation)
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (window.performance.timing.domInteractive) {
        metrics.TTI = window.performance.timing.domInteractive - window.performance.timing.navigationStart;
        console.log('Time to Interactive (TTI):', Math.round(metrics.TTI), 'ms');
      }
    }, 500);
  });
  
  // Measure Cumulative Layout Shift
  const clsObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    let clsValue = 0;
    entries.forEach(entry => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });
    metrics.CLS = clsValue;
    console.log('Cumulative Layout Shift (CLS):', metrics.CLS.toFixed(3));
  });
  clsObserver.observe({ type: 'layout-shift', buffered: true });
  
  // Calculate Total Blocking Time (simplified)
  let longTasksTotal = 0;
  const tbtObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    entries.forEach(entry => {
      const blockingTime = entry.duration - 50; // Tasks over 50ms block the main thread
      if (blockingTime > 0) {
        longTasksTotal += blockingTime;
        metrics.TBT = longTasksTotal;
        console.log('Updated Total Blocking Time (TBT):', Math.round(metrics.TBT), 'ms');
      }
    });
  });
  tbtObserver.observe({ type: 'longtask', buffered: true });
  
  // Report all metrics to console when page is fully loaded
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('-------- PERFORMANCE METRICS SUMMARY --------');
      console.log('First Contentful Paint (FCP):', Math.round(metrics.FCP), 'ms');
      console.log('Largest Contentful Paint (LCP):', Math.round(metrics.LCP), 'ms');
      console.log('Time to Interactive (TTI):', Math.round(metrics.TTI), 'ms');
      console.log('Total Blocking Time (TBT):', Math.round(metrics.TBT), 'ms');
      console.log('Cumulative Layout Shift (CLS):', metrics.CLS.toFixed(3));
      console.log('-------------------------------------------');
    }, 3000); // Give time for metrics to collect
  });
  
})();