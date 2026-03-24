

# Add Child Logout + Redirect Parent Dashboard to Auth

## Changes

### 1. AppSidebar.tsx
- **Logout button**: Add a `LogOut` icon button in `SidebarFooter` that calls `useChildSession().logout()` and navigates to `/child-login`
- **Parent Dashboard**: Remove the PIN verification dialog entirely. Instead, `handleParentClick` clears the child session and navigates to `/auth` — forcing the parent to authenticate with email/password before accessing the dashboard. The `SubscriptionGuard` on `/parent` already handles redirecting unauthenticated users to `/auth`, so this is clean.

### 2. Removed Code
- Remove PIN dialog state (`pinOpen`, `pin`, `attempts`, `lockedUntil`, `loading`)
- Remove `handleVerify` function and the `Dialog` component
- Remove unused imports (`Dialog`, `DialogContent`, `Input`, `useState`, etc.)

### Technical Details

**AppSidebar.tsx** will import `useChildSession` and `LogOut` from lucide. The sidebar footer will contain:
```
<SidebarFooter>
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton onClick={handleLogout}>
        <LogOut /> {!collapsed && "Log Out"}
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarFooter>
```

Parent Dashboard click handler becomes:
```typescript
const handleParentClick = (e) => {
  e.preventDefault();
  logout(); // clear child session
  navigate("/auth"); // require parent login
};
```

The existing `SubscriptionGuard` wrapping `/parent` will redirect to `/auth` if not authenticated, so the flow is: child clicks Parent Dashboard → cleared to `/auth` → parent logs in → redirected to `/parent`.

