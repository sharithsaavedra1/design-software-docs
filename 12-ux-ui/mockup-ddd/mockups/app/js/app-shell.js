/**
 * SENA Mockup App Shell Logic
 * Handles generic interactions like dropdowns, modals, sidebars, and tabs.
 */

document.addEventListener('DOMContentLoaded', () => {
  initDropdowns();
  initSidebar();
  initModals();
  initTabs();
  initToasts();
  initPagination();
});

/**
 * Handle all dropdown toggles (user menu, notifications, actions)
 */
function initDropdowns() {
  const toggleButtons = document.querySelectorAll('[data-toggle="dropdown"]');
  
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = btn.getAttribute('data-target');
      const targetDropdown = document.getElementById(targetId);
      
      // Close others first
      document.querySelectorAll('.dropdown-menu.active').forEach(dropdown => {
        if (dropdown.id !== targetId) {
          dropdown.classList.remove('active');
        }
      });
      
      if (targetDropdown) {
        targetDropdown.classList.toggle('active');
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.dropdown-menu.active').forEach(dropdown => {
      // Check if click was outside the dropdown and its toggle button
      const toggleBtn = document.querySelector(`[data-target="${dropdown.id}"]`);
      if (!dropdown.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
        dropdown.classList.remove('active');
      }
    });
  });
}

/**
 * Handle sidebar mobile toggle
 */
function initSidebar() {
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }
}

/**
 * Handle Modals
 */
function initModals() {
  const modalTriggers = document.querySelectorAll('[data-toggle="modal"]');
  const modalCloseBtns = document.querySelectorAll('.modal-close, [data-dismiss="modal"]');
  
  modalTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      const targetModal = document.getElementById(targetId);
      
      if (targetModal) {
        targetModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
      }
    });
  });
  
  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });
  
  // Close on backdrop click
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal) {
        activeModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });
}

/**
 * Handle Tabs navigation
 */
function initTabs() {
  const tabContainers = document.querySelectorAll('.tabs');
  
  tabContainers.forEach(container => {
    const tabs = container.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs in this container
        tabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Handle content switching if data-target is provided
        const targetId = tab.getAttribute('data-target');
        if (targetId) {
          const contentId = targetId.replace('#', '');
          // Find all tab contents related to this group and hide them
          // Implementation depends on HTML structure, assuming generic hide/show logic
          document.querySelectorAll('.tab-content').forEach(content => {
             content.classList.add('hidden');
          });
          
          const targetContent = document.getElementById(contentId);
          if(targetContent) {
              targetContent.classList.remove('hidden');
          }
        }
      });
    });
  });
}

/**
 * Handle Toast Notifications
 */
function initToasts() {
  const toastCloseBtns = document.querySelectorAll('.toast-close');
  
  toastCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const toast = btn.closest('.toast');
      if (toast) {
        toast.style.display = 'none';
      }
    });
  });
  
  // Auto-hide logic can be called globally
  window.showToast = function(message, type = 'info', duration = 3000) {
    // Basic implementation for programmatic toasts
    console.log(`Toast [${type}]: ${message}`);
  };
}

/**
 * Handle Pagination UI clicks
 */
function initPagination() {
  const pageBtns = document.querySelectorAll('.pagination-btn[data-page]');
  
  pageBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Prevent click if disabled
        if(btn.disabled) return;
        
        const container = btn.closest('.pagination-controls');
        if(container) {
            // Remove active from peers
            container.querySelectorAll('.pagination-btn[data-page]').forEach(b => {
                b.classList.remove('active');
            });
            // Add active
            btn.classList.add('active');
        }
    });
  });
}
