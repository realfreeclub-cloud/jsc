export const getTestSeriesWhatsAppUrl = (exam: any, user: any): string => {
  const defaultNumber = '919450614241';
  let targetNumber = (exam?.whatsappNumber || defaultNumber).replace(/[^0-9]/g, '');
  if (!targetNumber.startsWith('91') && targetNumber.length === 10) {
    targetNumber = `91${targetNumber}`;
  }
  if (targetNumber.length < 10) {
    targetNumber = defaultNumber;
  }

  const studentName = user?.name || 'Student';
  const studentEmail = user?.email || '';
  const studentPhone = user?.phone || '';
  const examTitle = exam?.title || 'Test Series';
  const priceVal = exam?.discountedPrice || exam?.pricing || 0;
  const priceText = priceVal > 0 ? `₹${priceVal}` : 'As specified';

  let message = exam?.whatsappEnrollmentMessage;
  if (message && message.trim().length > 0) {
    message = message
      .replace(/\[name\]/gi, studentName)
      .replace(/\[email\]/gi, studentEmail)
      .replace(/\[phone\]/gi, studentPhone)
      .replace(/\[title\]/gi, examTitle)
      .replace(/\[exam\]/gi, examTitle)
      .replace(/\[price\]/gi, priceText);
  } else {
    message = `Hello Sir, I want to purchase this Test Series:\n\n• Student Name: ${studentName}\n• Test Series: ${examTitle}\n• Price: ${priceText}\n• Registered Email: ${studentEmail}${studentPhone ? `\n• Phone: ${studentPhone}` : ''}\n\nSir, I want to purchase this. Please share the payment details to activate my access. Thank you!`;
  }

  return `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
};
