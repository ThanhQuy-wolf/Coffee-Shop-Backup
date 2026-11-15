-- A-5: dòng shop_info duy nhất được tạo lúc cài đặt. Tham số P-06, P-08 → P-12 lấy giá trị gợi ý trong docs/02 §2.
INSERT INTO shop_info (id, name, tagline, address, phone, email, logo_url, cover_image_url,
                       open_hours, wifi_name, wifi_password, social_links)
VALUES (1, 'Drinkool Coffee', 'Hương vị đậm đà – Khoảnh khắc thư giãn',
        '86 Cao Thắng, Quận 3, TP. Hồ Chí Minh', '0901 234 567', 'contact@drinkool.vn',
        '/imgs/logo.png', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&h=400&fit=crop',
        '07:00 – 22:00 (Thứ 2 – Chủ nhật)', 'Drinkool_Free', 'coffee2024',
        '{"facebook": "https://facebook.com/drinkool", "tiktok": "https://tiktok.com/@drinkool"}');

INSERT INTO department (id, code, name, icon) VALUES
    (1, 'bar',     'Pha chế',  'fa-solid fa-martini-glass-citrus'),
    (2, 'kitchen', 'Bếp',      'fa-solid fa-kitchen-set'),
    (3, 'cashier', 'Thu ngân', 'fa-solid fa-cash-register'),
    (4, 'janitor', 'Tạp vụ',   'fa-solid fa-broom');
SELECT setval('department_id_seq', 4);
