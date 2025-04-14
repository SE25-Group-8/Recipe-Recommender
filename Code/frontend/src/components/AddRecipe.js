// Copyright (C) 2025 SE Recipe Recommender - All Rights Reserved
// You may use, distribute and modify this code under the
// terms of the MIT license.
// You should have received a copy of the MIT license with
// this file. If not, please write to: secheaper@gmail.com

import React, { useState } from 'react';
import {
  useToast,
  Box,
  HStack,
  Text,
  Input,
  InputGroup,
  Button,
  VStack,
  Textarea,
  Badge,
  Wrap,
} from "@chakra-ui/react";
import recipeDB from "../apis/recipeDB";

const AddRecipe = () => {
  const toast = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipe, setRecipe] = useState({
    recipeName: "",
    cookingTime: 0,
    dietType: "",
    recipeRating: 0,
    cuisine: "",
    recipeURL: "",
    imageURL: "",
    instructions: "",
    ingredientCount: 0,
    ingredients: [],
    restaurants: [],
    locations: []
  });

  const addIngredient = () => {
    const ingredient = document.getElementById("ingredients").value;
    if (!ingredient.trim()) return;

    setRecipe(prevValue => ({
      ...prevValue,
      ingredients: [...prevValue.ingredients, ingredient],
      ingredientCount: prevValue.ingredientCount + 1
    }));
    document.getElementById("ingredients").value = "";
  };

  const addRestaurant = () => {
    const restaurant = document.getElementById("restaurant").value;
    if (!restaurant.trim()) return;

    setRecipe(prevValue => ({
      ...prevValue,
      restaurants: [...prevValue.restaurants, restaurant]
    }));
    document.getElementById("restaurant").value = "";
  };

  const addLocation = () => {
    const location = document.getElementById("location").value;
    if (!location.trim()) return;

    setRecipe(prevValue => ({
      ...prevValue,
      locations: [...prevValue.locations, location]
    }));
    document.getElementById("location").value = "";
  };

  const handleChange = (event) => {
    setRecipe(prevValue => ({
      ...prevValue,
      [event.target.id]: event.target.value
    }));
  };

  const handleGenerateRecipe = async () => {
    if (!recipe.recipeName) {
      toast({
        title: "Error",
        description: "Please enter a recipe name first",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await recipeDB.post("/recipes/generateRecipe", {
        recipeName: recipe.recipeName,
        cookingTime: recipe.cookingTime,
        dietType: recipe.dietType,
        cuisine: recipe.cuisine,
        ingredients: recipe.ingredients
      });

      if (response.data && response.data.instructions) {
        setRecipe(prev => ({
          ...prev,
          instructions: response.data.instructions
        }));

        toast({
          title: "Success",
          description: "Recipe instructions generated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error generating recipe:", error);
      toast({
        title: "Error",
        description: "Failed to generate recipe. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addRecipe = () => {
    if (!recipe.recipeName || !recipe.instructions) {
      toast({
        title: "Error",
        description: "Recipe name and instructions are required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    recipeDB
      .post("/recipes/addRecipe", recipe) // Ensure the endpoint is correct
      .then(res => {
        console.log(res.data);
        setRecipe({
          recipeName: "",
          cookingTime: 0,
          dietType: "",
          recipeRating: 0,
          cuisine: "",
          recipeURL: "",
          imageURL: "",
          instructions: "",
          ingredientCount: 0,
          ingredients: [],
          restaurants: [],
          locations: []
        });

        toast({
          title: "Success",
          description: "Recipe added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch(err => console.log("Error adding recipe:", err));
  };

  const ingredientRemoveHandler = (event) => {
    const ingredient = event.target.id;
    const updatedIngredients = recipe.ingredients.filter(item => item !== ingredient);
    setRecipe(prevValue => ({
      ...prevValue,
      ingredients: updatedIngredients
    }));
  };


  const restaurantRemoveHandler = (event) => {
    const restaurant = event.target.id;
    const updatedRestaurants = recipe.restaurants.filter(item => item !== restaurant);
    setRecipe(prevValue => ({
      ...prevValue,
      restaurants: updatedRestaurants
    }));
  };


  const locationRemoveHandler = (event) => {
    const location = event.target.id;
    const updatedLocations = recipe.locations.filter(item => item !== location);
    setRecipe(prevValue => ({
      ...prevValue,
      locations: updatedLocations
    }));
  };

  return (
    <>
      <Box borderRadius={"lg"} border="2px" boxShadow={"lg"} borderColor={"gray.100"} fontFamily="regular" m={'auto'} marginTop={10} width={"50%"} p={5}>
        <Text fontSize={"3xl"} textAlign={'center'} fontWeight={"bold"}>Add New Recipe</Text>
        <VStack spacing={'5'} alignItems={"flex-center"} >
          <HStack spacing={'5'} alignItems={"flex-start"} >
            <Input type={"text"} id="recipeName" onChange={handleChange} placeholder={"Recipe Name"} />
            <Input type={"number"} id="cookingTime" onChange={handleChange} placeholder={"Cooking Time in Mins"} />
          </HStack>
          <HStack spacing={'5'} alignItems={"flex-start"} >
            <Input type={"text"} id="dietType" onChange={handleChange} placeholder={"Diet Type"} />
            <Input type={"number"} id="recipeRating" onChange={handleChange} placeholder={"Recipe Rating"} />
            <Input type={"text"} id="cuisine" onChange={handleChange} placeholder={"Cuisine"} />
          </HStack>
          <HStack spacing={'5'} alignItems={"flex-start"} >
            <Input type={"URL"} id="recipeURL" onChange={handleChange} placeholder={"Recipe URL"} />
            <Input type={"URL"} id="imageURL" onChange={handleChange} placeholder={"Image URL"} />
          </HStack>
          <Box >
            <InputGroup variant={"filled"}>
              <Input type={"text"} marginEnd={"5px"} id="ingredients" placeholder={"Ingredients"} width={"45%"} />
              <Button mr={10} width={"5%"} onClick={addIngredient} _hover={{ bg: 'black', color: "gray.100" }} color={"gray.600"} bg={"green.300"}>Add</Button>
            </InputGroup>
            <Wrap mt={3}>
              {recipe.ingredients.map(ingredient => (
                <Badge
                  key={ingredient}
                  id={ingredient}
                  m={1}
                  _hover={{ cursor: "pointer",  bg: "red.100", color: "red.800", borderColor: "red.300", }}
                  onClick={ingredientRemoveHandler}
                  colorScheme="green"
                >
                  {ingredient}
                </Badge>
              ))}
            </Wrap>
          </Box>
          <Box>
            <InputGroup variant={"filled"}>
              <Input type="text" marginEnd={"5px"} id="restaurant" placeholder={"Restaurant"} width="45%" />
              <Button id="restaurantButton" width="5%" mr={10} onClick={addRestaurant} _hover={{ bg: 'black', color: "gray.100" }} color={"gray.600"} bg={"green.300"}>Add</Button>
            </InputGroup>
            <Wrap mt={3}>
              {recipe.restaurants.map(restaurant => (
                <Badge
                  key={restaurant} 
                  id={restaurant}
                  m={1}
                  _hover={{ cursor: "pointer",  bg: "red.100", color: "red.800", borderColor: "red.300", }}
                  onClick={restaurantRemoveHandler}
                  colorScheme="green"
                >
                  {restaurant}
                </Badge>
              ))}
            </Wrap>
          </Box>
          <Box>
            <InputGroup variant={"filled"}>
              <Input type="text" marginEnd={"5px"} id="location" placeholder={"Restaurant-Location"} width="45%" />
              <Button id="locationButton" width="5%" mr={10} onClick={addLocation} _hover={{ bg: 'black', color: "gray.100" }} color={"gray.600"} bg={"green.300"}>Add</Button>
            </InputGroup>
            <Wrap mt={3}>
              {recipe.locations.map(location => (
                <Badge
                  key={location} // Add unique key for each item
                  id={location}
                  m={1}
                  _hover={{ cursor: "pointer",  bg: "red.100", color: "red.800", borderColor: "red.300", }}
                  onClick={locationRemoveHandler}
                  colorScheme="green"
                >
                  {location}
                </Badge>
              ))}
            </Wrap>
          </Box>
          {/* <Button width="30%" m="auto" onClick={handleGenerateRecipe} _hover={{ bg: "black", color: "gray.100" }} color="gray.600" bg="green.300" isDisabled={isGenerating}>
            Generate Recipe
          </Button> */}
          <Textarea value={recipe.instructions} onChange={handleChange} id="instructions" placeholder={"Write Cooking Instructions Here"} />
          <Button width={"30%"} m={'auto'} id="addRecipeButton" onClick={addRecipe} _hover={{ bg: 'black', color: "gray.100" }} color={"gray.600"} bg={"green.300"}>
            Add Recipe
          </Button>
        </VStack>
      </Box>
    </>
  );
};

export default AddRecipe;
