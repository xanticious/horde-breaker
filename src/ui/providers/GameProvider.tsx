import React from "react";
import { useActorRef, useSelector as useXstateSelector } from "@xstate/react";
import type { Actor, ActorOptions, SnapshotFrom } from "xstate";
import { gameMachine } from "@core/machines/gameMachine";
import { parseDebugConfig } from "@debug/DebugConfig";
import { setupInspector } from "@debug/StateInspector";

// Initialise the inspector once at module load, before any actors are created.
// Returns null in production or when ?debug=true is absent.
const _inspector = setupInspector(parseDebugConfig());

// Raw React context — exported so tests can inject a pre-created actor via
// `_GameActorRawContext.Provider value={actor}` without any hooks involved.
const _GameActorRawContext = React.createContext<Actor<typeof gameMachine> | null>(null);

function useGameActorOrThrow(): Actor<typeof gameMachine> {
  const actor = React.useContext(_GameActorRawContext);
  if (!actor) throw new Error("GameActorContext: no actor found in context.");
  return actor;
}

// Sub-component that owns the useActorRef hook so the parent Provider can
// branch on `value` without violating the Rules of Hooks.
function GameProviderViaHook({
  children,
  options,
}: {
  children: React.ReactNode;
  options?: ActorOptions<typeof gameMachine>;
}) {
  const actor = useActorRef(gameMachine, options ?? {});
  return <_GameActorRawContext.Provider value={actor}>{children}</_GameActorRawContext.Provider>;
}

interface GameActorProviderProps {
  children: React.ReactNode;
  /** Creates the actor internally with these options (normal usage). */
  options?: ActorOptions<typeof gameMachine>;
  /** Inject a pre-created actor directly — intended for tests only. */
  value?: Actor<typeof gameMachine>;
  /** @deprecated Use `logic` instead — kept to satisfy legacy type checks. */
  logic?: typeof gameMachine;
  /** @deprecated Use `logic` instead — never valid, present for compat. */
  machine?: never;
}

function GameActorProvider({ children, options, value }: GameActorProviderProps) {
  if (value !== undefined) {
    // Test path: bypass hook-driven actor creation and use the injected actor.
    return <_GameActorRawContext.Provider value={value}>{children}</_GameActorRawContext.Provider>;
  }
  return <GameProviderViaHook options={options}>{children}</GameProviderViaHook>;
}

/**
 * React context for the root game actor.
 * Components can use GameActorContext.useActorRef() to send events,
 * or GameActorContext.useSelector() to read specific state slices.
 */
export const GameActorContext = {
  Provider: GameActorProvider,
  useActorRef: useGameActorOrThrow,
  useSelector<T>(
    selector: (snapshot: SnapshotFrom<typeof gameMachine>) => T,
    compare?: (a: T, b: T) => boolean,
  ): T {
    return useXstateSelector(useGameActorOrThrow(), selector, compare);
  },
};

interface GameProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps the app in the game actor context.
 * Must be mounted once at the root of the component tree.
 *
 * When `?debug=true` is set (dev builds only), the Stately browser inspector
 * is attached via the `inspect` actor option so all state transitions are
 * visible at https://stately.ai/inspector.
 */
export function GameProvider({ children }: GameProviderProps) {
  return (
    <GameActorContext.Provider options={_inspector ? { inspect: _inspector.inspect } : undefined}>
      {children}
    </GameActorContext.Provider>
  );
}
