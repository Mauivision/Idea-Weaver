// Performance Testing Script for Drag Functionality
// Run this in the browser console to test smooth movement

console.log('🚀 Starting drag performance tests...');

// Test 1: Frame Rate Monitor
let frameCount = 0;
let lastTime = performance.now();

function monitorFrameRate() {
  frameCount++;
  const currentTime = performance.now();

  if (currentTime - lastTime >= 1000) {
    console.log(`📊 FPS: ${frameCount}`);
    frameCount = 0;
    lastTime = currentTime;
  }

  requestAnimationFrame(monitorFrameRate);
}

// Test 2: Drag Performance Test
function testDragPerformance() {
  console.log('🧪 Testing drag performance...');

  // Simulate heavy DOM operations
  const startTime = performance.now();

  for (let i = 0; i < 1000; i++) {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = Math.random() * 1000 + 'px';
    div.style.top = Math.random() * 1000 + 'px';
    div.style.width = '100px';
    div.style.height = '100px';
    div.style.backgroundColor = `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`;
  }

  const endTime = performance.now();
  console.log(`⚡ DOM creation test: ${endTime - startTime}ms`);

  if (endTime - startTime < 100) {
    console.log('✅ Excellent performance!');
  } else if (endTime - startTime < 300) {
    console.log('⚠️ Good performance, but could be optimized');
  } else {
    console.log('❌ Performance needs improvement');
  }
}

// Test 3: Memory Usage Monitor
function monitorMemoryUsage() {
  if ('memory' in performance) {
    const memory = performance.memory;
    console.log(`💾 Memory Usage: ${Math.round(memory.usedJSHeapSize / 1048576)}MB / ${Math.round(memory.jsHeapSizeLimit / 1048576)}MB`);
  }
}

// Test 4: Canvas Performance Test (for EnhancedMindMap)
function testCanvasPerformance() {
  console.log('🎨 Testing canvas performance...');

  const canvas = document.createElement('canvas');
  canvas.width = 2000;
  canvas.height = 2000;
  const ctx = canvas.getContext('2d');

  const startTime = performance.now();

  // Simulate drawing many nodes and connections
  for (let i = 0; i < 100; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * 2000, Math.random() * 2000, 30, 0, 2 * Math.PI);
    ctx.fillStyle = `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`;
    ctx.fill();
    ctx.stroke();
  }

  const endTime = performance.now();
  console.log(`🎨 Canvas drawing test: ${endTime - startTime}ms`);

  canvas.remove();
}

// Test 5: CSS Transform Performance
function testTransformPerformance() {
  console.log('🔄 Testing CSS transform performance...');

  const testElement = document.createElement('div');
  testElement.style.position = 'absolute';
  testElement.style.width = '100px';
  testElement.style.height = '100px';
  testElement.style.backgroundColor = 'red';
  testElement.style.transform = 'translate3d(0, 0, 0)';
  document.body.appendChild(testElement);

  const startTime = performance.now();

  // Test transform performance
  for (let i = 0; i < 1000; i++) {
    testElement.style.transform = `translate3d(${i}px, ${i}px, 0)`;
  }

  const endTime = performance.now();
  console.log(`🔄 Transform test: ${endTime - startTime}ms`);

  document.body.removeChild(testElement);
}

// Test 6: Event Handler Performance
function testEventPerformance() {
  console.log('📡 Testing event handler performance...');

  let eventCount = 0;
  const startTime = performance.now();

  function handleEvent() {
    eventCount++;
  }

  // Add and remove many event listeners
  for (let i = 0; i < 100; i++) {
    window.addEventListener('mousemove', handleEvent);
  }

  for (let i = 0; i < 100; i++) {
    window.removeEventListener('mousemove', handleEvent);
  }

  const endTime = performance.now();
  console.log(`📡 Event handling test: ${endTime - startTime}ms`);
  console.log(`📊 Events processed: ${eventCount}`);
}

// Test 7: React Re-render Test
function testReactPerformance() {
  console.log('⚛️ Testing React performance...');

  const React = window.React;
  if (React) {
    const startTime = performance.now();

    // Simulate component updates
    for (let i = 0; i < 100; i++) {
      React.createElement('div', { key: i }, `Item ${i}`);
    }

    const endTime = performance.now();
    console.log(`⚛️ React test: ${endTime - startTime}ms`);
  } else {
    console.log('⚛️ React not available in this context');
  }
}

// Run all tests
console.log('🔬 Running comprehensive performance tests...\n');

// Start frame rate monitoring
monitorFrameRate();

setTimeout(() => {
  testDragPerformance();
  testCanvasPerformance();
  testTransformPerformance();
  testEventPerformance();
  testReactPerformance();
  monitorMemoryUsage();

  console.log('\n🏁 Performance test complete!');
  console.log('💡 Tips for better performance:');
  console.log('1. Use transform3d instead of transform for hardware acceleration');
  console.log('2. Use will-change property for elements that will animate');
  console.log('3. Minimize DOM manipulations during drag operations');
  console.log('4. Use requestAnimationFrame for smooth animations');
  console.log('5. Consider React.memo for components that re-render frequently');
}, 2000);

// Instructions for manual testing
console.log('\n📋 Manual Testing Instructions:');
console.log('1. Switch to Graph view and drag nodes around');
console.log('2. Switch to Mindmap view and test connected node dragging');
console.log('3. Open DevTools → Performance tab and record while dragging');
console.log('4. Look for frame drops (red bars in timeline)');
console.log('5. Check memory usage in Memory tab');
console.log('6. Test on different zoom levels and screen sizes');
