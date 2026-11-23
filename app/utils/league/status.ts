export interface LeagueStatusOption {
  value: string;
  label: string;
}

export const LEAGUE_STATUS_OPTIONS: LeagueStatusOption[] = [
  { value: "INACTIVE", label: "غیرفعال" },
  { value: "REGISTRATION", label: "ثبت‌نام" },
  { value: "ACTIVE", label: "فعال" },
  { value: "FINISHED", label: "پایان‌یافته" },
];

export function leagueStatusLabel(status: string | null | undefined): string {
  return (
    LEAGUE_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status ?? "—"
  );
}

export function leagueStatusColor(status: string | null | undefined): string {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "REGISTRATION":
      return "info";
    default:
      return "default";
  }
}
