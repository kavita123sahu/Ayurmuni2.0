

export const EmailValidator = (email: string) => {
  // Basic format check
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Check if it ends with proper domain extensions
  const validDomains = [
    '@gmail.com',
    '@yahoo.com', 
    '@hotmail.com',
    '@outlook.com',
    '@rediffmail.com',
    '@yahoo.co.in'
  ];
  
  // Check if email ends with any valid domain
  return validDomains.some(domain => email.toLowerCase().endsWith(domain));
};

