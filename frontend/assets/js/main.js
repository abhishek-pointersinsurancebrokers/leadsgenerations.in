



(function () {
  // Create a placeholder for the header
  const headerPlaceholder = document.createElement("div");
  headerPlaceholder.id = "header-placeholder";

  // Insert the placeholder at the beginning of the body
  document.write('<div id="header-placeholder"></div>');

  // Store notifications globally for search functionality
  let allNotifications = [];
  
  // Track if search input is focused
  let isSearchFocused = false;
  
  // Track previous window width to distinguish between keyboard and orientation changes
  let previousWindowWidth = window.innerWidth;

  // Function to initialize profile dropdown
  function initializeProfileDropdown() {
    const profileToggle = document.getElementById("profile-toggle");
    const profileDropdown = document.getElementById("profile-dropdown");

    if (profileToggle && profileDropdown) {
      // Toggle dropdown when profile image is clicked
      profileToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        profileDropdown.classList.toggle("hidden");

        // Close other dropdowns if open
        closeNotificationDropdown();
        closeSupportDropdown();
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", function (e) {
        if (
          !profileToggle.contains(e.target) &&
          !profileDropdown.contains(e.target)
        ) {
          profileDropdown.classList.add("hidden");
        }
      });

      // Close dropdown when clicking on a link inside it
      const dropdownLinks = profileDropdown.querySelectorAll("a");
      dropdownLinks.forEach((link) => {
        link.addEventListener("click", function () {
          profileDropdown.classList.add("hidden");
        });
      });
    }
  }

  // Function to close notification dropdown
  function closeNotificationDropdown() {
    const notificationDropdown = document.getElementById(
      "notification-dropdown"
    );

    if (notificationDropdown) {
      if (window.innerWidth < 768) {
        // Mobile view
        notificationDropdown.classList.add("translate-x-full");
        // Add a small delay before hiding to allow the transition to complete
        setTimeout(() => {
          notificationDropdown.classList.add("hidden");
        }, 300);
      } else {
        // Desktop view
        notificationDropdown.classList.add("hidden");
      }
    }
  }

  // Function to close support dropdown
  function closeSupportDropdown() {
    const supportDropdown = document.getElementById("support-dropdown");
    if (supportDropdown && !supportDropdown.classList.contains("hidden")) {
      supportDropdown.classList.add("hidden");
    }
  }

  // Function to initialize notification dropdown
  function initializeNotificationDropdown() {
    const notificationToggle = document.getElementById("notification-toggle");
    const notificationDropdown = document.getElementById(
      "notification-dropdown"
    );
    const closeNotificationMobile = document.getElementById(
      "close-notification-mobile"
    );
    const searchInput = document.getElementById("notification-search");

    if (notificationToggle && notificationDropdown) {
      // Toggle dropdown when notification icon is clicked
      notificationToggle.addEventListener("click", function (e) {
        e.stopPropagation();

        // Close other dropdowns if open
        const profileDropdown = document.getElementById("profile-dropdown");
        if (profileDropdown && !profileDropdown.classList.contains("hidden")) {
          profileDropdown.classList.add("hidden");
        }

        const supportDropdown = document.getElementById("support-dropdown");
        if (supportDropdown && !supportDropdown.classList.contains("hidden")) {
          supportDropdown.classList.add("hidden");
        }

        // Handle mobile vs desktop behavior
        if (window.innerWidth < 768) {
          // Mobile view
          if (notificationDropdown.classList.contains("hidden")) {
            notificationDropdown.classList.remove("hidden");
            // Trigger reflow to ensure the transition works
            notificationDropdown.offsetHeight;
            notificationDropdown.classList.remove("translate-x-full");
          } else {
            closeNotificationDropdown();
          }
        } else {
          // Desktop view
          notificationDropdown.classList.toggle("hidden");
        }
      });

      // Track search input focus
      if (searchInput) {
        searchInput.addEventListener("focus", function() {
          isSearchFocused = true;
        });
        
        searchInput.addEventListener("blur", function() {
          isSearchFocused = false;
        });
      }

      // Close dropdown when clicking the mobile close button
      if (closeNotificationMobile) {
        closeNotificationMobile.addEventListener("click", function (e) {
          e.stopPropagation();
          closeNotificationDropdown();
        });
      }

      // Close dropdown when clicking outside (desktop only)
      document.addEventListener("click", function (e) {
        if (window.innerWidth >= 768) {
          // Only on desktop
          if (
            !notificationToggle.contains(e.target) &&
            !notificationDropdown.contains(e.target)
          ) {
            notificationDropdown.classList.add("hidden");
          }
        }
      });

      // Handle window resize - improved to distinguish between keyboard and orientation changes
      window.addEventListener("resize", function () {
        const currentWidth = window.innerWidth;
        
        // Only close dropdown if width changes significantly (orientation change) and search is not focused
        if (Math.abs(currentWidth - previousWindowWidth) > 100 && !isSearchFocused) {
          if (currentWidth >= 768) {
            // Switching to desktop
            notificationDropdown.classList.remove("translate-x-full");
            notificationDropdown.classList.add("hidden");
          } else {
            // Switching to mobile
            if (!notificationDropdown.classList.contains("hidden")) {
              notificationDropdown.classList.add("translate-x-full");
              setTimeout(() => {
                notificationDropdown.classList.add("hidden");
              }, 300);
            }
          }
        }
        
        // Update previous width
        previousWindowWidth = currentWidth;
      });
    }
  }

  // Function to initialize support dropdown
  function initializeSupportDropdown() {
    const supportToggle = document.getElementById("support-toggle");
    const supportDropdown = document.getElementById("support-dropdown");
    const phoneIcon = document.querySelector(".fa-phone").parentElement;

    // Support contact information
    const supportContacts = {
      "sales-manager": {
        name: "Sales Manager",
        number: `+91 ${
          JSON.parse(localStorage.getItem("user")).salesManagerPhone
        }`,
      },
      "sales-support": {
        name: "Abhishek Badetiya",
        number: "+91 8306786793",
      },
      "health-support": {
        name: "Mahendra Chauhan",
        number: "+91 9257115070",
      },
      "non-motor-support": {
        name: "Maneet Gupta",
        number: "+91 9257106253",
      },
    };

    if (supportToggle && supportDropdown) {
      // Toggle dropdown when support icon is clicked
      supportToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        supportDropdown.classList.toggle("hidden");

        // Close other dropdowns if open
        const profileDropdown = document.getElementById("profile-dropdown");
        if (profileDropdown && !profileDropdown.classList.contains("hidden")) {
          profileDropdown.classList.add("hidden");
        }

        closeNotificationDropdown();
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", function (e) {
        if (
          !supportToggle.contains(e.target) &&
          !supportDropdown.contains(e.target)
        ) {
          supportDropdown.classList.add("hidden");
        }
      });

      // Add click event to support items
      const supportItems = supportDropdown.querySelectorAll(".support-item");
      supportItems.forEach((item) => {
        item.addEventListener("click", function () {
          // Remove highlight from all items (reset to default state)
          supportItems.forEach((i) => {
            const iconDiv = i.querySelector("div");
            const title = i.querySelector("h4");

            // Reset border color
            iconDiv.classList.remove("border-orange-500");
            iconDiv.classList.add("border-orange-200");

            // Reset icon color
            const icon = iconDiv.querySelector("i");
            icon.classList.remove("text-orange-500");
            icon.classList.add("text-orange-200");

            // Reset text color
            title.classList.remove("text-orange-500");
            title.classList.add("text-orange-200");
          });

          // Add highlight to clicked item
          const iconDiv = this.querySelector("div");
          const title = this.querySelector("h4");

          // Set border color
          iconDiv.classList.remove("border-orange-200");
          iconDiv.classList.add("border-orange-500");

          // Set icon color
          const icon = iconDiv.querySelector("i");
          icon.classList.remove("text-orange-200");
          icon.classList.add("text-orange-500");

          // Set text color
          title.classList.remove("text-orange-200");
          title.classList.add("text-orange-500");

          // Update contact information
          const supportType = this.getAttribute("data-support-type");
          const contact = supportContacts[supportType];

          document.getElementById("support-name").textContent = contact.name;
          document.getElementById("support-number").textContent =
            contact.number;
        });
      });

      if (phoneIcon) {
        phoneIcon.addEventListener("click", function (e) {
          e.stopPropagation(); // Prevent dropdown from closing

          // Get the current phone number from the support-number element
          const phoneNumber = document
            .getElementById("support-number")
            .textContent.trim();

          // Open the phone dialer with the number
          if (phoneNumber) {
            // Create a temporary link element to trigger the tel: protocol
            const dialLink = document.createElement("a");
            dialLink.href = `tel:${phoneNumber}`;
            dialLink.click();
          }
        });
      }

      // Set default selection to Sales Manager
      const defaultItem = supportDropdown.querySelector(
        '[data-support-type="sales-manager"]'
      );
      if (defaultItem) {
        // Simulate click on the default item to set it as selected
        defaultItem.click();
      }
    }
  }

  function closeDropdown(id) {
    const el = document.getElementById(id);
    if (el && !el.classList.contains("hidden")) {
      el.classList.add("hidden");
    }
  }

  // ---------------- Notification Functions ----------------

  // Escape HTML to prevent injection
  function escapeHtml(str) {
    if (!str && str !== 0) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Format ISO date to "14 Nov 2025, 03:00 PM"
  function formatDate(isoDate) {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Render notifications in bell dropdown with search functionality
  function renderBellNotifications(data, searchTerm = "") {
    const list = document.getElementById("notification-list");
    if (!list) return;

    // Remove loading placeholder
    const loading = document.getElementById("notification-loading");
    if (loading) loading.remove();

    // Clear existing notifications
    list.innerHTML = "";

    // Filter notifications based on search term
    let filteredData = data;
    if (searchTerm) {
      filteredData = data.filter((item) => {
        const title = item.title ? item.title.toLowerCase() : "";
        const message = item.message ? item.message.toLowerCase() : "";
        return (
          title.includes(searchTerm.toLowerCase()) ||
          message.includes(searchTerm.toLowerCase())
        );
      });
    }

    if (!Array.isArray(filteredData) || filteredData.length === 0) {
      list.innerHTML =
        '<div class="p-4 text-center text-sm text-gray-500">No notifications found</div>';
      return;
    }

    filteredData.forEach((item) => {
      const div = document.createElement("div");
      div.className =
        "notification-item p-4 border-b hover:bg-gray-50 cursor-pointer";
      div.innerHTML = `
        <h4 class="text-sm font-medium text-gray-800">${escapeHtml(
          item.title
        )}</h4>
        <p class="text-xs text-gray-600 mt-1">${escapeHtml(item.message)}</p>
        <p class="text-xs text-gray-500 mt-2"><i class="far fa-clock mr-1"></i>${formatDate(
          item.createdAt
        )}</p>
      `;
      list.appendChild(div);
    });
  }

  // Render recent notifications section on home page (last 5 only)
  function renderRecentNotifications(data) {
    const container = document.querySelector("section div.shadow");
    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML =
        '<div class="p-4 text-center text-sm text-gray-500">No notifications</div>';
      return;
    }

    // ---------------- Get the 5 most recent notifications ----------------
    // 1. Sort all notifications by creation date (newest first)
    // 2. Take the top 5 from the sorted list
    const mostRecentFive = data
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    if (mostRecentFive.length === 0) {
      container.innerHTML =
        '<div class="p-4 text-center text-sm text-gray-500">No notifications found</div>';
      return;
    }

    // Sort the 5 most recent notifications to put active ones first
    const sortedData = mostRecentFive.slice().sort((a, b) => {
      const aActive = a.status === "active";
      const bActive = b.status === "active";
      return bActive - aActive;
    });

    sortedData.forEach((item) => {
      const isActive = item.status === "active";
      const div = document.createElement("div");
      div.className =
        "notification-item p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center transition-shadow";
      div.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center w-full">
        <div class="flex-1">
          <div class="flex justify-between items-center sm:block">
            <h3 class="font-medium text-gray-800 text-sm sm:text-base">${escapeHtml(
              item.title
            )}</h3>
            ${
              isActive
                ? '<span class="flex sm:hidden border border-red-500 text-red-600 text-xs font-medium px-2 py-1 rounded-xl">New</span>'
                : ""
            }
          </div>
          <p class="text-xs sm:text-sm text-gray-600 mt-1">${escapeHtml(
            item.message
          )}</p>
        </div>
        <div class="hidden sm:flex flex-col items-end text-xs sm:text-sm text-gray-500 mt-1 sm:mt-0 space-y-2">
          ${
            isActive
              ? '<span class="border border-red-500 text-red-600 text-xs font-medium px-2 py-1 rounded-xl mb-1">New</span>'
              : ""
          }
          <div class="flex items-center justify-end">
            <i class="far fa-clock mr-1"></i>
            <span>${formatDate(item.createdAt)}</span>
          </div>
        </div>
      </div>
      <div class="flex sm:hidden items-center text-xs text-gray-500 mt-2">
        <i class="far fa-clock mr-1"></i>
        <span>${formatDate(item.createdAt)}</span>
      </div>
    `;
      container.appendChild(div);
      container.appendChild(document.createElement("hr"));
    });
  }

  // Update bell badge count
  function updateNotificationCount(data) {
    const badge = document.getElementById("notification-count");
    if (!badge) return;

    // ---------------- Hide the bell badge completely ----------------
    badge.style.display = "none";
  }

  // Initialize search functionality
  function initializeNotificationSearch() {
    const searchInput = document.getElementById("notification-search");
    if (!searchInput) return;

    let searchTimeout;

    // Add input event listener with debouncing
    searchInput.addEventListener("input", function (e) {
      clearTimeout(searchTimeout);
      const searchTerm = e.target.value.trim();

      // Debounce search to avoid excessive re-renders
      searchTimeout = setTimeout(() => {
        renderBellNotifications(allNotifications, searchTerm);
      }, 300);
    });
  }

  // Load notifications from API
  function loadNotificationsFromAPI() {
    const API_URL =
      "https://leadsgenerations.in/noti/api/notifications/public/active";
    const list = document.getElementById("notification-list");

    // Show loading
    if (list) {
      list.innerHTML =
        '<div id="notification-loading" class="p-4 text-center text-sm text-gray-500">Loading...</div>';
    }

    return fetch(API_URL)
      .then((resp) => resp.json())
      .then((json) => {
        const data = Array.isArray(json) ? json : json.data || [];
        allNotifications = data; // Store globally for search
        renderBellNotifications(data); // Bell dropdown shows all notifications
        renderRecentNotifications(data); // Recent section shows last 10 days only
        updateNotificationCount(data); // Badge hidden
        initializeNotificationSearch(); // Initialize search functionality
        return data;
      })
      .catch((err) => {
        console.error("Error fetching notifications:", err);
        if (list)
          list.innerHTML =
            '<div class="p-4 text-center text-sm text-red-500">Could not load notifications</div>';
        updateNotificationCount([]);
        return [];
      });
  }

  // ---------------- Fetch Header & Initialize ----------------

  fetch("/components/header.html")
    .then((response) => response.text())
    .then((html) => {
      if (!html || html.trim() === "") {
        console.error("Header fetch returned EMPTY HTML");
        return;
      }

      document.getElementById("header-placeholder").innerHTML = html;

      initializeProfileDropdown();
      initializeNotificationDropdown();
      initializeSupportDropdown();

      // Load notifications from API and populate both bell and recent sections
      loadNotificationsFromAPI();

      // ✅ Now that header is in DOM, set user name/username
      setUserInfoFromLocalStorage();
    })
    .catch((error) => {
      console.error("Error loading header:", error);
    });

  if (!window.location.pathname.endsWith("guide-lines.html")) {
    // Load Guidelines Component Dynamically
    fetch("/components/guidelines.html")
      .then((response) => response.text())
      .then((html) => {
        if (!html.trim()) {
          console.error("Guidelines HTML is empty");
          return;
        }

        // Create a placeholder at the end of body (before closing </body>)
        let placeholder = document.getElementById("guidelines-placeholder");
        if (!placeholder) {
          placeholder = document.createElement("div");
          placeholder.id = "guidelines-placeholder";
          document.body.appendChild(placeholder);
        }

        placeholder.innerHTML = html;

        // Initialize Toggle Functionality
        initializeGuidelinesToggle();
      })
      .catch((err) => console.error("Error loading guidelines:", err));

    function initializeGuidelinesToggle() {
      const toggleBtn = document.getElementById("toggleGuidelines");
      const section = document.getElementById("guidelinesSection");
      const text = document.getElementById("toggleText");
      const chevron = document.getElementById("chevronIcon");

      if (!toggleBtn || !section || !text || !chevron) return;

      toggleBtn.addEventListener("click", () => {
        const isHidden = section.classList.contains("hidden");

        if (isHidden) {
          // Show
          section.classList.remove("hidden");
          text.textContent = "Hide Guidelines";
          chevron.classList.add("rotate-180");
        } else {
          // Hide
          section.classList.add("hidden");
          text.textContent = "Show Guidelines";
          chevron.classList.remove("rotate-180");
        }
      });
    }
  }
})();

function setUserInfoFromLocalStorage() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return; // no user, maybe on login page

  let userData;
  try {
    userData = JSON.parse(userStr);
  } catch (e) {
    console.error("Invalid user data in localStorage", e);
    return;
  }

  const nameEl = document.getElementById("name");
  const usernameEl = document.getElementById("username");

  if (nameEl) {
    nameEl.innerText = userData.name || "";
  }
  if (usernameEl) {
    usernameEl.innerText = userData.username || "";
  }
}

// Logout function
async function logout() {
  try {
    // Show loading state
    const logoutBtn = document.querySelector('a[onclick="logout()"]');
    if (logoutBtn) {
      logoutBtn.disabled = true;
      logoutBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Signing out...';
    }

    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (!userData) {
      console.error("No user data found in localStorage");
      window.location.href = "/index.html";
      return;
    }

    const user = JSON.parse(userData);
    const phoneNumber = user.phoneNumber;

    // Call logout endpoint
    // const response = await fetch('http://localhost:12000/auth/logout', {
    const response = await fetch(
      "https://leadsgenerations.in/api/auth/logout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      }
    );

    const data = await response.json();

    // Always clear localStorage and redirect, even if the API call fails
    // This ensures the user is logged out on the client side
    localStorage.removeItem("user");
    window.location.href = "/index.html";

    if (!data.success) {
      console.warn("Server logout failed:", data.message);
      // But we still redirect since client-side logout is done
    }
  } catch (error) {
    console.error("Error during logout:", error);
    // Even if there's an error, clear localStorage and redirect
    localStorage.removeItem("user");
    window.location.href = "/index.html";
  }
}

// Function to create and inject the footer with toggle functionality using icons
function addDisclaimerFooter() {
  // Check if footer already exists to prevent duplicates
  if (document.getElementById("disclaimer-footer")) return;

  // Create footer element
  const footer = document.createElement("footer");
  footer.id = "disclaimer-footer";

  // Add styles - reduced height when closed
  footer.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #f8f9fa;
    padding: 5px 10px;
    text-align: center;
    font-size: 12px;
    color: #6c757d;
    border-top: 1px solid #dee2e6;
    z-index: 1000;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    height: 40px;
    overflow: hidden;
  `;

  // Create toggle button with icon
  const toggleBtn = document.createElement("button");
  toggleBtn.style.cssText = `
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    transition: transform 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin: 0 auto;
  `;

  // Create SVG icons
  const chevronDown = `
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
    </svg>
  `;

  const chevronUp = `
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
    </svg>
  `;

  // Set initial icon
  toggleBtn.innerHTML = chevronDown;

  // Create disclaimer content container
  const contentDiv = document.createElement("div");
  contentDiv.id = "disclaimer-content";
  contentDiv.style.cssText = `
    max-width: 1200px;
    margin: 0 auto;
    padding: 5px 15px 10px;
    display: none;
    text-align: center;
    line-height: 1.4;
    overflow: hidden;
    transition: max-height 0.3s ease;
    max-height: 0;
  `;

  // Add disclaimer text
  contentDiv.innerHTML = `
<span class="text-red-600">* Disclaimer *</span><br>  The information on this portal is indicative and for reference only. This portal does not promote, advertise, or solicit any payouts, commissions, or financial incentives. All information is provided solely for informational purposes and to assist in understanding insurance products, without implying any benefit, recommendation, or endorsement. Accuracy is not guaranteed, and this does not constitute legal, financial, or insurance advice. Content may change without notice, and the portal is not liable for any damages arising from its use. All material is proprietary and cannot be reproduced without permission.  `;

  // Add toggle functionality
  toggleBtn.addEventListener("click", function () {
    if (contentDiv.style.display === "none") {
      // Show content
      footer.style.height = "auto";
      footer.style.padding = "10px";
      contentDiv.style.display = "block";
      setTimeout(() => {
        contentDiv.style.maxHeight = contentDiv.scrollHeight + "px";
      }, 10);
      toggleBtn.innerHTML = chevronUp;
      toggleBtn.style.transform = "rotate(180deg)";
      document.body.style.paddingBottom = "120px";
      localStorage.setItem("disclaimerVisible", "true");
    } else {
      // Hide content
      contentDiv.style.maxHeight = "0";
      toggleBtn.innerHTML = chevronDown;
      toggleBtn.style.transform = "rotate(0deg)";
      document.body.style.paddingBottom = "40px";
      localStorage.setItem("disclaimerVisible", "false");

      // Hide after transition completes and reduce footer height
      setTimeout(() => {
        contentDiv.style.display = "none";
        footer.style.height = "40px";
        footer.style.padding = "5px 10px";
      }, 300);
    }
  });

  // Add hover effect to button
  toggleBtn.addEventListener("mouseenter", function () {
    this.style.backgroundColor = "rgba(108, 117, 125, 0.1)";
  });

  toggleBtn.addEventListener("mouseleave", function () {
    this.style.backgroundColor = "transparent";
  });

  // Append elements to footer
  footer.appendChild(toggleBtn);
  footer.appendChild(contentDiv);

  // Add to page
  document.body.appendChild(footer);

  // Set initial body padding
  document.body.style.paddingBottom = "40px";

  // Check localStorage for saved state
  const disclaimerState = localStorage.getItem("disclaimerVisible");
  if (disclaimerState === "true") {
    footer.style.height = "auto";
    footer.style.padding = "10px";
    contentDiv.style.display = "block";
    setTimeout(() => {
      contentDiv.style.maxHeight = contentDiv.scrollHeight + "px";
    }, 10);
    toggleBtn.innerHTML = chevronUp;
    toggleBtn.style.transform = "rotate(180deg)";
    document.body.style.paddingBottom = "120px";
  }
}

// Add the disclaimer footer when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  addDisclaimerFooter();

  const user = JSON.parse(localStorage.getItem("user"));
  const designation = user?.designation;

  if (designation === "SS") {
    document.getElementById("grid-notification-link")?.classList.remove("hidden");
    document.getElementById("broadcast-message-link")?.classList.remove("hidden");
  }


});