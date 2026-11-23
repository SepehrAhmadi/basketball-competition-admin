import type { CompetitionContext } from "./useCompetitionContext";
import type { useGroupsBoard } from "./useGroupsBoard";

export function useTeamMove(
  ctx: CompetitionContext,
  board: ReturnType<typeof useGroupsBoard>,
) {
  const { groupStore, handlerStore, mutating, busyTeamId, canEdit } = ctx;

  const sortUnassigned = (list: any[]) =>
    [...list].sort((a, b) => a.leagueTeamId - b.leagueTeamId);

  const setGroupTeams = (groupId: number, teams: any[]) => {
    groupStore.groupList = groupStore.groupList.map((g: any) =>
      g.id === groupId ? { ...g, teams, teamsCount: teams.length } : g,
    );
  };

  const findTeam = (leagueTeamId: number) => {
    for (const g of groupStore.groupList) {
      const team = g.teams.find((t: any) => t.leagueTeamId === leagueTeamId);
      if (team) return { team, fromGroupId: g.id as number | null };
    }
    const team = groupStore.unassignedList.find(
      (t: any) => t.leagueTeamId === leagueTeamId,
    );
    return team ? { team, fromGroupId: null as number | null } : null;
  };

  // Buttons and drag & drop both end up here.
  const moveTeam = (
    leagueTeamId: number,
    toGroupId: number | null,
  ): Promise<void> => {
    const leagueId = ctx.selectedLeagueId.value;
    if (!leagueId || !canEdit.value) return Promise.resolve();

    const found = findTeam(leagueTeamId);
    if (!found) return Promise.resolve();
    const { team, fromGroupId } = found;
    if (fromGroupId === toGroupId) return Promise.resolve();

    // A group that already has games keeps its teams fixed.
    const srcGroup = groupStore.groupList.find(
      (g: any) => g.id === fromGroupId,
    );
    const dstGroup = groupStore.groupList.find((g: any) => g.id === toGroupId);
    const lock = srcGroup?.lock ?? dstGroup?.lock;
    if (lock) {
      handlerStore.setError(lock.message);
      return Promise.resolve();
    }

    mutating.value = true;
    busyTeamId.value = leagueTeamId;

    const snapshot = {
      groups: groupStore.groupList.map((g: any) => ({
        ...g,
        teams: [...g.teams],
      })),
      unassigned: [...groupStore.unassignedList],
      unassignedCount: groupStore.unassignedCount,
    };

    // Optimistic local change; the team always lands at the end of a group.
    if (fromGroupId !== null) {
      const src = groupStore.groupList.find((g: any) => g.id === fromGroupId);
      setGroupTeams(
        fromGroupId,
        src.teams.filter((t: any) => t.leagueTeamId !== leagueTeamId),
      );
    } else {
      groupStore.unassignedList = groupStore.unassignedList.filter(
        (t: any) => t.leagueTeamId !== leagueTeamId,
      );
      groupStore.unassignedCount = Math.max(0, groupStore.unassignedCount - 1);
    }
    if (toGroupId !== null) {
      const dst = groupStore.groupList.find((g: any) => g.id === toGroupId);
      setGroupTeams(toGroupId, [...dst.teams, team]);
    } else {
      groupStore.unassignedList = sortUnassigned([
        ...groupStore.unassignedList,
        team,
      ]);
      groupStore.unassignedCount += 1;
    }

    const request =
      toGroupId !== null
        ? groupStore.assignTeam(leagueId, toGroupId, leagueTeamId)
        : groupStore.unassignTeam(
            leagueId,
            fromGroupId as number,
            leagueTeamId,
          );

    return request.then((data: any) => {
      if (data) {
        (data.affectedGroups ?? []).forEach((a: any) => {
          const g = groupStore.groupList.find((x: any) => x.id === a.id);
          if (g) {
            g.teamsCount = a.teamsCount;
            g.qualifiers = a.qualifiers;
            g.issues = a.issues ?? [];
          }
        });
        if (data.unassignedCount !== undefined)
          groupStore.unassignedCount = data.unassignedCount;
        if (data.issues) groupStore.groupIssues = data.issues;
        mutating.value = false;
        busyTeamId.value = null;
        return board.refreshData();
      }

      // Failure: roll back, then always refetch (covers 404 / 409 / network).
      groupStore.groupList = snapshot.groups;
      groupStore.unassignedList = snapshot.unassigned;
      groupStore.unassignedCount = snapshot.unassignedCount;
      mutating.value = false;
      busyTeamId.value = null;
      return board.refreshData();
    });
  };

  return { moveTeam };
}
