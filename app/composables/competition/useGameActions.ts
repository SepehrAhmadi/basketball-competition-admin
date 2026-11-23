import { computed, ref } from "vue";
import type { CompetitionContext } from "./useCompetitionContext";
import type { useGamesList } from "./useGamesList";
import type { useGameForm } from "./useGameForm";
import type {
  GameActionKey,
  GameConfirmType,
  ResultFormState,
} from "./types";

export function useGameActions(
  ctx: CompetitionContext,
  _games: ReturnType<typeof useGamesList>,
  gameForm: ReturnType<typeof useGameForm>,
) {
  const { gameStore, handlerStore, selectedLeagueId } = ctx;

  const resultDialogOpen = ref(false);
  const resultTarget = ref<any>(null);
  const cancelDialogOpen = ref(false);
  const cancelTarget = ref<any>(null);
  const confirmOpen = ref(false);
  const confirmType = ref<GameConfirmType>("delete");
  const confirmTarget = ref<any>(null);
  const loading = computed(() => handlerStore.loadingBtn);

  const openResult = (game: any) => {
    resultTarget.value = game;
    resultDialogOpen.value = true;
  };
  const openCancel = (game: any) => {
    cancelTarget.value = game;
    cancelDialogOpen.value = true;
  };
  const openConfirm = (type: GameConfirmType, game: any) => {
    confirmType.value = type;
    confirmTarget.value = game;
    confirmOpen.value = true;
  };

  const handle = (key: GameActionKey, game: any) => {
    switch (key) {
      case "reschedule":
        return gameForm.openReschedule(game);
      case "schedule":
        return gameForm.openEditSchedule(game);
      case "result":
        return openResult(game);
      case "cancel":
        return openCancel(game);
      case "start":
      case "clear":
      case "delete":
        return openConfirm(key, game);
    }
  };

  const submitResult = (form: ResultFormState) => {
    const leagueId = selectedLeagueId.value;
    const game = resultTarget.value;
    if (!leagueId || !game) return;

    let body: any;
    if (form.type === "NORMAL") {
      const h = Number(form.homeScore);
      const a = Number(form.awayScore);
      if (
        form.homeScore === "" ||
        form.awayScore === "" ||
        !Number.isInteger(h) ||
        !Number.isInteger(a) ||
        h < 0 ||
        a < 0
      ) {
        handlerStore.setError("امتیازها باید عدد صحیح و غیرمنفی باشند.");
        return;
      }
      if (h === a) {
        handlerStore.setError("در بسکتبال نتیجه‌ی مساوی ثبت نمی‌شود.");
        return;
      }
      body = {
        resultType: "NORMAL",
        homeScore: h,
        awayScore: a,
        resultNote: form.note.trim() || null,
      };
    } else {
      if (!form.forfeitId) {
        handlerStore.setError("تیم فورفیت‌کننده را انتخاب کنید.");
        return;
      }
      body = {
        resultType: "FORFEIT",
        forfeitLeagueTeamId: form.forfeitId,
        resultNote: form.note.trim() || null,
      };
    }

    gameStore.enterGameResult(leagueId, game.id, body).then((ok: any) => {
      if (!ok) return;
      resultDialogOpen.value = false;
      gameForm.onGamesChanged();
    });
  };

  const submitCancel = (reason: string) => {
    const leagueId = selectedLeagueId.value;
    if (!leagueId || !cancelTarget.value) return;
    gameStore
      .updateGameStatus(leagueId, cancelTarget.value.id, {
        status: "CANCELED",
        cancelReason: reason.trim() || null,
      })
      .then((ok: any) => {
        if (!ok) return;
        cancelDialogOpen.value = false;
        gameForm.onGamesChanged();
      });
  };

  const confirmAction = () => {
    const leagueId = selectedLeagueId.value;
    const game = confirmTarget.value;
    if (!leagueId || !game) return;
    const request =
      confirmType.value === "start"
        ? gameStore.updateGameStatus(leagueId, game.id, { status: "LIVE" })
        : confirmType.value === "clear"
          ? gameStore.clearGameResult(leagueId, game.id)
          : gameStore.deleteGame(leagueId, game.id);
    request.then((ok: any) => {
      if (!ok) return;
      confirmOpen.value = false;
      confirmTarget.value = null;
      gameForm.onGamesChanged();
    });
  };

  const closeAll = () => {
    resultDialogOpen.value = false;
    resultTarget.value = null;
    cancelDialogOpen.value = false;
    cancelTarget.value = null;
    confirmOpen.value = false;
    confirmTarget.value = null;
  };

  return {
    resultDialogOpen,
    resultTarget,
    cancelDialogOpen,
    cancelTarget,
    confirmOpen,
    confirmType,
    confirmTarget,
    loading,
    handle,
    submitResult,
    submitCancel,
    confirmAction,
    closeAll,
    openResult,
    openCancel,
    openConfirm,
  };
}
