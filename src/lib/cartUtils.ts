import { useCartStore } from "@/store";

// Utility functions for cart operations
export const addReportToCart = (report: {
  id: string;
  title: string;
  price?: number;
  category?: string;
}) => {
  useCartStore.getState().addItem(report);
};

export const removeReportFromCart = (reportId: string) => {
  useCartStore.getState().removeItem(reportId);
};

export const clearCart = () => {
  useCartStore.getState().clearCart();
};

export const getCartItemCount = () => {
  return useCartStore.getState().getItemCount();
};

export const isReportInCart = (reportId: string) => {
  const items = useCartStore.getState().items;
  return items.some(item => item.id === reportId);
};
