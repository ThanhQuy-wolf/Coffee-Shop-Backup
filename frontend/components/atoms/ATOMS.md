# Atoms

The smallest components. They hold no app state and call no service. Import them
from the layer barrel:

```tsx
import { Alert, Button, Spinner } from "@/components/atoms";
```

Each atom and each prop has JSDoc, so the editor shows the details on hover.

## Button (`buttons/`)

```tsx
<Button variant="primary" size="md" icon="fa-check" onClick={save}>Lưu</Button>
<Button style="login" variant="primaryNoBorder" type="submit">Đăng nhập</Button>
```

- `style`: `base` (default), `payment`, `login`.
- `variant`: `primary`, `secondary`, `danger`, `ghost`, `primaryNoBorder`,
  `bgWhite`.
- `size`: `sm`, `md`, `lg`.
- `icon`: FontAwesome name without `fa-solid`; `iconPosition`: `left` or
  `right`.
- Other `<button>` attributes pass through.

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
