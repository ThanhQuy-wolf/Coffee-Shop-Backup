-- Dữ liệu demo cho profile dev và test, giống frontend/lib/mock-data. Không chạy ở production.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Mật khẩu: admin/admin, an|binh|cuong/123456, khách 0987654321/user1
INSERT INTO app_user (id, role, phone, username, password_hash, full_name, department_id) VALUES
    (1,  'MANAGER',  NULL,         'admin', crypt('admin',  gen_salt('bf', 10)), 'Phạm Quản Lý',    NULL),
    (2,  'STAFF',    NULL,         'an',    crypt('123456', gen_salt('bf', 10)), 'Nguyễn Văn An',   1),
    (3,  'STAFF',    NULL,         'binh',  crypt('123456', gen_salt('bf', 10)), 'Trần Thị Bình',   3),
    (4,  'STAFF',    NULL,         'cuong', crypt('123456', gen_salt('bf', 10)), 'Lê Văn Cường',    2),
    (10, 'CUSTOMER', '0987654321', NULL,    crypt('user1',  gen_salt('bf', 10)), 'Khách hàng demo', NULL);
SELECT setval('app_user_id_seq', 100);

INSERT INTO category (id, name, icon, sort_order) VALUES
    (1, 'Cà Phê',             'fa-solid fa-mug-hot',    1),
    (2, 'Trà',                'fa-solid fa-leaf',       2),
    (3, 'Sữa Chua',           'fa-solid fa-jar',        3),
    (4, 'Nước Ép',            'fa-solid fa-blender',    4),
    (5, 'Latte',              'fa-solid fa-mug-saucer', 5),
    (6, 'Giải Khát / Ăn Vặt', 'fa-solid fa-ice-cream',  6);
SELECT setval('category_id_seq', 100);

INSERT INTO product (id, category_id, name, description, price, cost_price, image_url) VALUES
    (1,  1, 'Cà Phê Đen',         'Cà phê đen truyền thống, đậm đà hương vị Việt Nam, pha phin thủ công.', 25000, 10000, '/imgs/products/placeholder.jpg'),
    (2,  1, 'Cà Phê Sữa',         'Cà phê sữa đặc thơm ngon, béo ngậy, kết hợp hoàn hảo giữa cà phê và sữa đặc.', 30000, 11000, '/imgs/products/placeholder.jpg'),
    (3,  1, 'Bạc Xỉu',            'Bạc xỉu nhẹ nhàng, ít cà phê nhiều sữa, thích hợp cho người mới uống cà phê.', 32000, 12000, '/imgs/products/placeholder.jpg'),
    (4,  1, 'Cà Phê Trứng',       'Cà phê trứng đặc sản Hà Nội, lớp kem trứng mịn màng phủ trên nền cà phê đậm đà.', 45000, 0, '/imgs/products/placeholder.jpg'),
    (5,  2, 'Trà Đào Cam Sả',     'Trà đào thơm mát kết hợp cam tươi và sả, thanh mát và giải nhiệt tuyệt vời.', 35000, 13000, '/imgs/products/placeholder.jpg'),
    (6,  2, 'Trà Xanh Matcha',    'Matcha Nhật Bản nguyên chất, vị đắng nhẹ đặc trưng, thơm mát và bổ dưỡng.', 40000, 15000, '/imgs/products/placeholder.jpg'),
    (7,  2, 'Trà Vải Hoa Nhài',   'Trà vải thanh ngọt kết hợp hương hoa nhài dịu dàng, thư giãn tâm hồn.', 38000, 14000, '/imgs/products/placeholder.jpg'),
    (8,  3, 'Sữa Chua Trân Châu', 'Sữa chua mịn màng kết hợp trân châu đen dẻo dai, chua ngọt hài hòa.', 38000, 14000, '/imgs/products/placeholder.jpg'),
    (9,  3, 'Sữa Chua Dâu',       'Sữa chua mát lạnh với dâu tươi ngọt chua, giàu vitamin và khoáng chất.', 40000, 15000, '/imgs/products/placeholder.jpg'),
    (10, 4, 'Nước Ép Cam',        'Nước ép cam tươi nguyên chất, giàu vitamin C, tốt cho sức khỏe.', 35000, 13000, '/imgs/products/placeholder.jpg'),
    (11, 4, 'Nước Ép Dưa Hấu',    'Nước ép dưa hấu mát lạnh, giải nhiệt tức thì trong những ngày hè oi bức.', 30000, 11000, '/imgs/products/placeholder.jpg'),
    (12, 5, 'Latte Caramel',      'Latte caramel ngọt ngào, thơm béo với lớp foam sữa mịn và sốt caramel.', 45000, 17000, '/imgs/products/placeholder.jpg'),
    (13, 5, 'Latte Vanilla',      'Latte vanilla nhẹ nhàng, hương thơm dịu dàng từ vanilla tự nhiên.', 45000, 17000, '/imgs/products/placeholder.jpg'),
    (14, 6, 'Bánh Mì Nướng Bơ',   'Bánh mì nướng giòn rụm, phết bơ thơm và mứt dâu, ăn kèm cà phê tuyệt vời.', 20000, 8000, '/imgs/products/placeholder.jpg'),
    (15, 6, 'Bánh Flan',          'Bánh flan mềm mịn, ngọt ngào với lớp caramel vàng óng, tan chảy trong miệng.', 25000, 10000, '/imgs/products/placeholder.jpg');
