

// Check if user is authenticated by verifying if user data exists and is valid in localStorage
const isAuthenticated = () => {
  const userString = localStorage.getItem('user');
  if (!userString) return false;
  
  try {
    const user = JSON.parse(userString);
    // Check if the parsed user object has the required properties
    return user && user.name && user.username && user.authStatus && user.designation;
  } catch (e) {
    // If JSON parsing fails, remove the invalid data and return false
    localStorage.removeItem('user');
    return false;
  }
};

// Get the base URL of the current site to handle deployments in subfolders
const getBaseUrl = () => {
  return window.location.origin;
};

// Check if current page is the base URL (home page)
const isHomePage = () => {
  const path = window.location.pathname;
  return path === '/' || path === '/index.html';
};

// Check if current page is the login page
const isLoginPage = () => {
  return window.location.pathname === '/index.html';
};

// Check if current page is the posps page
const isPospsPage = () => {
  return window.location.pathname === '/pages/posps.html';
};

// Redirect to a specific path
const redirectTo = (path) => {
  const baseUrl = getBaseUrl();
  window.location.href = `${baseUrl}${path}`;
};

// Main authentication check function
const checkAuthentication = () => {
  // Check if user is authenticated
  const authenticated = isAuthenticated();
  
  // Case 1: User is not authenticated and not on login page → redirect to login
  if (!authenticated && !isLoginPage()) {
    redirectTo('/index.html');
    return;
  }
  
  // Case 2: User is authenticated and on home page → redirect to posps.html
  if (authenticated && isHomePage() && !isPospsPage()) {
    redirectTo('/pages/posps.html');
    return;
  }
  
  // Case 3: User is authenticated and on login page → redirect to pages/posps.html
  if (authenticated && isLoginPage()) {
    redirectTo('/pages/posps.html');
    return;
  }
  
  // Case 4: User is authenticated and not on home/login page → allow access
  // Case 5: User is not authenticated and on login page → allow access
};

// Execute the authentication check when the script loads
// document.addEventListener('DOMContentLoaded', checkAuthentication);

(function(){
checkAuthentication()
})()