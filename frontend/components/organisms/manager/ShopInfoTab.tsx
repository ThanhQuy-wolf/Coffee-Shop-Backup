"use client";

import { useManager } from "@/lib/contexts/manager-context";
import { shopService } from "@/lib/services";
import type { ShopSettings, ShopUpdate } from "@/lib/types";
import { errorMessage } from "@/lib/utils/errors";
import { type FormEvent, useEffect, useState } from "react";

import { inputCls, labelCls } from "./useSaveForm";

const SHOP_FIELDS: {
  key: keyof Omit<ShopUpdate, "socialLinks">;
  label: string;
  wide?: boolean;
}[] = [
  { key: "name", label: "Tên quán" },
  { key: "phone", label: "Số điện thoại" },
  { key: "tagline", label: "Khẩu hiệu", wide: true },
  { key: "address", label: "Địa chỉ", wide: true },
  { key: "email", label: "Email" },
  { key: "openHours", label: "Giờ mở cửa" },
  { key: "wifiName", label: "Tên WiFi" },
  { key: "wifiPassword", label: "Mật khẩu WiFi" },
  { key: "logoUrl", label: "Logo (URL)" },
  { key: "coverImageUrl", label: "Ảnh bìa (URL)" },
];

// P-06 → P-12 in docs/02-business-rules.md
const SETTING_FIELDS: {
  key: keyof ShopSettings;
  label: string;
  unit: string;
}[] = [
  {
    key: "paymentTimeoutMinutes",
    label: "Thời hạn thanh toán (P-06)",
    unit: "phút",
  },
  {
    key: "maxItemQuantity",
    label: "Số lượng tối đa mỗi món (P-08)",
    unit: "phần",
  },
  {
    key: "reviewWindowDays",
    label: "Hạn đánh giá sau khi hoàn tất (P-09)",
    unit: "ngày",
  },
  {
    key: "shiftCancelHours",
    label: "Huỷ đăng ký ca trước giờ bắt đầu (P-10)",
    unit: "giờ",
  },
  {
    key: "attendanceEditDays",
    label: "Hạn sửa chấm công (P-11)",
    unit: "ngày",
  },
  {
    key: "shiftBookingDays",
    label: "Mở đăng ký ca trước (P-12)",
    unit: "ngày",
  },
];

type Status = { tone: "ok" | "error"; text: string } | null;

function StatusLine({ status }: { status: Status }) {
  if (!status) return null;
  return (
    <p
      role="status"
      className={`rounded-lg px-3 py-2 text-sm ${status.tone === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
    >
      {status.text}
    </p>
  );
}

/** UC-15: S-3/S-4 thông tin quán, S-5 tham số nghiệp vụ */
export default function ShopInfoTab() {
  const { shopId } = useManager();
  const [shop, setShop] = useState<ShopUpdate | null>(null);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [shopStatus, setShopStatus] = useState<Status>(null);
  const [settingsStatus, setSettingsStatus] = useState<Status>(null);

  useEffect(() => {
    Promise.all([
      shopService.get(shopId),
      shopService.getSettings(shopId),
    ]).then(
      ([{ id: _i, code: _c, isActive: _a, ...editable }, s]) => {
        setShop(editable);
        setSettings(s);
      },
      (err) => setShopStatus({ tone: "error", text: errorMessage(err) }),
    );
  }, [shopId]);

  const saveShop = async (e: FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    try {
      await shopService.update(shopId, shop);
      setShopStatus({ tone: "ok", text: "Đã lưu thông tin quán." });
    } catch (err) {
      setShopStatus({ tone: "error", text: errorMessage(err) });
    }
  };

  const saveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await shopService.updateSettings(shopId, settings);
      setSettingsStatus({
        tone: "ok",
        text: "Đã lưu. Tham số mới áp dụng cho đơn và ca tạo từ bây giờ.",
      });
    } catch (err) {
      setSettingsStatus({ tone: "error", text: errorMessage(err) });
    }
  };

  if (!shop || !settings) return <StatusLine status={shopStatus} />;

  const card =
    "rounded-2xl border border-(--color-border-light) bg-white p-5 shadow-sm";
  const saveBtn =
    "cursor-pointer rounded-xl border-none bg-(--color-primary) px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-(--color-primary-dark)";

  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <form onSubmit={saveShop} className={`${card} space-y-4`}>
        <h2 className="text-foreground font-bold">
          Thông tin hiển thị cho khách
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SHOP_FIELDS.map((f) => (
            <div key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
              <label htmlFor={`shop-${f.key}`} className={labelCls}>
                {f.label}
              </label>
              <input
                id={`shop-${f.key}`}
                value={shop[f.key]}
                required={f.key === "name"}
                onChange={(e) => setShop({ ...shop, [f.key]: e.target.value })}
                className={inputCls}
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label htmlFor="shop-facebook" className={labelCls}>
              Facebook
            </label>
            <input
              id="shop-facebook"
              value={shop.socialLinks.facebook ?? ""}
              onChange={(e) =>
                setShop({
                  ...shop,
                  socialLinks: {
                    ...shop.socialLinks,
                    facebook: e.target.value,
                  },
                })
              }
              className={inputCls}
            />
          </div>
        </div>
        <StatusLine status={shopStatus} />
        <button type="submit" className={saveBtn}>
          Lưu thông tin
        </button>
      </form>

      <form onSubmit={saveSettings} className={`${card} space-y-4`}>
        <h2 className="text-foreground font-bold">Tham số vận hành</h2>
        {SETTING_FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={`setting-${f.key}`} className={labelCls}>
              {f.label}
            </label>
            <div className="flex items-center gap-2">
              <input
                id={`setting-${f.key}`}
                type="number"
                min={0}
                value={settings[f.key]}
                onChange={(e) =>
                  setSettings({ ...settings, [f.key]: Number(e.target.value) })
                }
                className={inputCls}
              />
              <span className="w-12 text-sm text-(--color-text-muted)">
                {f.unit}
              </span>
            </div>
          </div>
        ))}
        <StatusLine status={settingsStatus} />
        <button type="submit" className={saveBtn}>
          Lưu tham số
        </button>
      </form>
    </div>
  );
}
