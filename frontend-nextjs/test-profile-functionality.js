/**
 * Test Profile Functionality
 * 
 * This script tests all features and functionalities related to:
 * 1. Profile picture display in bottom-left corner
 * 2. Profile dropdown functionality
 * 3. Profile page features
 * 4. Profile update functionality
 * 5. Avatar handling
 * 6. User information display
 */

console.log('🧪 Testing Profile Functionality...\n')

// Test 1: Check if user data is properly loaded
console.log('1️⃣ Testing User Data Loading...')
try {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const token = localStorage.getItem('token')
  
  if (user && token) {
    console.log('✅ User data found in localStorage')
    console.log('   - User ID:', user._id)
    console.log('   - Name:', user.firstName, user.lastName)
    console.log('   - Email:', user.email)
    console.log('   - Avatar:', user.avatar || 'No avatar')
    console.log('   - Department:', user.department)
    console.log('   - Position:', user.position)
    console.log('   - Roles:', user.roles?.map(r => r.name).join(', ') || 'No roles')
  } else {
    console.log('❌ No user data found - user may not be logged in')
  }
} catch (error) {
  console.log('❌ Error reading user data:', error.message)
}

// Test 2: Check Profile Picture Display
console.log('\n2️⃣ Testing Profile Picture Display...')
try {
  const profilePicture = document.querySelector('[data-testid="profile-picture"], .profile-picture, img[alt*="Profile"], img[alt*="profile"]')
  if (profilePicture) {
    console.log('✅ Profile picture element found')
    console.log('   - Element:', profilePicture.tagName)
    console.log('   - Alt text:', profilePicture.alt)
    console.log('   - Source:', profilePicture.src)
    console.log('   - Classes:', profilePicture.className)
  } else {
    console.log('❌ Profile picture element not found')
  }
} catch (error) {
  console.log('❌ Error checking profile picture:', error.message)
}

// Test 3: Check Profile Dropdown
console.log('\n3️⃣ Testing Profile Dropdown...')
try {
  const profileDropdown = document.querySelector('[data-testid="profile-dropdown"], .profile-dropdown, .profile-menu')
  if (profileDropdown) {
    console.log('✅ Profile dropdown element found')
    console.log('   - Element:', profileDropdown.tagName)
    console.log('   - Classes:', profileDropdown.className)
    
    // Check dropdown items
    const dropdownItems = profileDropdown.querySelectorAll('button, a, .dropdown-item')
    console.log('   - Dropdown items found:', dropdownItems.length)
    
    dropdownItems.forEach((item, index) => {
      const text = item.textContent?.trim() || 'No text'
      const href = item.href || 'No href'
      console.log(`     ${index + 1}. ${text} (${href})`)
    })
  } else {
    console.log('❌ Profile dropdown element not found')
  }
} catch (error) {
  console.log('❌ Error checking profile dropdown:', error.message)
}

// Test 4: Check User Information Display
console.log('\n4️⃣ Testing User Information Display...')
try {
  const userInfoElements = document.querySelectorAll('[data-testid="user-info"], .user-info, .user-details')
  if (userInfoElements.length > 0) {
    console.log('✅ User information elements found:', userInfoElements.length)
    
    userInfoElements.forEach((element, index) => {
      const text = element.textContent?.trim() || 'No text'
      console.log(`   ${index + 1}. ${text}`)
    })
  } else {
    console.log('❌ No user information elements found')
  }
} catch (error) {
  console.log('❌ Error checking user information:', error.message)
}

// Test 5: Check Logout Functionality
console.log('\n5️⃣ Testing Logout Functionality...')
try {
  const logoutButton = document.querySelector('[data-testid="logout-button"], .logout-button, button[onclick*="logout"], button:contains("Logout")')
  if (logoutButton) {
    console.log('✅ Logout button found')
    console.log('   - Element:', logoutButton.tagName)
    console.log('   - Text:', logoutButton.textContent?.trim())
    console.log('   - Classes:', logoutButton.className)
    
    // Check if logout function exists
    const logoutFunction = window.logout || window.handleLogout
    if (logoutFunction) {
      console.log('   - Logout function found in global scope')
    } else {
      console.log('   - Logout function not found in global scope')
    }
  } else {
    console.log('❌ Logout button not found')
  }
} catch (error) {
  console.log('❌ Error checking logout functionality:', error.message)
}

// Test 6: Check Profile Page Navigation
console.log('\n6️⃣ Testing Profile Page Navigation...')
try {
  const profileLink = document.querySelector('a[href="/profile"], a[href*="profile"], [data-testid="profile-link"]')
  if (profileLink) {
    console.log('✅ Profile page link found')
    console.log('   - Element:', profileLink.tagName)
    console.log('   - Href:', profileLink.href)
    console.log('   - Text:', profileLink.textContent?.trim())
  } else {
    console.log('❌ Profile page link not found')
  }
} catch (error) {
  console.log('❌ Error checking profile page navigation:', error.message)
}

