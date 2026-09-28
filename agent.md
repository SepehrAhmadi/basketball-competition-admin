# Project Rules

## Tech Stack

- Nuxt 4 (using the `app/` directory structure, not the old Nuxt 3 root layout)
- Vue 3 Composition API only — always use `<script setup lang="ts">`
- TypeScript everywhere, no plain `.js` files for components/composables
- Tailwind CSS v4 (CSS-first config, no `tailwind.config.js` — theme tokens live in `assets/css/tailwind.css`)
- shadcn-vue for UI components (built on Reka UI)

## shadcn-vue Rules

- NEVER hand-write a UI primitive that already exists in shadcn-vue. Always add it via CLI first:
  npx shadcn-vue@latest add <component-name>
- NEVER manually edit files inside `components/ui/` unless explicitly asked. Those are generated files — if a change is needed, prefer wrapping the component in a new custom component instead of editing the primitive.
- Always import shadcn components from `@/components/ui/<component>`, never from a package name.
- Before using a new shadcn component in code, check whether it has already been added under `components/ui/`. If not, add it first, then use it — never assume it exists.

## Tailwind Rules

- No inline `style=""` attributes. Everything must be Tailwind utility classes.
- Use existing design tokens (colors, spacing, radius) defined in the theme instead of arbitrary values like `text-[#3b82f6]` or `mt-[13px]`, unless there is no equivalent token.
- Mobile-first: write base styles for mobile, then override with `sm:`, `md:`, `lg:` breakpoints.
- Use the `cn()` utility (from `lib/utils`) for merging/conditional class names, not string concatenation or ternaries inside `class=""`.

## Component & File Conventions

- One component per file, PascalCase filenames (e.g. `HeroSection.vue`).
- Composables go in `app/composables/`, named `useX.ts`.
- Keep components small and focused — split a section into subcomponents if it exceeds ~150 lines.
- Props and emits must be typed explicitly with `defineProps<T>()` / `defineEmits<T>()`, not runtime validation objects.

Rules:

- Never use `text-primary` for body text or links directly on the background — contrast is too low. Primary is a BACKGROUND color only.
- Use `shadow-glow-primary` (custom utility) on interactive elements on hover/focus instead of default black box-shadows — plain black shadows don't read well on this dark palette.
- Elevation between sections/cards should be achieved by switching from `bg-background` to `bg-card`, not by adding heavy shadows.
- Any new color introduced outside this system must be approved before use — don't invent new hex values ad hoc.

## Form Data Rules

- `FormData` MUST be built inside the component (or page) that owns the form, in a local `buildFormData()` function. NEVER build `FormData` inside a Pinia/store file under any circumstances.
- Stores only receive a ready-made `FormData` object as an argument (e.g. `organizationStore.createOrganization(buildFormData())`) and pass it to the API. They must not know about individual form fields, files, or previews.
- File inputs must be handled in the component with a `handleXChange` handler, and previews must use `URL.createObjectURL(file)`.
- Removing a file must be tracked with an explicit flag (e.g. `removeLogoFlag`) and sent to the backend as a string (`String(flag)`).
- Only append a file to `FormData` if one is actually selected. Convert non-string values (numbers, booleans) with `String()` before appending.
- After a successful submit: refresh the list, close the dialog/sheet, and reset the form — in that order, inside the `.then()` of the store call.

Follow this exact pattern (adapt field names to the form at hand):

```ts
const handleLogoChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  logo.value = file;
  logoPreview.value = URL.createObjectURL(file);
  removeLogoFlag.value = false;
};

const removeLogo = () => {
  logo.value = null;
  logoPreview.value = defaultAvatar;
  removeLogoFlag.value = true;
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

const buildFormData = () => {
  const formData = new FormData();
  formData.append("name", name.value);
  formData.append("description", description.value);
  formData.append("city", city.value);
  formData.append("phone", String(phone.value));
  formData.append("email", email.value);
  if (logo.value) {
    formData.append("logo", logo.value);
  }
  formData.append("removeLogo", String(removeLogoFlag.value));
  return formData;
};

const handleSubmit = () => {
  organizationStore.createOrganization(buildFormData()).then(() => {
    loadOrganizations();
    open.value = false;
    resetForm();
  });
};
```

## Workflow Rules

- Before installing any new npm package, ask for confirmation first — do not add dependencies silently.
- Before overwriting an existing file, show what will change (or summarize the diff) rather than rewriting silently.
- After adding/changing a component, briefly state which files were created or modified.
- If a requested UI pattern has no existing shadcn-vue component (e.g. a custom pricing table), build it by composing existing primitives (Card, Button, Badge, etc.) rather than raw HTML/CSS when possible.
- No lorem ipsum or placeholder text in final output — use realistic sample content unless explicitly told otherwise.
- Ensure all interactive elements (buttons, inputs, links) have proper `aria-label`s where the visible text alone isn't descriptive enough.

## Error Handling

- If a command fails (npm install, shadcn add, build), stop and report the exact error — do not attempt silent workarounds or skip the step.