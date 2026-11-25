import test from "node:test";
import assert from "node:assert/strict";
import { calculateCartTotals, calculateGroupBill } from "../src/services/billingService.js";

test("calculateCartTotals returns zeroes for empty cart", () => {
  const totals = calculateCartTotals([]);
  assert.deepEqual(totals, {
    itemCount: 0,
    subtotal: 0,
    deliveryFee: 0,
    platformFee: 0,
    gst: 0,
    grandTotal: 0
  });
});

test("calculateCartTotals charges delivery fee below 400 and free delivery at/above 400", () => {
  const below = calculateCartTotals([{ price: 320, qty: 1 }]);
  assert.equal(below.subtotal, 320);
  assert.equal(below.deliveryFee, 40);
  assert.equal(below.platformFee, 5);
  assert.equal(below.gst, 16);
  assert.equal(below.grandTotal, 381);

  const exact400 = calculateCartTotals([{ price: 200, qty: 2 }]);
  assert.equal(exact400.subtotal, 400);
  assert.equal(exact400.deliveryFee, 0);
  assert.equal(exact400.platformFee, 5);
  assert.equal(exact400.gst, 20);
  assert.equal(exact400.grandTotal, 425);
});

test("calculateGroupBill sums participant totalOwed exactly to combined grandTotal", () => {
  const creatorId = "u1";
  const participants = [
    { userId: "u1", name: "Alex" },
    { userId: "u2", name: "Priya" },
    { userId: "u3", name: "Rohan" }
  ];
  const items = [
    { price: 130, qty: 1, addedBy: { userId: "u1", name: "Alex" } },
    { price: 95, qty: 1, addedBy: { userId: "u2", name: "Priya" } },
    { price: 45, qty: 2, addedBy: { userId: "u3", name: "Rohan" } }
  ];

  const { combinedTotals, participantBills } = calculateGroupBill(items, participants, creatorId);
  const sumOwed = participantBills.reduce((s, b) => s + b.totalOwed, 0);
  const sumDelivery = participantBills.reduce((s, b) => s + b.deliveryShare, 0);
  const sumPlatform = participantBills.reduce((s, b) => s + b.platformShare, 0);
  const sumGst = participantBills.reduce((s, b) => s + b.gstShare, 0);

  assert.equal(combinedTotals.subtotal, 315);
  assert.equal(combinedTotals.deliveryFee, 40);
  assert.equal(combinedTotals.platformFee, 5);
  assert.equal(combinedTotals.gst, 16);
  assert.equal(combinedTotals.grandTotal, 376);

  assert.equal(sumDelivery, combinedTotals.deliveryFee);
  assert.equal(sumPlatform, combinedTotals.platformFee);
  assert.equal(sumGst, combinedTotals.gst);
  assert.equal(sumOwed, combinedTotals.grandTotal);
});

test("calculateGroupBill gives 0 owed to participant who added no items", () => {
  const participants = [
    { userId: "u1", name: "Alex" },
    { userId: "u2", name: "Observer" }
  ];
  const items = [{ price: 440, qty: 1, addedBy: { userId: "u1", name: "Alex" } }];

  const { combinedTotals, participantBills } = calculateGroupBill(items, participants, "u1");
  const observer = participantBills.find((b) => b.userId === "u2");
  const alex = participantBills.find((b) => b.userId === "u1");

  assert.equal(observer.totalOwed, 0);
  assert.equal(alex.totalOwed, combinedTotals.grandTotal);
});
