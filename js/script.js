document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as minimum for date input
    const dateInput = document.getElementById('date');
    const today = new Date();
    
    // Format today's date as YYYY-MM-DD for the min attribute
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    
    // Add leading zeros if needed
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    
    const formattedDate = `${year}-${month}-${day}`;
    dateInput.setAttribute('min', formattedDate);
    
    // Add event listeners for real-time validation
    const formFields = ['name', 'email', 'mobile', 'service', 'date', 'time', 'message'];
    
    formFields.forEach(field => {
      const element = document.getElementById(field);
      if (element) {
        // Different event types for different field types
        const eventType = (field === 'service' || field === 'date') ? 'change' : 'input';
        
        element.addEventListener(eventType, function() {
          validateField(this);
          // Check if all fields are valid to highlight CAPTCHA if needed
          if (areAllFieldsValid()) {
            document.getElementById('captcha-container').classList.add('captcha-highlight');
          }
        });
      }
    });
    
    // Add specific listener for time validation when date changes
    const timeInput = document.getElementById('time');
    if (timeInput) {
      timeInput.addEventListener('change', function() {
        validateTime(this);
      });
    }
    
    // Initial validation of all fields
    validateAllFields();
  });
  
  // Check if all form fields are valid
  function areAllFieldsValid() {
    const formFields = ['name', 'email', 'mobile', 'service', 'date', 'time', 'message'];
    return formFields.every(field => {
      const element = document.getElementById(field);
      return element && !element.classList.contains('is-invalid');
    });
  }
  
  // Validation for individual fields
  function validateField(input) {
    const fieldId = input.id;
    
    switch(fieldId) {
      case 'email':
        return validateEmail(input);
      case 'mobile':
        return validateMobile(input);
      case 'date':
        const result = validateDate(input);
        // When date changes, also validate time since constraints may change
        if (document.getElementById('time')) {
          validateTime(document.getElementById('time'));
        }
        return result;
      case 'time':
        return validateTime(input);
      case 'service':
        return validateSelect(input);
      default:
        return validateRequired(input);
    }
  }
  
  // Validate all fields at once
  function validateAllFields() {
    let isValid = true;
    
    // Validate Name
    isValid = validateRequired(document.getElementById('name')) && isValid;
    
    // Validate Email
    isValid = validateEmail(document.getElementById('email')) && isValid;
    
    // Validate Mobile
    isValid = validateMobile(document.getElementById('mobile')) && isValid;
    
    // Validate Service Selection
    isValid = validateSelect(document.getElementById('service')) && isValid;
    
    // Validate Date
    isValid = validateDate(document.getElementById('date')) && isValid;
    
    // Validate Time
    isValid = validateTime(document.getElementById('time')) && isValid;
    
    // Validate Message
    isValid = validateRequired(document.getElementById('message')) && isValid;
    
    return isValid;
  }
  
  // Email validation
  function validateEmail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(input.value)) {
      input.classList.add('is-invalid');
      return false;
    } else {
      input.classList.remove('is-invalid');
      return true;
    }
  }
  
  // Mobile validation
  function validateMobile(input) {
    const mobileRegex = /^[0-9]{10}$/;  // Exactly 10 digits
    
    if (!mobileRegex.test(input.value)) {
      input.classList.add('is-invalid');
      return false;
    } else {
      input.classList.remove('is-invalid');
      return true;
    }
  }
  
  // Date validation
  function validateDate(input) {
    if (!input || !input.value) {
      input.classList.add('is-invalid');
      return false;
    }
    
    const selectedDate = new Date(input.value);
    const today = new Date();
    
    // Set both dates to midnight for proper comparison
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      input.classList.add('is-invalid');
      return false;
    } else {
      input.classList.remove('is-invalid');
      return true;
    }
  }
  
  // Time validation - new function for validating time with date context
  function validateTime(input) {
    if (!input || !input.value) {
      input.classList.add('is-invalid');
      return false;
    }
    
    const dateInput = document.getElementById('date');
    if (!dateInput || !dateInput.value) {
      // Can't validate time without date context
      input.classList.add('is-invalid');
      return false;
    }
    
    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    
    // Compare only dates (without time)
    const selectedDateOnly = new Date(selectedDate.setHours(0, 0, 0, 0));
    const todayOnly = new Date(today.setHours(0, 0, 0, 0));
    
    // If selected date is today, then we need to check if time is in the past
    if (selectedDateOnly.getTime() === todayOnly.getTime()) {
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      
      // Parse the selected time (assuming format is HH:MM)
      const [selectedHour, selectedMinute] = input.value.split(':').map(Number);
      
      // Check if selected time is in the past
      if (selectedHour < currentHour || (selectedHour === currentHour && selectedMinute < currentMinute)) {
        input.classList.add('is-invalid');
        return false;
      }
    }
    
    input.classList.remove('is-invalid');
    return true;
  }
  
  // Select validation
  function validateSelect(input) {
    if (input.value === "" || input.selectedIndex === 0) {
      input.classList.add('is-invalid');
      return false;
    } else {
      input.classList.remove('is-invalid');
      return true;
    }
  }
  
  // Required field validation
  function validateRequired(input) {
    if (!input || input.value.trim() === "") {
      if (input) input.classList.add('is-invalid');
      return false;
    } else {
      input.classList.remove('is-invalid');
      return true;
    }
  }
  
  // Check if CAPTCHA has been completed
  function isCaptchaCompleted() {
    // This is a simplified check - Netlify handles CAPTCHA verification internally
    // but we can use this to enforce the user to at least interact with the CAPTCHA
    const captchaContainer = document.getElementById('captcha-container');
    const captchaFrame = captchaContainer.querySelector('iframe');
    
    // If there's no iframe yet or user hasn't interacted with CAPTCHA
    if (!captchaFrame || !captchaFrame.getAttribute('data-hcaptcha-response')) {
      document.getElementById('captcha-feedback').style.display = 'block';
      captchaContainer.classList.add('captcha-required');
      return false;
    }
    
    document.getElementById('captcha-feedback').style.display = 'none';
    return true;
  }
  
  // Complete form validation including CAPTCHA
  function validateCompleteForm() {
    // First check all form fields
    const fieldsValid = validateAllFields();
    
    // If fields are valid, check CAPTCHA completion
    if (fieldsValid) {
      // Try to check CAPTCHA - note this is a simplified version
      try {
        // This will vary based on how Netlify CAPTCHA works
        // and might need adjustment
        const captchaContainer = document.getElementById('captcha-container');
        const captchaChecked = captchaContainer.querySelector('iframe[data-hcaptcha-response]') !== null;
        
        if (!captchaChecked) {
          // Highlight the CAPTCHA area
          document.getElementById('captcha-feedback').style.display = 'block';
          captchaContainer.classList.add('captcha-required');
          
          // Focus on CAPTCHA area
          captchaContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return false;
        }
      } catch (e) {
        console.error("Error checking CAPTCHA:", e);
        // On error, allow form submission and let Netlify handle CAPTCHA validation
      }
      
      return true;
    }
    
    // Form fields are not valid
    return false;
  }
