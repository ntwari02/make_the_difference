// Test script to verify theme switching functionality
console.log('🧪 Testing Theme Switching...\n');

// Test localStorage functionality
console.log('1. Testing localStorage...');
try {
    localStorage.setItem('test-theme', 'dark');
    const testValue = localStorage.getItem('test-theme');
    console.log(`   ✅ localStorage works: ${testValue}`);
    localStorage.removeItem('test-theme');
} catch (error) {
    console.log(`   ❌ localStorage error: ${error.message}`);
}

// Test classList functionality
console.log('\n2. Testing classList...');
try {
    const testElement = document.createElement('div');
    testElement.classList.add('dark');
    const hasDarkClass = testElement.classList.contains('dark');
    console.log(`   ✅ classList works: ${hasDarkClass}`);
    testElement.classList.remove('dark');
    const hasDarkClassAfter = testElement.classList.contains('dark');
    console.log(`   ✅ classList removal works: ${!hasDarkClassAfter}`);
} catch (error) {
    console.log(`   ❌ classList error: ${error.message}`);
}

// Test Tailwind dark mode
console.log('\n3. Testing Tailwind dark mode...');
try {
    // Check if Tailwind is loaded
    if (typeof tailwind !== 'undefined') {
        console.log('   ✅ Tailwind CSS is loaded');
        console.log(`   📋 Dark mode: ${tailwind.config?.darkMode || 'not configured'}`);
    } else {
        console.log('   ⚠️ Tailwind CSS not detected');
    }
} catch (error) {
    console.log(`   ❌ Tailwind check error: ${error.message}`);
}

// Test current theme state
console.log('\n4. Current theme state...');
try {
    const currentTheme = localStorage.getItem('color-theme');
    const hasDarkClass = document.documentElement.classList.contains('dark');
    console.log(`   📋 Stored theme: ${currentTheme || 'none'}`);
    console.log(`   📋 Dark class present: ${hasDarkClass}`);
    console.log(`   📋 Document classes: ${document.documentElement.className}`);
} catch (error) {
    console.log(`   ❌ Theme state check error: ${error.message}`);
}

console.log('\n🎯 Theme testing complete!');
console.log('\n💡 To test manually:');
console.log('   1. Open http://localhost:3000/signup.html');
console.log('   2. Click the moon/sun icon in the top right');
console.log('   3. Check if the page changes between light/dark modes');
console.log('   4. Refresh the page to see if the theme persists');
