export function calculateCartTotals(items = []) {
  const safeItems = Array.isArray(items) ? items : [];
  const subtotal = safeItems.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
  const itemCount = safeItems.reduce((sum, item) => sum + Number(item.qty), 0);

  if (subtotal <= 0) {
    return {
      itemCount: 0,
      subtotal: 0,
      deliveryFee: 0,
      platformFee: 0,
      gst: 0,
      grandTotal: 0
    };
  }

  const deliveryFee = subtotal >= 400 ? 0 : 40;
  const platformFee = 5;
  const gst = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + deliveryFee + platformFee + gst;

  return {
    itemCount,
    subtotal,
    deliveryFee,
    platformFee,
    gst,
    grandTotal
  };
}
