export const validation = {
  isValidEmail: (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  isValidPhone: (phone: string) => {
    return /^\+?[\d\s-]{10,}$/.test(phone);
  },
  isRequired: (value: any) => {
    return value !== null && value !== undefined && value !== "";
  },
};
