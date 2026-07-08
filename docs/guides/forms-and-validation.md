# Forms & Validation — Zod + React Hook Form

Every form in this repo is the same triangle: a **Zod schema** defines the shape
and rules, **React Hook Form** manages state and submission, and the
**`@workspace/ui` `<Form>` primitives** render fields, labels, and errors wired
to RHF automatically. Zod is also the validation boundary for non-form input
(env, API responses).

> The canonical files are `apps/<app>/lib/validation/auth.ts` (schema) and
> `apps/<app>/app/[locale]/(auth)/login/page.tsx` (form). Everything below is
> lifted from them.

---

## 1. The pattern in one picture

```
Zod schema  ──z.infer──▶  TS type
     │                       │
     │ zodResolver           │ useForm<T>()
     ▼                       ▼
React Hook Form  ──field──▶  <FormField> ─▶ <Input {...field} />
     │                                   └▶ <FormMessage />  ← shows zod error
     ▼ handleSubmit(onSubmit)
  onSubmit(values: T)  ──▶  signIn / mutation / apiClient
```

Validation happens **at the boundary**: the schema is the single source of truth
for both the runtime check and the compile-time type.

---

## 2. Define the schema

`apps/<app>/lib/validation/auth.ts`:

```ts
import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "At least 8 characters"),
})
export type LoginInput = z.infer<typeof loginSchema>
```

Rules this repo follows:

- **One schema per form**, colocated under `lib/validation/`.
- **Always export `z.infer` as the type** (`LoginInput`) — never hand-write a
  parallel `interface`. The type can't drift from the rules.
- **Error messages are the second arg** to each validator (`"Invalid email"`).
  For i18n, pass a message key and translate in the component (see §7).
- This repo runs **Zod v4** (`zod@^4`). `z.string().email()` still works; the v4
  style `z.email()` is also available. Match the surrounding code — `.string().email()`.

---

## 3. Wire the form

`apps/<app>/app/[locale]/(auth)/login/page.tsx` (must be `"use client"` — forms
are interactive):

```tsx
"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import { loginSchema, type LoginInput } from "@/lib/validation/auth"

const form = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: "", password: "" }, // always set defaults → inputs stay controlled
})
```

`zodResolver(loginSchema)` connects the schema to RHF. On submit (and on the
configured mode) RHF runs the schema, and any issue lands on the matching field.

---

## 4. Render fields with the `<Form>` primitives

The `@workspace/ui` `<Form>` set (shadcn's form) removes all the boilerplate of
connecting label ↔ input ↔ error ↔ aria:

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("common.email")}</FormLabel>
          <FormControl>
            <Input type="email" autoComplete="email" {...field} />
          </FormControl>
          <FormMessage /> {/* renders the zod message for this field */}
        </FormItem>
      )}
    />
    <Button type="submit" disabled={submitting}>
      {submitting ? t("common.signingIn") : t("common.signIn")}
    </Button>
  </form>
</Form>
```

What each part does:

| Component          | Role                                                   |
| ------------------ | ------------------------------------------------------ |
| `<Form {...form}>` | context provider — passes the RHF instance down        |
| `<FormField name>` | binds `field` (value, onChange, ref) for one key       |
| `<FormItem>`       | groups label + control + message, generates the `id`   |
| `<FormLabel>`      | `htmlFor` wired automatically — accessible by default  |
| `<FormControl>`    | forwards aria attrs; sets `aria-invalid` on error      |
| `<FormMessage>`    | renders the field's current error message (or nothing) |

`{...field}` spreads `value`, `onChange`, `onBlur`, `name`, `ref` onto the input —
you never manage those by hand. The e2e test relies on this:
`[aria-invalid="true"]` appears automatically when a field fails.

---

## 5. Submit — the standard handler

```tsx
const [submitting, setSubmitting] = useState(false)