SELECT setval('product_id_seq', 100);

INSERT INTO option_group (id, name, selection_type, min_select, max_select, sort_order) VALUES
    (1, 'Size',      'SINGLE',   1, 1, 1),
    (2, 'Mức đường', 'SINGLE',   1, 1, 2),
    (3, 'Mức đá',    'SINGLE',   1, 1, 3),
    (4, 'Topping',   'MULTIPLE', 0, 3, 4);
SELECT setval('option_group_id_seq', 100);

INSERT INTO option_value (id, option_group_id, name, price_delta, cost_delta, is_default, sort_order) VALUES
    (1,  1, 'Size M',          0,    0,    true,  1),
    (2,  1, 'Size L',          6000, 2500, false, 2),
    (3,  2, '100% đường',      0,    0,    true,  3),
    (4,  2, '70% đường',       0,    0,    false, 4),
    (5,  2, '50% đường',       0,    0,    false, 5),
    (6,  2, '30% đường',       0,    0,    false, 6),
    (7,  2, 'Không đường',     0,    0,    false, 7),
    (8,  3, 'Đá bình thường',  0,    0,    true,  8),
    (9,  3, 'Ít đá',           0,    0,    false, 9),
    (10, 3, 'Không đá',        0,    0,    false, 10),
    (11, 4, 'Trân châu đen',   5000, 1500, false, 11),
    (12, 4, 'Trân châu trắng', 5000, 1500, false, 12),
    (13, 4, 'Thạch cà phê',    5000, 1200, false, 13),
    (14, 4, 'Kem cheese',      8000, 3000, false, 14);
SELECT setval('option_value_id_seq', 100);

INSERT INTO product_option_group (product_id, option_group_id, sort_order)
SELECT p, g, ord
FROM (VALUES
    (1,  ARRAY[1,2,3]),   (2,  ARRAY[1,2,3]),   (3,  ARRAY[1,2,3]), (4, ARRAY[1]),
    (5,  ARRAY[1,2,3,4]), (6,  ARRAY[1,2,3,4]), (7,  ARRAY[1,2,3,4]),
    (8,  ARRAY[3]),       (9,  ARRAY[3]),
    (10, ARRAY[1,2,3]),   (11, ARRAY[1,2,3]),
    (12, ARRAY[1,2,3,4]), (13, ARRAY[1,2,3,4])
) AS t(p, groups), unnest(groups) WITH ORDINALITY AS u(g, ord);

INSERT INTO combo (id, name, description, price, image_url, is_available) VALUES
    (1, 'Combo Cà Phê Đôi',   '2 ly cà phê đen + 2 bánh mì nướng bơ, tiết kiệm 15%.',     75000,  '/imgs/products/placeholder.jpg', true),
    (2, 'Combo Trà Sữa Nhóm', '2 trà đào cam sả + 2 trà xanh matcha, dành cho nhóm bạn.', 130000, '/imgs/products/placeholder.jpg', true),
    (3, 'Combo Buổi Sáng',    '1 cà phê sữa + 1 bánh flan, khởi đầu ngày mới ngọt ngào.', 48000,  '/imgs/products/placeholder.jpg', false);
SELECT setval('combo_id_seq', 100);

INSERT INTO combo_item (combo_id, product_id, quantity) VALUES
    (1, 1, 2), (1, 14, 2),
    (2, 5, 2), (2, 6, 2),
    (3, 2, 1), (3, 15, 1);