// Test 7: Check Avatar Fallback
console.log('\n7️⃣ Testing Avatar Fallback...')
try {
  const avatarFallback = document.querySelector('.avatar-fallback, .default-avatar, [data-testid="avatar-fallback"]')
  if (avatarFallback) {
    console.log('✅ Avatar fallback element found')
    console.log('   - Element:', avatarFallback.tagName)
    console.log('   - Classes:', avatarFallback.className)
  } else {
    console.log('❌ Avatar fallback element not found')
  }
} catch (error) {
  console.log('❌ Error checking avatar fallback:', error.message)
}

// Test 8: Check User Status Indicators
console.log('\n8️⃣ Testing User Status Indicators...')
try {
  const statusIndicators = document.querySelectorAll('.user-status, .status-indicator, [data-testid="user-status"]')
  if (statusIndicators.length > 0) {
    console.log('✅ User status indicators found:', statusIndicators.length)
    
    statusIndicators.forEach((indicator, index) => {
      const text = indicator.textContent?.trim() || 'No text'
      const classes = indicator.className
      console.log(`   ${index + 1}. ${text} (${classes})`)
    })
  } else {
    console.log('❌ No user status indicators found')
  }
} catch (error) {
  console.log('❌ Error checking user status indicators:', error.message)
}

// Test 9: Check Profile Update Functionality
console.log('\n9️⃣ Testing Profile Update Functionality...')
try {
  const updateButtons = document.querySelectorAll('button:contains("Update"), button:contains("Save"), button:contains("Edit"), [data-testid="update-profile"]')
  if (updateButtons.length > 0) {
    console.log('✅ Profile update buttons found:', updateButtons.length)
    
    updateButtons.forEach((button, index) => {
      const text = button.textContent?.trim() || 'No text'
      const classes = button.className
      console.log(`   ${index + 1}. ${text} (${classes})`)
    })
  } else {
    console.log('❌ No profile update buttons found')
  }
} catch (error) {
  console.log('❌ Error checking profile update functionality:', error.message)
}

// Test 10: Check Responsive Design
console.log('\n🔟 Testing Responsive Design...')
try {
  const isMobile = window.innerWidth < 768
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
  const isDesktop = window.innerWidth >= 1024
  
  console.log('✅ Screen size detected:')
  console.log('   - Width:', window.innerWidth, 'px')
  console.log('   - Height:', window.innerHeight, 'px')
  console.log('   - Device type:', isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop')
  
  // Check if mobile navigation is available
  const mobileNav = document.querySelector('.mobile-nav, .mobile-navigation, [data-testid="mobile-nav"]')
  if (mobileNav) {
    console.log('   - Mobile navigation found')
  } else {
    console.log('   - Mobile navigation not found')
  }
} catch (error) {
  console.log('❌ Error checking responsive design:', error.message)
}

// Test 11: Check Accessibility
console.log('\n1️⃣1️⃣ Testing Accessibility...')
try {
  const profileElements = document.querySelectorAll('[aria-label*="profile"], [aria-label*="Profile"], [role="button"]')
  if (profileElements.length > 0) {
    console.log('✅ Accessible profile elements found:', profileElements.length)
    
    profileElements.forEach((element, index) => {
      const ariaLabel = element.getAttribute('aria-label') || 'No aria-label'
      const role = element.getAttribute('role') || 'No role'
      console.log(`   ${index + 1}. Aria-label: ${ariaLabel}, Role: ${role}`)
    })
  } else {
    console.log('❌ No accessible profile elements found')
  }
} catch (error) {
  console.log('❌ Error checking accessibility:', error.message)
}

// Test 12: Check Theme Integration
console.log('\n1️⃣2️⃣ Testing Theme Integration...')
try {
  const themeToggle = document.querySelector('.theme-toggle, [data-testid="theme-toggle"], button[onclick*="theme"]')
  if (themeToggle) {
    console.log('✅ Theme toggle found')
    console.log('   - Element:', themeToggle.tagName)
    console.log('   - Classes:', themeToggle.className)
    
    // Check current theme
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    console.log('   - Current theme:', currentTheme)
  } else {
    console.log('❌ Theme toggle not found')
  }
} catch (error) {
  console.log('❌ Error checking theme integration:', error.message)
}

// Summary
console.log('\n📊 Profile Functionality Test Summary:')
console.log('=====================================')

// Count successful tests
let successCount = 0
let totalTests = 12

// Simple success counter (this is a basic implementation)
console.log(`Total tests run: ${totalTests}`)
console.log('Note: Manual verification may be required for some functionality')

console.log('\n🎯 Next Steps:')
console.log('1. Navigate to the profile page to test full functionality')
console.log('2. Test profile picture upload/change functionality')
console.log('3. Test profile information editing')
console.log('4. Test password change functionality')
console.log('5. Test notification preferences')
console.log('6. Test responsive behavior on different screen sizes')

console.log('\n✅ Profile functionality test completed!')