async function onSubmit(values: LoginInput) {
  setSubmitting(true)
  const { error } = await signIn.email(values)
  setSubmitting(false)

  if (error) {
    toast.error(error.message ?? t("auth.signInFailed"))
    return
  }
  router.replace(next)
  router.refresh() // re-run RSCs so the new session is picked up
}
```

Pattern notes:

- `values` is **already validated and typed** — RHF won't call `onSubmit` unless
  the schema passes. No re-checking inside.
- **Server/network errors** (a `401`, a taken email) are surfaced via **`sonner`
  toast**, not a field error, because they aren't tied to one input.
- After an auth mutation, `router.refresh()` re-runs Server Components so
  `getServerSession()` sees the new cookie.
- The local `submitting` flag disables the button. You can also use
  `form.formState.isSubmitting` — both are fine; the repo uses an explicit flag
  because the async call is outside RHF (`signIn`), not a `mutationFn`.

For a **field-level** server error (e.g. "email already registered"), set it on
the field instead of a toast:

```ts
if (error?.code === "EMAIL_TAKEN") {
  form.setError("email", { message: t("auth.emailTaken") })
  return
}
```

---

## 6. Validation modes (when errors appear)

`useForm` defaults to `mode: "onSubmit"` — errors show after the first submit,
then re-validate on change. That's what the login form uses (empty submit → all
errors). Override only with a reason:

| Mode                 | Behavior                                            | Use for                    |
| -------------------- | --------------------------------------------------- | -------------------------- |
| `onSubmit` (default) | validate on submit, then re-validate changed fields | most forms                 |
| `onBlur`             | validate when a field loses focus                   | long forms, early feedback |
| `onChange`           | validate on every keystroke                         | password-strength meters   |

```ts
useForm<LoginInput>({ resolver: zodResolver(schema), mode: "onBlur" })
```

---

## 7. i18n for error messages

Hard-coded English in the schema (`"Invalid email"`) is fine for internal/demo
forms. For translated errors, put a **key** in the schema and translate at render
time:

```ts
export const loginSchema = z.object({
  email: z.string().email("validation.email"),
  password: z.string().min(8, "validation.passwordMin"),
})
```

```tsx
<FormMessage>
  {form.formState.errors.email && t(form.formState.errors.email.message!)}
</FormMessage>
```

Or centralize with a Zod error map. Keep it consistent within an app — don't mix
raw strings and keys in the same schema. See [i18n.md](./i18n.md).

---

## 8. Worked example — a settings form with a mutation

**Schema (`lib/validation/profile.ts`):**

```ts
export const profileSchema = z.object({
  displayName: z.string().min(2, "At least 2 characters").max(50),
  bio: z.string().max(280).optional(),
  role: z.enum(["owner", "member", "viewer"]),
})
export type ProfileInput = z.infer<typeof profileSchema>
```

**Component (`components/settings/profile-form.tsx`, `"use client"`):**

```tsx
export function ProfileForm({ initial }: { initial: ProfileInput }) {
  const t = useTranslations()
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: initial,
  })
  const { mutate, isPending } = useUpdateProfile({
    onSuccess: () => toast.success(t("settings.saved")),
    onError: (e) => toast.error(e.response?.data?.message ?? t("common.error")),
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => mutate(v))}
        className="space-y-5"
      >
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.displayName")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* role via <Select>, bio via <Textarea> — same FormField wrapper */}
        <Button type="submit" disabled={isPending || !form.formState.isDirty}>
          {isPending ? t("common.saving") : t("common.save")}
        </Button>
      </form>
    </Form>
  )
}
```

Here submission **is** a mutation (`useUpdateProfile` from `api-client`), so
`isPending` drives the button and `isDirty` disables save when nothing changed.
This is the preferred shape for data-writing forms; the auth forms use the
explicit flag only because Better Auth's `signIn`/`signUp` aren't Query mutations.

---

## 9. Non-form validation — the same Zod

Zod isn't only for forms. The repo also uses it to validate **environment
variables** (`lib/env.ts`, via `@t3-oss/env-nextjs`). Validate any untrusted
boundary the same way — parse API responses you don't control, webhook payloads,
`searchParams`:

```ts
const result = querySchema.safeParse(Object.fromEntries(searchParams))
if (!result.success) return notFound()
const filters = result.data // typed
```

Use `.safeParse` (returns `{ success, data | error }`) at boundaries where you
handle failure gracefully; use `.parse` (throws) where a failure is a bug.

---

## 10. Do / Don't

**Do**

- Derive the TS type with `z.infer`; never maintain a separate interface.
- Set `defaultValues` for every field — keeps inputs controlled, avoids the
  "changing uncontrolled to controlled" warning.
- Use the `<Form>` primitives — they give you label/aria/error wiring for free.
- Surface network errors with a toast; surface field-specific server errors with
  `form.setError`.
- `router.refresh()` after an auth mutation.

**Don't**

- Don't re-validate inside `onSubmit` — RHF already gated it with the resolver.
- Don't manage `value`/`onChange` by hand when `{...field}` does it.
- Don't render a form in a Server Component — it needs `"use client"`.
- Don't mix raw error strings and i18n keys in one schema.
- Don't validate with `z.string()` where you mean an enum — use `z.enum([...])`
  so exhaustive `switch`es stay exhaustive.

---

## Related

- [i18n.md](./i18n.md) — translating labels and error messages.
- [data-fetching.md](./data-fetching.md) — the mutation hooks forms submit to.
- [auth.md](./auth.md) — `signIn`/`signUp` used by the auth forms.
