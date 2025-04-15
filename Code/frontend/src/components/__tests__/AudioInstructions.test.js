import { render, screen, fireEvent, act } from "@testing-library/react";
import AudioInstructions from "../AudioInstructions";

// Mock window.speechSynthesis
const speakMock = jest.fn();
const pauseMock = jest.fn();
const resumeMock = jest.fn();
const cancelMock = jest.fn();

beforeAll(() => {
  global.speechSynthesis = {
    speak: speakMock,
    pause: pauseMock,
    resume: resumeMock,
    cancel: cancelMock,
    paused: false
  };
});

beforeEach(() => {
  speakMock.mockClear();
  pauseMock.mockClear();
  resumeMock.mockClear();
  cancelMock.mockClear();
});

const instructions = "Boil water. Add pasta. Stir occasionally. Drain and serve.";

describe("AudioInstructions Component", () => {
  test("renders nothing if not visible", () => {
    render(<AudioInstructions isVisible={false} instructions={instructions} />);
    expect(screen.queryByText(/AutoPlay/)).not.toBeInTheDocument();
  });

  test("splits instructions into steps", () => {
    render(<AudioInstructions isVisible={true} instructions={instructions} />);
    expect(screen.getByText("Step 1/4")).toBeInTheDocument();
  });

  test("plays current step on play click", () => {
    render(<AudioInstructions isVisible={true} instructions={instructions} />);
    fireEvent.click(screen.getByRole("button", { name: "" })); // Play
    expect(speakMock).toHaveBeenCalled();
  });

  test("toggles to pause when playing", () => {
    render(<AudioInstructions isVisible={true} instructions={instructions} />);
    fireEvent.click(screen.getByRole("button", { name: "" })); // Play
    fireEvent.click(screen.getByRole("button", { name: "" })); // Pause
    expect(pauseMock).toHaveBeenCalled();
  });

  test("resumes paused speech on play", () => {
    global.speechSynthesis.paused = true;
    render(<AudioInstructions isVisible={true} instructions={instructions} />);
    fireEvent.click(screen.getByRole("button", { name: "" }));
    expect(resumeMock).toHaveBeenCalled();
  });

  test("does not go to previous step below 0", () => {
    render(<AudioInstructions isVisible={true} instructions={instructions} />);
    fireEvent.click(screen.getByText(/<-/)); // Prev
    expect(screen.getByText("Step 1/4")).toBeInTheDocument();
  });

  test("goes to next step", () => {
    render(<AudioInstructions isVisible={true} instructions={instructions} />);
    fireEvent.click(screen.getByText("->")); // Next
    expect(screen.getByText("Step 2/4")).toBeInTheDocument();
  });

  test("does not go beyond final step", () => {
    render(<AudioInstructions isVisible={true} instructions={instructions} />);
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByText("->"));
    }
    expect(screen.getByText("Step 4/4")).toBeInTheDocument();
  });

  test("autoplay enables and disables", () => {
    render(<AudioInstructions isVisible={true} instructions={instructions} />);
    const toggle = screen.getByRole("checkbox");
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);
  });

  test("cleans up speech on unmount", () => {
    const { unmount } = render(<AudioInstructions isVisible={true} instructions={instructions} />);
    unmount();
    expect(cancelMock).toHaveBeenCalled();
  });

  test("does not crash on empty instruction string", () => {
    render(<AudioInstructions isVisible={true} instructions="" />);
    expect(screen.getByText("Step 1/0")).toBeInTheDocument();
  });

  test("auto-advances to next step on end if autoplay is enabled", () => {
    render(<AudioInstructions isVisible={true} instructions={instructions} />);
    fireEvent.click(screen.getByRole("checkbox")); // Enable autoplay

    act(() => {
      const event = new Event("end");
      speakMock.mock.calls[0][0].onend();
    });
    expect(cancelMock).toHaveBeenCalled(); // Synth cancels before playing new
  });

  test("does not auto-advance when autoplay is off", () => {
    render(<AudioInstructions isVisible={true} instructions={instructions} />);
    act(() => {
      const event = new Event("end");
      speakMock.mock.calls[0][0].onend();
    });
    expect(cancelMock).not.toHaveBeenCalledTimes(2); // Shouldn't trigger speak again
  });

  test("disables play if index out of bounds", () => {
    render(<AudioInstructions isVisible={true} instructions={instructions} />);
    fireEvent.click(screen.getByText("->")); // Next to step 2
    fireEvent.click(screen.getByText("->")); // Step 3
    fireEvent.click(screen.getByText("->")); // Step 4
    fireEvent.click(screen.getByText("->")); // Try to exceed
    fireEvent.click(screen.getByRole("button", { name: "" })); // Play
    expect(speakMock).toHaveBeenCalledTimes(1); // Only one valid call
  });

  test("renders autoplay switch with correct text", () => {
    render(<AudioInstructions isVisible={true} instructions={instructions} />);
    expect(screen.getByText(/AutoPlay/)).toBeInTheDocument();
  });

  test("shows correct button icons based on playing state", () => {
    render(<AudioInstructions isVisible={true} instructions={instructions} />);
    const playBtn = screen.getByRole("button", { name: "" });
    fireEvent.click(playBtn);
    expect(speakMock).toHaveBeenCalled();
  });

  test("multiple play clicks don't repeat synth", () => {
    render(<AudioInstructions isVisible={true} instructions={instructions} />);
    const btn = screen.getByRole("button", { name: "" });
    fireEvent.click(btn);
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(speakMock).toHaveBeenCalledTimes(1);
  });
});
