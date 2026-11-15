# Atoms

The smallest components. They hold no app state and call no service. Import them
from the layer barrel:

```tsx
import { Alert, Button, Icon, Spinner } from "@/components/atoms";
```

Each atom and each prop has JSDoc, so the editor shows the details on hover.

## Button (`buttons/`)

```tsx
<Button variant="primary" size="md" icon="check" onClick={save}>Lưu</Button>
<Button style="login" variant="primaryNoBorder" type="submit">Đăng nhập</Button>
```

- `style`: `base` (default), `payment`, `login`.
- `variant`: `primary`, `secondary`, `danger`, `ghost`, `primaryNoBorder`,
  `bgWhite`.
- `size`: `sm`, `md`, `lg`.
- `icon`: an `Icon` name such as `check`; `iconPosition`: `left` or `right`.
- Other `<button>` attributes pass through.

## Icon (`icons/`)

```tsx
<Icon name="cart-shopping" />                         // decorative, hidden from screen readers
<Icon name="clock" label="Giờ mở cửa" />              // meaningful on its own
<Icon name="star" filled className="text-yellow-400" />
<Icon name={category.icon} className="text-sm" />     // "fa-solid fa-mug-hot" also works
```

- SVG icons from `lucide-react`, bundled with the app. Nothing is loaded from a
  CDN, so icons still show when the network blocks one.
- The icon is `1em` square: size it with `text-*`, colour it with `text-(--…)`.
- Names keep the old FontAwesome spelling (`mug-hot`, `circle-check`, ...),
  because category icons are stored that way. The full list is the `ICONS` map
  in `Icon.tsx`; add a line there to use a new icon. An unknown name renders a
  plain circle.
- An icon-only button must carry `aria-label`.

## Alert and Spinner (`feedback/`)

```tsx
<Alert message={error} />                         // renders nothing when empty
<Alert message="Đã lưu" tone="info" className="mb-4" />
<Spinner className="py-12" />                     // page or section loading
<Spinner label="Đang tải menu..." size="sm" />
```

Use them instead of writing the red box or the spinner markup by hand.

## ErrorMessageLogin (`errors/`)

```tsx
<ErrorMessageLogin message={errors.general} />                 // boxed, form level
<ErrorMessageLogin message={errors.phone} type="secondary" />   // under a field
```

Renders nothing when `message` is empty.

## LoginInput and Textarea (`inputs/`)

```tsx
<LoginInput label="Mật khẩu" type="password" name="password"
  value={password} onChange={(e) => setPassword(e.target.value)} errors={errors.password} />
<Textarea label="Bình luận" rows={4} value={comment}
  onChange={(e) => setComment(e.target.value)} error={error} />
```

`LoginInput` adds a show/hide button when `type="password"`.

## Typography (`typography/`)

```tsx
<Heading level={3}>Thực đơn</Heading>
<Text variant="body2">Mô tả</Text>          // body1 | body2 | caption | label
<Caption>Cập nhật 5 phút trước</Caption>
```

## Adding an atom

1. Create `atoms/<group>/<Name>.tsx` and put its props in `<Group>.types.ts`.
2. Export it from `atoms/<group>/index.ts` and from `atoms/index.ts`.
3. Add JSDoc to the component and to each prop.
