export type CompetitionView = "groups" | "games";
export type PageState = "idle" | "loading" | "ready" | "error";
export type GameActionKey =
  | "reschedule"
  | "result"
  | "schedule"
  | "start"
  | "cancel"
  | "clear"
  | "delete";
export type GameConfirmType = "start" | "clear" | "delete";

export interface GameFilterState {
  search: string;
  groupId: number | null;
  status: string | null;
  leagueTeamId: number | null;
  dateFrom: string;
  dateTo: string;
  resultPending: boolean;
}

export interface ResultFormState {
  type: "NORMAL" | "FORFEIT";
  homeScore: string | number;
  awayScore: string | number;
  forfeitId: number | null;
  note: string;
}

export interface MoveRequest {
  leagueTeamId: number;
  toGroupId: number | null;
}

export interface GroupFormPayload {
  name: string;
  qualifiersOverride: number | null;
}

export interface Advisory {
  code: string;
  severity: "INFO" | "WARNING" | "BLOCKER";
  message: string;
  params: Record<string, string | number | boolean | null>;
}
