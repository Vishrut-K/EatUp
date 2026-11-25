/**
 * EatUp Server-Authoritative Billing & Group Split Service
 *
 * Preserves exact EatUp solo billing math:
 * - deliveryFee: ₹0 when subtotal >= ₹400, else ₹40 (0 when empty)
 * - platformFee: ₹5 when subtotal > 0, else ₹0
 * - gst: Math.round(subtotal * 0.05)
 * - grandTotal: subtotal + deliveryFee + platformFee + gst
 */

export const FREE_DELIVERY_THRESHOLD = 400;
export const BASE_DELIVERY_FEE = 40;
export const PLATFORM_FEE = 5;
export const GST_RATE = 0.05;

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

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : BASE_DELIVERY_FEE;
  const platformFee = PLATFORM_FEE;
  const gst = Math.round(subtotal * GST_RATE);
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

/**
 * Allocate an integer fee `totalAmount` proportionally across active entries
 * using Hamilton's Largest Remainder Method in pure integer math so the sum of
 * shares strictly equals `totalAmount`.
 */
function allocateProportionalInteger(totalAmount, entries, totalWeight, creatorIdStr) {
  const shares = new Map();
  if (totalAmount <= 0 || totalWeight <= 0) {
    for (const entry of entries) {
      shares.set(entry.userId, 0);
    }
    return shares;
  }

  const active = entries.filter((e) => e.itemsSubtotal > 0);
  let allocatedSum = 0;

  const remainders = active.map((entry) => {
    const numerator = totalAmount * entry.itemsSubtotal;
    const floorVal = Math.floor(numerator / totalWeight);
    const rem = numerator % totalWeight;
    shares.set(entry.userId, floorVal);
    allocatedSum += floorVal;
    return {
      userId: entry.userId,
      rem,
      isCreator: entry.userId === creatorIdStr
    };
  });

  for (const entry of entries) {
    if (!shares.has(entry.userId)) {
      shares.set(entry.userId, 0);
    }
  }

  const leftover = totalAmount - allocatedSum;
  if (leftover > 0) {
    remainders.sort((a, b) => {
      if (b.rem !== a.rem) return b.rem - a.rem;
      if (a.isCreator !== b.isCreator) return a.isCreator ? -1 : 1;
      return a.userId.localeCompare(b.userId);
    });
    for (let i = 0; i < leftover && i < remainders.length; i += 1) {
      const uid = remainders[i].userId;
      shares.set(uid, (shares.get(uid) || 0) + 1);
    }
  }

  return shares;
}

/**
 * Computes combined restaurant totals AND exact per-participant bills for a GroupOrder.
 */
export function calculateGroupBill(items = [], participants = [], creatorId = "") {
  const combinedTotals = calculateCartTotals(items);
  const creatorIdStr = creatorId ? creatorId.toString() : "";

  const byUser = new Map();
  for (const p of participants) {
    const uid = p.userId.toString();
    byUser.set(uid, {
      userId: uid,
      userName: p.name,
      itemCount: 0,
      itemsSubtotal: 0,
      items: []
    });
  }

  for (const item of items) {
    const uid = item.addedBy.userId.toString();
    if (!byUser.has(uid)) {
      byUser.set(uid, {
        userId: uid,
        userName: item.addedBy.name,
        itemCount: 0,
        itemsSubtotal: 0,
        items: []
      });
    }
    const bucket = byUser.get(uid);
    const qty = Number(item.qty);
    const lineTotal = Number(item.price) * qty;
    bucket.itemCount += qty;
    bucket.itemsSubtotal += lineTotal;
    bucket.items.push(item);
  }

  const entries = Array.from(byUser.values());
  const deliveryMap = allocateProportionalInteger(
    combinedTotals.deliveryFee,
    entries,
    combinedTotals.subtotal,
    creatorIdStr
  );
  const platformMap = allocateProportionalInteger(
    combinedTotals.platformFee,
    entries,
    combinedTotals.subtotal,
    creatorIdStr
  );
  const gstMap = allocateProportionalInteger(
    combinedTotals.gst,
    entries,
    combinedTotals.subtotal,
    creatorIdStr
  );

  const participantBills = entries.map((entry) => {
    const deliveryShare = deliveryMap.get(entry.userId) || 0;
    const platformShare = platformMap.get(entry.userId) || 0;
    const gstShare = gstMap.get(entry.userId) || 0;
    const totalOwed = entry.itemsSubtotal + deliveryShare + platformShare + gstShare;
    return {
      userId: entry.userId,
      userName: entry.userName,
      isCreator: entry.userId === creatorIdStr,
      itemCount: entry.itemCount,
      itemsSubtotal: entry.itemsSubtotal,
      deliveryShare,
      platformShare,
      gstShare,
      totalOwed
    };
  });

  return {
    combinedTotals,
    participantBills
  };
}
