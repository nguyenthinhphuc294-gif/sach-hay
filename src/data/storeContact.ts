export const storeContact = {
  area: 'Phước Tân, Biên Hòa, Đồng Nai',
  street: import.meta.env.VITE_STORE_STREET?.trim() || '',
  phone: import.meta.env.VITE_STORE_PHONE?.trim() || '',
  email: import.meta.env.VITE_STORE_EMAIL?.trim() ?? 'nguyenthinhphuc294@gmail.com',
  hours: import.meta.env.VITE_STORE_HOURS?.trim() || '',
};

export const storePhoneHref = storeContact.phone
  ? `tel:${storeContact.phone.replace(/[^+\d]/g, '')}`
  : '';
