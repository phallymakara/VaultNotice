# Frontend Engineering Principles & AI Agent Development Guidelines

Always strictly follow the principles defined in `FRONTEND_GUIDELINES.md` for all frontend development tasks in this workspace:
- Core engineering philosophy: maintainability, no breaking changes, no unnecessary dependencies.
- Project structure: layer separation (Pages, Components, Hooks, Services, Types, Utils, Constants, Config, Providers).
- UI/UX consistency: adhere strictly to shadcn/ui design tokens, no fake or AI-generated decorative icons, no fabricated example text in inputs.
- API integration: dynamic environment variables (no hardcoded URLs), centralized service modules, TanStack Query for server state.
- Security: RBAC enforcement, no hardcoded secrets, backend authorization authority.
- Quality & Verification: TypeScript without `any`, proper error handling (global & local), loading/skeleton states, and verification before declaring completion.
- Adhere strictly to Section 21: "Strict Rules: Things AI Agents Must Never Do".

