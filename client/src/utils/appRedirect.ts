// Simulated config that would typically be fetched from the backend (Admin Settings)
export const WA_CONFIG = {
  number: "919876543210",
  defaultMessage: "Hello Judicial Study Centre, I want to know more about your courses and admission process.",
  courseMessageTemplate: "Hello Judicial Study Centre, I want details about [COURSE_NAME]."
};

export const openCourseInApp = (courseSlug: string) => {
  const deepLink = `judicialstudy://course/${courseSlug}`;
  const playStoreLink = "https://play.google.com/store/apps/details?id=com.judicialstudycentre.app";
  
  // Create a hidden iframe or use location
  // Modern browsers handle deep linking better with timeout fallbacks
  
  // Record the start time
  const start = Date.now();
  
  // Try to open the deep link
  window.location.href = deepLink;

  // Set a timeout to redirect to the Play Store if the app doesn't open
  setTimeout(() => {
    // If the browser was paused (because the app opened), the elapsed time will be much larger than 2500
    if (Date.now() - start < 3000) {
      window.location.href = playStoreLink;
    }
  }, 2500);
};

export const openWhatsApp = (courseName?: string) => {
  let text = WA_CONFIG.defaultMessage;
  
  if (courseName) {
    text = WA_CONFIG.courseMessageTemplate.replace('[COURSE_NAME]', courseName);
  }
  
  window.open(`https://wa.me/${WA_CONFIG.number}?text=${encodeURIComponent(text)}`, '_blank');
};
