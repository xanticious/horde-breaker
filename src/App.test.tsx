import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import App from "./App";

// GameScreen renders a PixiJS canvas, which requires WebGL/Canvas2D — not available
// in jsdom. Mock the renderer so navigation tests work without a real GPU context.
// Must use a regular function (not arrow) so `new GameRenderer()` works.
vi.mock("@rendering/GameRenderer", () => {
  const GameRenderer = vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.init = vi.fn().mockResolvedValue(undefined);
    this.setTraversalContext = vi.fn();
    this.setDuelContext = vi.fn();
    this.setMode = vi.fn();
    this.startGameLoop = vi.fn();
    this.destroy = vi.fn();
  });
  return { GameRenderer };
});

describe("App — screen navigation", () => {
  it("renders the title screen on load", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /horde breaker/i })).toBeInTheDocument();
  });

  it("navigates from Title → Hero Select on Play", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /play/i }));

    expect(screen.getByRole("heading", { name: /select your hero/i })).toBeInTheDocument();
  });

  it("navigates from Hero Select → Upgrade on hero selection", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /play/i }));
    await user.click(screen.getByRole("button", { name: /barbarian berzerker/i }));

    expect(screen.getByRole("heading", { name: /upgrades/i })).toBeInTheDocument();
  });

  it("navigates from Upgrade → Game Screen on Start Run", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /play/i }));
    await user.click(screen.getByRole("button", { name: /barbarian berzerker/i }));
    await user.click(screen.getByRole("button", { name: /start run/i }));

    // GameScreen no longer has a placeholder heading — PixiJS renders into the
    // canvas div. Assert on the always-visible End Run button instead.
    expect(screen.getByRole("button", { name: /end run/i })).toBeInTheDocument();
  });

  it("navigates from Game → Results → Upgrade on End Run + Continue", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /play/i }));
    await user.click(screen.getByRole("button", { name: /barbarian berzerker/i }));
    await user.click(screen.getByRole("button", { name: /start run/i }));
    await user.click(screen.getByRole("button", { name: /end run/i }));

    // The results heading is now dynamic — it shows "Fallen", "Victory!", or
    // "Time's Up" depending on the run result. Check for the Continue button as
    // a more stable navigation assertion.
    expect(screen.getByRole("button", { name: /continue to upgrades/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /continue to upgrades/i }));

    expect(screen.getByRole("heading", { name: /upgrades/i })).toBeInTheDocument();
  });

  it("navigates from Upgrade → Hero Select on Back to Hero Select", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /play/i }));
    await user.click(screen.getByRole("button", { name: /barbarian berzerker/i }));
    await user.click(screen.getByRole("button", { name: /back to hero select/i }));

    expect(screen.getByRole("heading", { name: /select your hero/i })).toBeInTheDocument();
  });

  it("completes a full loop: Title → Select → Upgrade → Run → Results → Upgrade → Run", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Title → Hero Select
    await user.click(screen.getByRole("button", { name: /play/i }));
    // Hero Select → Upgrade
    await user.click(screen.getByRole("button", { name: /barbarian berzerker/i }));
    // Upgrade → Run
    await user.click(screen.getByRole("button", { name: /start run/i }));
    // Run → Results
    await user.click(screen.getByRole("button", { name: /end run/i }));
    // Results → Upgrade
    await user.click(screen.getByRole("button", { name: /continue to upgrades/i }));
    // Second run
    await user.click(screen.getByRole("button", { name: /start run/i }));

    // GameScreen shows the End Run button when active (no placeholder heading)
    expect(screen.getByRole("button", { name: /end run/i })).toBeInTheDocument();
  });
});
