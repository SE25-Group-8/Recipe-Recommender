import pytest

class MockAppState:
    def __init__(self):
        self.darkMode = False

    def handleDarkModeToggle(self):
        self.darkMode = not self.darkMode

@pytest.fixture
def app_state():
    return MockAppState()


def test_dark_mode_default_off(app_state):
    assert app_state.darkMode is False


def test_dark_mode_toggle_on(app_state):
    app_state.handleDarkModeToggle()
    assert app_state.darkMode is True


def test_dark_mode_toggle_off(app_state):
    app_state.handleDarkModeToggle()
    app_state.handleDarkModeToggle()
    assert app_state.darkMode is False


def test_multiple_toggles_odd(app_state):
    for _ in range(5):
        app_state.handleDarkModeToggle()
    assert app_state.darkMode is True


def test_multiple_toggles_even(app_state):
    for _ in range(6):
        app_state.handleDarkModeToggle()
    assert app_state.darkMode is False


def test_toggle_consistency(app_state):
    expected = False
    for _ in range(10):
        app_state.handleDarkModeToggle()
        expected = not expected
        assert app_state.darkMode == expected


def test_initial_state_isolated():
    state1 = MockAppState()
    state2 = MockAppState()
    state1.handleDarkModeToggle()
    assert state1.darkMode is True
    assert state2.darkMode is False


def test_state_after_reset(app_state):
    app_state.handleDarkModeToggle()
    app_state.darkMode = False  # Reset
    assert app_state.darkMode is False


def test_state_is_boolean(app_state):
    app_state.handleDarkModeToggle()
    assert isinstance(app_state.darkMode, bool)


def test_dark_mode_manual_set(app_state):
    app_state.darkMode = True
    assert app_state.darkMode is True

def test_toggle_back_and_forth(app_state):
    app_state.handleDarkModeToggle()
    app_state.handleDarkModeToggle()
    app_state.handleDarkModeToggle()
    assert app_state.darkMode is True


def test_toggle_twice_then_set_false(app_state):
    app_state.handleDarkModeToggle()
    app_state.handleDarkModeToggle()
    app_state.darkMode = False
    assert app_state.darkMode is False


def test_manual_override_after_toggle(app_state):
    app_state.handleDarkModeToggle()
    app_state.darkMode = False
    assert app_state.darkMode is False


def test_manual_override_then_toggle(app_state):
    app_state.darkMode = True
    app_state.handleDarkModeToggle()
    assert app_state.darkMode is False


def test_multiple_instances_independence():
    a = MockAppState()
    b = MockAppState()
    a.handleDarkModeToggle()
    assert a.darkMode is True
    assert b.darkMode is False


def test_toggle_large_number_odd(app_state):
    for _ in range(101):
        app_state.handleDarkModeToggle()
    assert app_state.darkMode is True


def test_toggle_large_number_even(app_state):
    for _ in range(1000):
        app_state.handleDarkModeToggle()
    assert app_state.darkMode is False


def test_toggle_and_check_midway(app_state):
    for i in range(4):
        app_state.handleDarkModeToggle()
        expected = i % 2 == 0
        assert app_state.darkMode is expected


def test_dark_mode_strict_comparison_true(app_state):
    app_state.handleDarkModeToggle()
    assert app_state.darkMode is True


def test_dark_mode_strict_comparison_false(app_state):
    assert app_state.darkMode is False