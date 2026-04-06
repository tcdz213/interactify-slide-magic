# Login Page

## Route
`/login` — Public (redirects to `/dashboard` if already authenticated)

## UI Components
- **Logo & branding**: Warehouse icon + app name + subtitle
- **Language toggle**: Cycles FR → EN → AR (updates `dir` attribute for RTL)
- **Login form**: Email + password inputs, submit button
- **Demo accounts grid**: 2-column grid of all 6 mock users with name + role

## Data
- `MOCK_USERS` from `src/mock/users.mock.ts` (6 users)
- Auth state from `AuthContext`

## User Actions
- **Login**: Enter email/password → calls `login()` → redirects to `/dashboard`
- **Demo login**: Click any demo user card → auto-login with that role
- **Switch language**: Click globe button to cycle FR/EN/AR

## Behavior
- If already logged in, `<Navigate to="/dashboard" />` is rendered
- Password is ignored for demo users (any value works)
- On success: `sonner` toast + navigation
- On failure: error toast
- Language change updates `document.documentElement.dir` and `lang`

## Edge Cases
- Invalid email → error toast, stays on login
- Already authenticated → auto-redirect
- RTL layout applies when Arabic is selected

## Improvements
- [ ] Add "forgot password" flow
- [ ] Add remember me checkbox
- [ ] Add SSO / OAuth support
- [ ] Rate limiting on login attempts
- [ ] Password visibility toggle
