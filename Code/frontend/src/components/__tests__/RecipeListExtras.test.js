import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import RecipeList from "../RecipeList";
import React from "react";
import "@testing-library/jest-dom";
import { useToast } from "@chakra-ui/react";

jest.mock("@chakra-ui/react", () => ({
  ...jest.requireActual("@chakra-ui/react"),
  useToast: jest.fn(),
}));

const mockToast = jest.fn();
useToast.mockImplementation(() => mockToast);

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

const mockRecipes = [
  {
    _id: "1",
    TranslatedRecipeName: "Pasta",
    TotalTimeInMins: 30,
    "Recipe-rating": 4,
    "Diet-type": "Vegetarian",
    "image-url": "",
    TranslatedIngredients: "Tomato, Pasta, Salt",
    TranslatedInstructions: "Boil water. Add pasta. Stir. Drain.",
  },
];

describe("RecipeList - Copy & DarkMode", () => {
  test("copies ingredients with bullet points", () => {
    render(<RecipeList recipes={mockRecipes} darkMode={false} />);
    fireEvent.click(screen.getByText("Pasta"));
    fireEvent.click(screen.getByText("Copy", { exact: false }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("• Tomato")
    );
    expect(mockToast).toHaveBeenCalled();
  });

  test("copies instructions without formatting", () => {
    render(<RecipeList recipes={mockRecipes} darkMode={false} />);
    fireEvent.click(screen.getByText("Pasta"));
    fireEvent.click(screen.getAllByText("Copy")[1]);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("Boil water")
    );
  });

  test("displays Audio Instructions component when play is clicked", () => {
    render(<RecipeList recipes={mockRecipes} darkMode={false} />);
    fireEvent.click(screen.getByText("Pasta"));
    const playBtn = screen.getByText("Play Instructions");
    fireEvent.click(playBtn);
    expect(screen.getByText("AutoPlay next step")).toBeInTheDocument();
  });

  test("toggles play button to close", () => {
    render(<RecipeList recipes={mockRecipes} darkMode={false} />);
    fireEvent.click(screen.getByText("Pasta"));
    const playBtn = screen.getByText("Play Instructions");
    fireEvent.click(playBtn);
    const closeBtn = screen.getByText("Close Audio Instructions");
    expect(closeBtn).toBeInTheDocument();
  });

  test("applies dark mode styles to modal", () => {
    render(<RecipeList recipes={mockRecipes} darkMode={true} />);
    fireEvent.click(screen.getByText("Pasta"));
    expect(screen.getByTestId("recipeModal")).toHaveStyle("background-color: gray.700");
  });

  test("applies light mode styles to modal", () => {
    render(<RecipeList recipes={mockRecipes} darkMode={false} />);
    fireEvent.click(screen.getByText("Pasta"));
    expect(screen.getByTestId("recipeModal")).toHaveStyle("background-color: white");
  });
});
