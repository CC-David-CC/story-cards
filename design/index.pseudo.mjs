// HIGH-LEVEL PSEUDOCODE ONLY — not an installable module.
// Story Cards | Rive web runtime + application state
// Helper names below are local design roles, NOT host APIs or a new framework.
// Implement as index.mjs only after reading AGENTS.md and the engine guide.

export function mount(host) {
  const body = host.ui.make("div", "window-content");
  body.dataset.game = "story-cards";
  const signalOwner = new AbortController();
  let disposed = false;
  let game = null;
  let released = false;

  // Local helpers create scoped markup; only ui.make is an assumed host API.
  createLocalShell(body, { title: "Story Cards", loading: true });
  // Host file/focus APIs must be discovered, not guessed by this pseudocode.
  bindReviewedHostServicesOrExplicitBrowserFileUI(host, body, signalOwner.signal);

  queueMicrotask(() => { void initializeThisWindow(); });

  async function initializeThisWindow() {
    try {
      const modules = await loadThisGamesPinnedLocalDependencies();
      if (disposed) return;
      // Allocate but do not start loops/audio before the ownership check.
      const created = await createThisGamesEngineModelAndRive({
        modules, container: body, signal: signalOwner.signal,
        gameId: "story-cards", startAutomatically: false
      });
      if (disposed) { releaseLateAllocation(created); return; }
      game = created;
      installGameSpecificActionsAndResize(body, game, signalOwner.signal);
      // See gameplay.pseudo.txt, CONTROLS.md and RIVE.md in this directory.
      installReviewedDocumentActions(game); // transactional load; explicit save kind
      installFocusVisibilityAndErrorHandling(game);
      // Flat app; no immersive session is created.
      showTitleAndPlayablePreview(game);
      startExactlyOnePresentationLoopWhenSized(game);
    } catch (error) {
      // Initializer releases its partial allocations before rejecting. Also release
      // an adopted game if setup failed after creation; release helpers are null-safe.
      stopAcceptingInputAndCancelHeldActions(game);
      stopSimulationPresentationAndOwnedAudio(game);
      finalizeReleaseOnce();
      if (!disposed) showActionableInitializationError(body, error);
    }
  }

  function finalizeReleaseOnce() {
    if (released) return;
    released = true;
    releaseOwnedRiveTexturesAudioWorkersObserversAndEngine(game);
    game = null;
  }

  return {
    element: body,
    dispose() {
      if (disposed) return;
      disposed = true;
      signalOwner.abort();
      stopAcceptingInputAndCancelHeldActions(game);
      stopSimulationPresentationAndOwnedAudio(game);
      finalizeReleaseOnce();
    }
  };
}
