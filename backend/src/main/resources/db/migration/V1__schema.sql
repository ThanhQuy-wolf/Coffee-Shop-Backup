-- Schema theo docs/04-erd.md §3. Sửa schema thì thêm migration mới, không sửa file này sau khi đã chạy.

-- A-5: hệ thống chỉ phục vụ một quán, bảng này luôn có đúng một dòng
CREATE TABLE shop_info (
    id                      smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    name                    varchar(120) NOT NULL,
    tagline                 varchar(200),
    address                 varchar(255) NOT NULL,
    phone                   varchar(15),
    email                   varchar(120),
    logo_url                varchar(500),
    cover_image_url         varchar(500),
    open_hours              varchar(100),
    wifi_name               varchar(64),
    wifi_password           varchar(64),
    social_links            jsonb NOT NULL DEFAULT '{}'::jsonb,
    payment_timeout_minutes int NOT NULL DEFAULT 15 CHECK (payment_timeout_minutes > 0),
    max_item_quantity       int NOT NULL DEFAULT 20 CHECK (max_item_quantity > 0),
    review_window_days      int NOT NULL DEFAULT 7  CHECK (review_window_days >= 0),
    shift_cancel_hours      int NOT NULL DEFAULT 12 CHECK (shift_cancel_hours >= 0),
    attendance_edit_days    int NOT NULL DEFAULT 3  CHECK (attendance_edit_days >= 0),
    shift_booking_days      int NOT NULL DEFAULT 14 CHECK (shift_booking_days > 0),
    updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE department (
    id   bigserial PRIMARY KEY,
    code varchar(32) NOT NULL UNIQUE,
    name varchar(80) NOT NULL,
    icon varchar(64)
);

CREATE TABLE app_user (
    id                 bigserial PRIMARY KEY,
    role               varchar(16)  NOT NULL CHECK (role IN ('CUSTOMER','STAFF','MANAGER')),
    phone              varchar(10)  UNIQUE CHECK (phone ~ '^0[35789][0-9]{8}$'),
    username           varchar(64)  UNIQUE,
    password_hash      varchar(100) NOT NULL,
    full_name          varchar(120) NOT NULL,
    avatar_url         varchar(500),
    department_id      bigint REFERENCES department(id),
    status             varchar(16)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','LOCKED')),
    failed_login_count int          NOT NULL DEFAULT 0,
    locked_until       timestamptz,
    created_at         timestamptz  NOT NULL DEFAULT now(),
    -- Khách đăng nhập bằng số điện thoại, nhân sự bằng username
    CHECK (
        (role = 'CUSTOMER' AND phone IS NOT NULL AND department_id IS NULL)
     OR (role IN ('STAFF','MANAGER') AND username IS NOT NULL)
    )
);

CREATE TABLE otp_verification (
    id            bigserial PRIMARY KEY,
    phone         varchar(10) NOT NULL,
    purpose       varchar(16) NOT NULL CHECK (purpose IN ('REGISTER')),
    code_hash     varchar(100) NOT NULL,
    attempt_count int         NOT NULL DEFAULT 0,
    expires_at    timestamptz NOT NULL,
    consumed_at   timestamptz,
    created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_otp_phone_created ON otp_verification (phone, created_at DESC);

CREATE TABLE refresh_token (
    id         bigserial PRIMARY KEY,
    user_id    bigint       NOT NULL REFERENCES app_user(id),
    token_hash varchar(100) NOT NULL UNIQUE,
    expires_at timestamptz  NOT NULL,
    revoked_at timestamptz
);

CREATE TABLE category (
    id         bigserial PRIMARY KEY,
    name       varchar(80) NOT NULL,
    icon       varchar(64) NOT NULL, -- tên icon, VD 'mug-hot' (chấp nhận cả 'fa-solid fa-mug-hot')
    sort_order int         NOT NULL DEFAULT 0,
    deleted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);
-- Danh mục xoá mềm: món đã xoá mềm vẫn tham chiếu tới danh mục cũ để giữ lịch sử
CREATE UNIQUE INDEX uq_category_name ON category (lower(name)) WHERE deleted_at IS NULL;

CREATE TABLE product (
    id           bigserial PRIMARY KEY,
    category_id  bigint       NOT NULL REFERENCES category(id),
    name         varchar(120) NOT NULL,
    description  text         NOT NULL DEFAULT '',
    price        bigint       NOT NULL CHECK (price > 0),
    cost_price   bigint       NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
    image_url    varchar(500),
    is_available boolean      NOT NULL DEFAULT true,
    deleted_at   timestamptz,
    created_at   timestamptz  NOT NULL DEFAULT now(),
    updated_at   timestamptz  NOT NULL DEFAULT now()
);
-- BR-12: tên món duy nhất, không phân biệt hoa thường, bỏ qua món đã xoá
CREATE UNIQUE INDEX uq_product_name ON product (lower(name)) WHERE deleted_at IS NULL;
CREATE INDEX idx_product_menu ON product (category_id) WHERE deleted_at IS NULL;

CREATE TABLE combo (
    id           bigserial PRIMARY KEY,
    name         varchar(120) NOT NULL,
    description  text         NOT NULL DEFAULT '',
    price        bigint       NOT NULL CHECK (price > 0),
    image_url    varchar(500),
    is_available boolean      NOT NULL DEFAULT true,
    deleted_at   timestamptz,
    created_at   timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE combo_item (
    combo_id   bigint NOT NULL REFERENCES combo(id) ON DELETE CASCADE,
    product_id bigint NOT NULL REFERENCES product(id),
    quantity   int    NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (combo_id, product_id)
);

CREATE TABLE option_group (
    id             bigserial PRIMARY KEY,
    name           varchar(60) NOT NULL,
    selection_type varchar(8)  NOT NULL CHECK (selection_type IN ('SINGLE','MULTIPLE')),
    min_select     int         NOT NULL DEFAULT 0,
    max_select     int         NOT NULL DEFAULT 1,
    sort_order     int         NOT NULL DEFAULT 0,
    deleted_at     timestamptz,
    created_at     timestamptz NOT NULL DEFAULT now(),
    -- BR-16
    CHECK (min_select >= 0 AND max_select >= 1 AND min_select <= max_select),
    CHECK (selection_type = 'MULTIPLE' OR max_select = 1)
);
CREATE UNIQUE INDEX uq_option_group_name ON option_group (lower(name)) WHERE deleted_at IS NULL;

CREATE TABLE option_value (
    id              bigserial PRIMARY KEY,
    option_group_id bigint      NOT NULL REFERENCES option_group(id),
    name            varchar(60) NOT NULL,
    price_delta     bigint      NOT NULL DEFAULT 0 CHECK (price_delta >= 0),  -- BR-17
    cost_delta      bigint      NOT NULL DEFAULT 0 CHECK (cost_delta >= 0),
    is_default      boolean     NOT NULL DEFAULT false,
    is_available    boolean     NOT NULL DEFAULT true,
    sort_order      int         NOT NULL DEFAULT 0,
    deleted_at      timestamptz
);
CREATE UNIQUE INDEX uq_option_value_name ON option_value (option_group_id, lower(name)) WHERE deleted_at IS NULL;

CREATE TABLE product_option_group (
    product_id      bigint NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    option_group_id bigint NOT NULL REFERENCES option_group(id),
    sort_order      int    NOT NULL DEFAULT 0,
    PRIMARY KEY (product_id, option_group_id)
);

CREATE TABLE customer_order (
    id              bigserial PRIMARY KEY,
    code            varchar(24) NOT NULL UNIQUE,
    customer_id     bigint REFERENCES app_user(id),
    guest_token     varchar(64),
    table_label     varchar(16),
    note            varchar(300),
    status          varchar(20) NOT NULL CHECK (status IN
                      ('PENDING_PAYMENT','PAID','PREPARING','READY','COMPLETED','CANCELLED')),
    total           bigint      NOT NULL CHECK (total > 0),
    idempotency_key varchar(64) NOT NULL,
    version         int         NOT NULL DEFAULT 1,
    created_at      timestamptz NOT NULL DEFAULT now(),
    paid_at         timestamptz,
    completed_at    timestamptz,
    cancelled_at    timestamptz,
    cancel_reason   varchar(300),
    cancelled_by    bigint REFERENCES app_user(id),
    UNIQUE (idempotency_key),
    CHECK (customer_id IS NOT NULL OR guest_token IS NOT NULL)
);
CREATE INDEX idx_order_queue    ON customer_order (status, created_at);
CREATE INDEX idx_order_customer ON customer_order (customer_id, created_at DESC);
CREATE INDEX idx_order_paid     ON customer_order (paid_at) WHERE paid_at IS NOT NULL;

CREATE TABLE order_item (
    id                   bigserial PRIMARY KEY,
    order_id             bigint       NOT NULL REFERENCES customer_order(id),
    item_type            varchar(8)   NOT NULL CHECK (item_type IN ('PRODUCT','COMBO')),
    product_id           bigint REFERENCES product(id),
    combo_id             bigint REFERENCES combo(id),
    name_snapshot        varchar(120) NOT NULL,
    category_id_snapshot bigint,
    unit_price           bigint       NOT NULL CHECK (unit_price > 0),
    unit_cost            bigint       NOT NULL CHECK (unit_cost >= 0),
    quantity             int          NOT NULL CHECK (quantity > 0),
    line_total           bigint       NOT NULL,
    CHECK ((item_type = 'PRODUCT' AND product_id IS NOT NULL AND combo_id IS NULL)
        OR (item_type = 'COMBO'   AND combo_id IS NOT NULL AND product_id IS NULL)),
    CHECK (line_total = unit_price * quantity)
);
CREATE INDEX idx_order_item_order ON order_item (order_id);

CREATE TABLE order_item_option (
    id                  bigserial PRIMARY KEY,
    order_item_id       bigint      NOT NULL REFERENCES order_item(id),
    component_no        smallint    CHECK (component_no >= 1),
    component_product_id bigint     REFERENCES product(id),
    component_name_snapshot varchar(100),
    option_group_id     bigint      NOT NULL REFERENCES option_group(id),
    option_value_id     bigint      NOT NULL REFERENCES option_value(id),
    group_name_snapshot varchar(60) NOT NULL,
    value_name_snapshot varchar(60) NOT NULL,
    price_delta         bigint      NOT NULL CHECK (price_delta >= 0),
    cost_delta          bigint      NOT NULL CHECK (cost_delta >= 0),
    -- Các cột component đi cùng nhau: đủ cả ba (dòng combo) hoặc NULL cả ba (dòng món)
    CHECK ((component_no IS NULL) = (component_product_id IS NULL)
       AND (component_no IS NULL) = (component_name_snapshot IS NULL)),
    UNIQUE NULLS NOT DISTINCT (order_item_id, component_no, option_value_id)
);
CREATE INDEX idx_order_item_option_item ON order_item_option (order_item_id);

CREATE TABLE payment (
    id           bigserial PRIMARY KEY,
    order_id     bigint      NOT NULL UNIQUE REFERENCES customer_order(id),
    method       varchar(8)  NOT NULL CHECK (method IN ('CASH','QR')),
    status       varchar(10) NOT NULL CHECK (status IN ('PENDING','CONFIRMED','VOIDED','REFUNDED')),
    amount       bigint      NOT NULL CHECK (amount > 0),
    confirmed_by bigint REFERENCES app_user(id),
    confirmed_at timestamptz,
    refunded_at  timestamptz
);

CREATE TABLE review (
    id          bigserial PRIMARY KEY,
    order_id    bigint      NOT NULL UNIQUE REFERENCES customer_order(id),
    customer_id bigint      NOT NULL REFERENCES app_user(id),
    rating      smallint    NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     varchar(500),
    created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_review_created ON review (created_at DESC);

CREATE TABLE order_daily_counter (
    business_date date PRIMARY KEY,
    last_seq      int  NOT NULL
);

CREATE TABLE shift (
    id            bigserial PRIMARY KEY,
    department_id bigint      NOT NULL REFERENCES department(id),
    shift_date    date        NOT NULL,
    start_time    time        NOT NULL,
    end_time      time        NOT NULL,
    wage          bigint      NOT NULL CHECK (wage > 0),
    max_staff     int         NOT NULL CHECK (max_staff BETWEEN 1 AND 20),
    allow_cross_department boolean NOT NULL DEFAULT false,  -- BR-46
    status        varchar(10) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CANCELLED')),
    created_by    bigint      NOT NULL REFERENCES app_user(id),
    version       int         NOT NULL DEFAULT 1,
    created_at    timestamptz NOT NULL DEFAULT now(),
    CHECK (end_time > start_time)                       -- BR-40
);
CREATE INDEX idx_shift_calendar ON shift (shift_date);

CREATE TABLE shift_assignment (
    id           bigserial PRIMARY KEY,
    shift_id     bigint      NOT NULL REFERENCES shift(id),
    staff_id     bigint      NOT NULL REFERENCES app_user(id),
    status       varchar(16) NOT NULL CHECK (status IN
                   ('REGISTERED','CANCELLED','LEAVE_REQUESTED','LEAVE_APPROVED','ATTENDED','ABSENT')),
    leave_reason varchar(300),
    decided_by   bigint REFERENCES app_user(id),
    decided_at   timestamptz,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now()
);
-- BR-44: mỗi nhân viên tối đa một phân ca đang hiệu lực trong một ca
CREATE UNIQUE INDEX uq_assignment_active ON shift_assignment (shift_id, staff_id)
    WHERE status NOT IN ('CANCELLED','LEAVE_APPROVED');
CREATE INDEX idx_assignment_staff ON shift_assignment (staff_id, status);

CREATE TABLE notification (
    id         bigserial PRIMARY KEY,
    user_id    bigint      NOT NULL REFERENCES app_user(id),
    type       varchar(40) NOT NULL,
    payload    jsonb       NOT NULL,
    read_at    timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notification_unread ON notification (user_id) WHERE read_at IS NULL;

CREATE TABLE audit_log (
    id          bigserial PRIMARY KEY,
    actor_id    bigint REFERENCES app_user(id),
    action      varchar(60) NOT NULL,
    entity_type varchar(40) NOT NULL,
    entity_id   bigint      NOT NULL,
    before_data jsonb,
    after_data  jsonb,
    created_at  timestamptz NOT NULL DEFAULT now()
);
-- NFR-03: tài khoản ứng dụng chỉ được INSERT và SELECT trên bảng này
CREATE INDEX idx_audit_entity ON audit_log (entity_type, entity_id);
