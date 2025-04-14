import { render, cleanup, screen, fireEvent, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom';
import RecipeList from "../RecipeList";
import React from 'react';
import recipeDB from '.../apis/recipeDB';

const recipes=[
    {
        TranslatedRecipeName: "Spicy Tomato Rice (Recipe)",
        TotalTimeInMins: 15,
        'Recipe-rating':2,
        'Diet-type': "Vegan", 
        'image-url': "https://www.archanaskitchen.com/images/archanaskitchen/1-Author/b.yojana-gmail.com/Spicy_Thakkali_Rice_Tomato_Pulihora-1_edited.jpg",
        TranslatedInstructions: "To make tomato puliogere, first cut the tomatoes.\r\nNow put in a mixer grinder and puree it.\r\nNow heat oil in a pan.\r\nAfter the oil is hot, add chana dal, urad dal, cashew and let it cook for 10 to 20 seconds.\r\nAfter 10 to 20 seconds, add cumin seeds, mustard seeds, green chillies, dry red chillies and curry leaves.\r\nAfter 30 seconds, add tomato puree to it and mix.\r\nAdd BC Belle Bhat powder, salt and mix it.\r\nAllow to cook for 7 to 8 minutes and then turn off the gas.\r\nTake it out in a bowl, add cooked rice and mix it.\r\nServe hot.\r\nServe tomato puliogre with tomato cucumber raita and papad for dinner.",
        youtube_videos: "https://www.youtube.com/results?search_query=Spicy Tomato Rice (Recipe)"
    }
]

const emptyRecipes=[]

test("should render recipe card name", ()=>{
    render(<RecipeList recipes={recipes} />)
    const recipeNameElement = screen.getByTestId('recipeName')
    expect(recipeNameElement).toBeInTheDocument()
    expect(recipeNameElement).toHaveTextContent(recipes[0].TranslatedRecipeName)
})

test("should render recipe card time", ()=>{
    render(<RecipeList recipes={recipes} />)
    const recipeTimeElement = screen.getByTestId('time')
    expect(recipeTimeElement).toBeInTheDocument()
    expect(recipeTimeElement).toHaveTextContent(recipes[0].TotalTimeInMins)

})

test("should render recipe card rating", ()=>{
    render(<RecipeList recipes={recipes} />)
    const recipeRatingElement = screen.getByTestId('rating')
    expect(recipeRatingElement).toBeInTheDocument()
    expect(recipeRatingElement).toHaveTextContent(recipes[0]['Recipe-rating'])

})

test("should render recipe card diet", ()=>{
    render(<RecipeList recipes={recipes} />)
    const dietElement = screen.getByTestId('diet')
    expect(dietElement).toBeInTheDocument()
    expect(dietElement).toHaveTextContent(recipes[0]['Diet-type'])

})

test("should render recipe card image", ()=>{
    render(<RecipeList recipes={recipes} />)
    const imageElement = screen.getByTestId('recipeImg')
    expect(imageElement).toBeInTheDocument()
})

test("should not render recipe cards", ()=>{
    render(<RecipeList recipes={emptyRecipes} />)
    const noResponseElement = screen.getByTestId('noResponseText')
    expect(noResponseElement).toBeInTheDocument()
    expect(noResponseElement).toHaveTextContent("Searching for a recipe?")
})

test("should render recipe details modal on click", ()=>{
    render(<RecipeList recipes={recipes} />)
    const cardElement = screen.getByTestId('recipeCard')
    expect(cardElement).toBeInTheDocument()
    fireEvent.click(cardElement)
    const modalElement = screen.getByTestId('recipeModal')
    expect(modalElement).toBeInTheDocument()
})


//tests added by agala2

// Mock the API module
jest.mock('.../apis/recipeDB', () => ({
    post: jest.fn()
  }));
  
  // Mock the external components and libraries
  jest.mock('react-markdown', () => (props) => <div data-testid="markdown">{props.children}</div>);
  jest.mock('react-icons/fa', () => ({
    FaPaperPlane: () => <div data-testid="paper-plane-icon" />
  }));
  jest.mock('../RecipeCard', () => ({ handler, recipe }) => (
    <div data-testid="recipe-card" onClick={() => handler(recipe)}>
      {recipe.TranslatedRecipeName}
    </div>
  ));
  
  describe('RecipeList Component', () => {
    const mockRecipes = [
      {
        _id: '1',
        TranslatedRecipeName: 'Test Recipe 1',
        'Recipe-rating': '4.5',
        'Diet-type': 'Vegetarian',
        TotalTimeInMins: 30,
        TranslatedInstructions: 'Test instructions 1',
        'image-url': 'test-image-1.jpg',
        Calories: '300'
      },
      {
        _id: '2',
        TranslatedRecipeName: 'Test Recipe 2',
        'Recipe-rating': '4.0',
        'Diet-type': 'Non-Vegetarian',
        TotalTimeInMins: 45,
        TranslatedInstructions: 'Test instructions 2',
        'image-url': 'test-image-2.jpg',
        Calories: 'Not Available'
      }
    ];

    const manyRecipes = Array.from({ length: 35 }, (_, index) => ({
      _id: `${index}`,
      TranslatedRecipeName: `Recipe ${index + 1}`,
      TotalTimeInMins: 10,
      'Recipe-rating': 4,
      'Diet-type': "Vegetarian",
      'image-url': "",
      TranslatedInstructions: "Step 1. Step 2.",
      TranslatedIngredients: "Salt, Pepper, Tomato",
    }));
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    // Test 1
    test('renders recipe cards when recipes are provided', () => {
      render(<RecipeList recipes={mockRecipes} />);
      expect(screen.getAllByTestId('recipe-card')).toHaveLength(2);
    });
  
    // Test 2
    test('displays "Searching for a recipe?" when no recipes are provided', () => {
      render(<RecipeList recipes={[]} />);
      expect(screen.getByTestId('noResponseText')).toHaveTextContent('Searching for a recipe?');
    });
  
    // Test 3
    test('opens modal when recipe card is clicked', () => {
      render(<RecipeList recipes={mockRecipes} />);
      fireEvent.click(screen.getAllByTestId('recipe-card')[0]);
      expect(screen.getByTestId('recipeModal')).toBeInTheDocument();
      expect(screen.getByText('Test Recipe 1')).toBeInTheDocument();
    });
  
    // Test 4
    test('closes modal when close button is clicked', () => {
      render(<RecipeList recipes={mockRecipes} />);
      
      // Open modal
      fireEvent.click(screen.getAllByTestId('recipe-card')[0]);
      expect(screen.getByTestId('recipeModal')).toBeInTheDocument();
      
      // Close modal
      fireEvent.click(screen.getByText('Close'));
      expect(screen.queryByTestId('recipeModal')).not.toBeInTheDocument();
    });
  
    // Test 5
    test('displays actual calories when available', () => {
      render(<RecipeList recipes={mockRecipes} />);
      fireEvent.click(screen.getAllByTestId('recipe-card')[0]);
      expect(screen.getByText(/Calories:/)).toBeInTheDocument();
      expect(screen.getByText(/300 kcal/)).toBeInTheDocument();
    });
  
    // Test 6
    test('calculates estimated calories when calories are not available', () => {
      render(<RecipeList recipes={mockRecipes} />);
      fireEvent.click(screen.getAllByTestId('recipe-card')[1]);
      expect(screen.getByText(/Calories:/)).toBeInTheDocument();
      expect(screen.getByText(/425 kcal \(Estimated\)/)).toBeInTheDocument();
    });
  
    // Test 7
    test('renders YouTube link with correct search query', () => {
      render(<RecipeList recipes={mockRecipes} />);
      fireEvent.click(screen.getAllByTestId('recipe-card')[0]);
      
      const youtubeLink = screen.getByText('Youtube');
      expect(youtubeLink).toHaveAttribute(
        'href', 
        'https://www.youtube.com/results?search_query=Test Recipe 1'
      );
    });
  
    // Test 8
    test('AI prompt input changes when user types', async () => {
      render(<RecipeList recipes={mockRecipes} />);
      
      // Open modal
      fireEvent.click(screen.getAllByTestId('recipe-card')[0]);
      
      // Find input and type in it
      const promptInput = screen.getByPlaceholderText(/What can I substitute/);
      fireEvent.change(promptInput, { target: { value: 'Test prompt' } });
      
      expect(promptInput.value).toBe('Test prompt');
    });
  
    // Test 9
    test('calls AI API when submit button is clicked', async () => {
      recipeDB.post.mockResolvedValueOnce({
        status: 200,
        data: { response: 'AI test response' }
      });
      
      render(<RecipeList recipes={mockRecipes} />);
      
      // Open modal
      fireEvent.click(screen.getAllByTestId('recipe-card')[0]);
      
      // Type in prompt and submit
      const promptInput = screen.getByPlaceholderText(/What can I substitute/);
      fireEvent.change(promptInput, { target: { value: 'Test prompt' } });
      
      const submitButton = screen.getByLabelText('Send prompt to AI Chef');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(recipeDB.post).toHaveBeenCalledWith('/recipes/aiChef', {
          context: {
            recipeName: 'Test Recipe 1',
            instructions: 'Test instructions 1',
            dietType: 'Vegetarian',
            query: 'Test prompt'
          }
        });
      });
    });
  
    // Test 10
    test('submits AI prompt when Enter key is pressed', async () => {
      recipeDB.post.mockResolvedValueOnce({
        status: 200,
        data: { response: 'AI test response' }
      });
      
      render(<RecipeList recipes={mockRecipes} />);
      
      // Open modal
      fireEvent.click(screen.getAllByTestId('recipe-card')[0]);
      
      // Type in prompt and press Enter
      const promptInput = screen.getByPlaceholderText(/What can I substitute/);
      fireEvent.change(promptInput, { target: { value: 'Test prompt' } });
      fireEvent.keyPress(promptInput, { key: 'Enter', code: 13, charCode: 13 });
      
      await waitFor(() => {
        expect(recipeDB.post).toHaveBeenCalledWith('/recipes/aiChef', {
          context: expect.any(Object)
        });
      });
    });
  
    // Test 11
    test('displays AI response when API call is successful', async () => {
      recipeDB.post.mockResolvedValueOnce({
        status: 200,
        data: { response: 'AI test response' }
      });
      
      render(<RecipeList recipes={mockRecipes} />);
      
      // Open modal
      fireEvent.click(screen.getAllByTestId('recipe-card')[0]);
      
      // Type in prompt and submit
      const promptInput = screen.getByPlaceholderText(/What can I substitute/);
      fireEvent.change(promptInput, { target: { value: 'Test prompt' } });
      
      const submitButton = screen.getByLabelText('Send prompt to AI Chef');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('markdown')).toHaveTextContent('AI test response');
      });
    });
  
    // Test 12
    test('displays error message when API call fails', async () => {
      recipeDB.post.mockRejectedValueOnce(new Error('API Error'));
      
      render(<RecipeList recipes={mockRecipes} />);
      
      // Open modal
      fireEvent.click(screen.getAllByTestId('recipe-card')[0]);
      
      // Type in prompt and submit
      const promptInput = screen.getByPlaceholderText(/What can I substitute/);
      fireEvent.change(promptInput, { target: { value: 'Test prompt' } });
      
      const submitButton = screen.getByLabelText('Send prompt to AI Chef');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('markdown')).toHaveTextContent(/Sorry, I couldn't process your request/);
      });
    });
  
    // Test 13
    test('clears AI response when a new recipe is selected', () => {
      recipeDB.post.mockResolvedValueOnce({
        status: 200,
        data: { response: 'AI test response' }
      });
      
      render(<RecipeList recipes={mockRecipes} />);
      
      // Open modal for first recipe
      fireEvent.click(screen.getAllByTestId('recipe-card')[0]);
      
      // Type in prompt and submit
      const promptInput = screen.getByPlaceholderText(/What can I substitute/);
      fireEvent.change(promptInput, { target: { value: 'Test prompt' } });
      
      const submitButton = screen.getByLabelText('Send prompt to AI Chef');
      fireEvent.click(submitButton);
      
      // Close modal
      fireEvent.click(screen.getByText('Close'));
      
      // Open modal for second recipe
      fireEvent.click(screen.getAllByTestId('recipe-card')[1]);
      
      // Check that AI response is cleared
      expect(screen.queryByTestId('markdown')).not.toBeInTheDocument();
    });
  
    // Test 14
    test('does not make API call if AI prompt is empty', async () => {
      render(<RecipeList recipes={mockRecipes} />);
      
      // Open modal
      fireEvent.click(screen.getAllByTestId('recipe-card')[0]);
      
      // Submit with empty prompt
      const submitButton = screen.getByLabelText('Send prompt to AI Chef');
      fireEvent.click(submitButton);
      
      expect(recipeDB.post).not.toHaveBeenCalled();
    });
  
    // Test 15
    test('shows loading state while waiting for AI response', async () => {
      // Use a promise that we can resolve manually to control the timing
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      recipeDB.post.mockReturnValueOnce(promise);
      
      render(<RecipeList recipes={mockRecipes} />);
      
      // Open modal
      fireEvent.click(screen.getAllByTestId('recipe-card')[0]);
      
      // Type in prompt and submit
      const promptInput = screen.getByPlaceholderText(/What can I substitute/);
      fireEvent.change(promptInput, { target: { value: 'Test prompt' } });
      
      const submitButton = screen.getByLabelText('Send prompt to AI Chef');
      fireEvent.click(submitButton);
      
      // Check that button is in loading state
      expect(submitButton).toHaveAttribute('data-loading');
      
      // Resolve the promise to complete the API call
      resolvePromise({
        status: 200,
        data: { response: 'AI test response' }
      });
      
      await waitFor(() => {
        expect(submitButton).not.toHaveAttribute('data-loading');
      });
    });


    //Pagination Tests
    afterEach(cleanup);

    test("renders only 15 recipes on first page", () => {
      render(<RecipeList recipes={manyRecipes} />);
      const cards = screen.getAllByTestId("recipeCard");
      expect(cards.length).toBe(15);
    });

    test("pagination buttons are displayed if recipes.length > 15", () => {
      render(<RecipeList recipes={manyRecipes} />);
      expect(screen.getByText("Next")).toBeInTheDocument();
      expect(screen.getByText("Previous")).toBeInTheDocument();
    });

    test("does not show pagination if no recipes", () => {
      render(<RecipeList recipes={[]} />);
      expect(screen.queryByText("Next")).not.toBeInTheDocument();
      expect(screen.queryByText("Previous")).not.toBeInTheDocument();
    });

    test("clicking 'Next' shows the next set of recipes", async () => {
      render(<RecipeList recipes={manyRecipes} />);
      fireEvent.click(screen.getByText("Next"));
      const cards = await screen.findAllByTestId("recipeCard");
      expect(cards[0]).toHaveTextContent("Recipe 16");
    });

    test("clicking 'Previous' goes back to previous set of recipes", async () => {
      render(<RecipeList recipes={manyRecipes} />);
      fireEvent.click(screen.getByText("Next"));
      fireEvent.click(screen.getByText("Previous"));
      const cards = await screen.findAllByTestId("recipeCard");
      expect(cards[0]).toHaveTextContent("Recipe 1");
    });

    test("disables 'Previous' button on first page", () => {
      render(<RecipeList recipes={manyRecipes} />);
      expect(screen.getByText("Previous")).toBeDisabled();
    });

    test("disables 'Next' button on last page", async () => {
      render(<RecipeList recipes={manyRecipes} />);
      fireEvent.click(screen.getByText("Next")); // Go to page 2 (16-30)
      fireEvent.click(screen.getByText("Next")); // Go to page 3 (31-35)
      expect(screen.getByText("Next")).toBeDisabled();
    });

    test("shows correct pagination text: 1–15 of 35", () => {
      render(<RecipeList recipes={manyRecipes} />);
      expect(screen.getByText("Showing 1–15 of 35 recipes")).toBeInTheDocument();
    });

    test("shows correct pagination text: 16–30 of 35", () => {
      render(<RecipeList recipes={manyRecipes} />);
      fireEvent.click(screen.getByText("Next"));
      expect(screen.getByText("Showing 16–30 of 35 recipes")).toBeInTheDocument();
    });

    test("shows correct pagination text: 31–35 of 35", () => {
      render(<RecipeList recipes={manyRecipes} />);
      fireEvent.click(screen.getByText("Next"));
      fireEvent.click(screen.getByText("Next"));
      expect(screen.getByText("Showing 31–35 of 35 recipes")).toBeInTheDocument();
    });


  });