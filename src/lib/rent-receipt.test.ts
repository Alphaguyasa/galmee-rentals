import { describe, expect, it } from "vitest";
import { receiptModel, renderTelegramText } from "@/lib/galmee/receipt";
import { parseSnapshot, rentReceiptData, type StoredRentPayment } from "./rent-receipt";

const labels = {
  rentFor: (m: string) => `Rent: ${m}`,
  prepaid: "Prepaid rent",
  payment: "Rent payment",
  door: (d: string) => `Door ${d}`,
};
const base: StoredRentPayment = {
  receiptNo: "RENT-000007",
  createdAt: "2025-11-10T21:30:00Z", // 11 Nov in Addis
  amount: 5000,
  method: "telebirr",
  reference: "TB123",
  tenantName: "Abebe Kebede",
  tenantPhone: "0911000001",
  door: "Kebele 05 compound · 3",
  snapshot: { months: [{ y: 2018, m: 2, amount: 2000 }, { y: 2018, m: 3, amount: 2000 }], advance: 1000, balanceAfter: 0 },
};

describe("rentReceiptData", () => {
  it("lists each month paid plus prepaid rent, and the lines add up to the amount", () => {
    const d = rentReceiptData(base, { name: "Galmee Rentals Demo" }, "en", labels);
    expect(d.lines.map((l) => l.name)).toEqual(["Rent: Tikimt 2018", "Rent: Hidar 2018", "Prepaid rent"]);
    expect(d.lines.reduce((s, l) => s + l.total, 0)).toBe(5000);
    expect(d.no).toBe("RENT-000007");
    expect(d.totals.balanceAfter).toBe(0);
    expect(d.gregDate).toBe("2025-11-11");
    expect(d.customer?.name).toBe("Abebe Kebede");
  });

  it("uses one line and no balance for payments taken before snapshots", () => {
    const d = rentReceiptData({ ...base, receiptNo: null, snapshot: null }, { name: "X" }, "am", labels);
    expect(d.lines).toEqual([{ name: "Rent payment", total: 5000 }]);
    expect(d.no).toBe("");
    expect(d.totals.balanceAfter).toBeUndefined();
  });

  it("prints month names in the reader's language", () => {
    const d = rentReceiptData(base, { name: "X" }, "am", labels);
    expect(d.lines[0].name).toBe("Rent: ጥቅምት 2018");
  });

  it("paper and Telegram text carry the same total", () => {
    const d = rentReceiptData(base, { name: "Galmee Rentals Demo" }, "en", labels);
    const paid = receiptModel(d).totals.find((t) => t.strong) ?? receiptModel(d).totals[0];
    expect(renderTelegramText(d)).toContain(paid.value);
    expect(renderTelegramText(d)).toContain("RENT-000007");
  });
});

describe("parseSnapshot", () => {
  it("reads the stored jsonb", () => {
    expect(parseSnapshot({ months: [{ y: 2018, m: 1, amount: 1500 }], advance: 0, balance_after: 300 })).toEqual({
      months: [{ y: 2018, m: 1, amount: 1500 }],
      advance: 0,
      balanceAfter: 300,
    });
  });
  it("treats missing or malformed data as no snapshot", () => {
    expect(parseSnapshot(null)).toBeNull();
    expect(parseSnapshot({ months: "x" })).toBeNull();
    expect(parseSnapshot({ months: [{ y: 2018, m: 99, amount: 1 }] })?.months).toEqual([]);
  });
});
