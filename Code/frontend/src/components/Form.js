import React, { Component } from "react";
import {
  HStack,
  Button,
  Input,
  InputGroup,
  Switch,
  Box,
  VStack,
  Text,
  InputRightElement,
  FormLabel,
  Badge,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import recipeDB from "../apis/recipeDB";
import TypeAheadDropDown from "./TypeAheadDropDown";

class Form extends Component {
  constructor() {
    super();

    this.state = {
      ingredients: new Set(),
      cuisineState: 0,
      cuisine: "",
      maxTime: "", // New state for max time
      type: "",
      isLoading: false, // New state for loading
      generatedRecipe: null, // New state for generated recipe
      isModalOpen: false, // New state for modal open/close
    };
  }

  async componentDidMount() {
    try {
      const response = await recipeDB.get("/recipes/callIngredients/");
      this.setState({
        ingredient_list: response.data,
        cuisine_list: [
          "Mexican",
          "South Indian",
          "Chinese",
          "Thai",
          "Japanese",
          "Gujarati",
          "North Indian",
          "Lebanese",
          "Mediterranean",
          "Middle East",
          "Italian",
          "Continental",
          "Latin",
          "American",
          "Other",
          "Swedish",
          "Latvian",
          "Spanish",
          "Scottish",
          "British",
          "Indian",
          "Canadian",
          "Russian",
          "Jewish",
          "Polish",
          "German",
          "French",
          "Hawaiian",
          "Brazilian",
          "Peruvian",
          "Cuban",
          "Tibetian",
          "Salvadorian",
          "Egyptian",
          "Greek",
          "Belgian",
          "Irish",
          "Welsh",
          "Mormon",
          "Cajun",
          "Portugese",
          "Turkish",
          "Haitian",
          "Tahitian",
          "Kenyan",
          "Korean",
          "Algerian",
          "Nigerian",
          "Libyan",
        ],
      });
    } catch (err) {
      console.log(err);
    }
  }

  printHandler = () => {
    const items = [...this.state.ingredients];
    const list_items = items.map((item) => (
      <Badge
        id={item}
        key={item}
        m={1}
        _hover={{ cursor: "pointer" }}
        onClick={this.removeHandler}
        colorScheme="green"
      >
        {item}
      </Badge>
    ));
    return <ul class="addedIngredientList">{list_items}</ul>;
  };

  addHandler = (event) => {
    const ingredient = document.getElementById("ingredient").value;
    this.setState(
      {
        ingredients: new Set(this.state.ingredients).add(ingredient),
      },
      () => console.log(this.state)
    );
    // document.getElementById("ingredient").value = "";
  };

  removeHandler = (event) => {
    var discardIngredient = event.target.id;
    var ingredientList = this.state.ingredients;
    ingredientList.delete(discardIngredient);

    this.setState(
      {
        ingredients: ingredientList,
      },
      () => console.log(this.state)
    );
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const dict = {
      ingredient: this.state.ingredients,
      cuisine: document.getElementById("cuisine").value,
      email_id: document.getElementById("email_id").value,
      flag: document.getElementById("Send_email").checked,
      TotalTimeInMins: document.getElementById("max_time").value,
      type: document.getElementById("type").value,
    };
    this.props.sendFormData(dict);
    console.log(dict);
    // document.getElementById("cuisine").value = "";
    // document.getElementById("email_id").value = "";
  };

  handleGenerateRecipe = async () => {
    this.setState({ isLoading: true, generatedRecipe: null, isModalOpen: true }); // Open the modal
    const { ingredients, cuisine, maxTime, type } = this.state;
    const ingredientArray = Array.from(ingredients);
    const cuisineFromForm = document.getElementById("cuisine").value; //weird bug where cuisine is not being set in state

    try {
      const response = await recipeDB.post("/recipes/generateRecipe", {
        ingredients: ingredientArray,
        cuisineFromForm,
        maxTime,
        type,
      });

      // console.log("Response----------------------------------------:", response);

      if (response.data) {
        // console.log("Generated Recipe:", response.response.text);
        this.setState({ generatedRecipe: response.data.generatedRecipe });
      }
    } catch (error) {
      console.error("Error generating recipe:", error);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  closeModal = () => {
    this.setState({ isModalOpen: false });
  };

  // Event handler for toggling dark mode. 
  toggleDarkMode = () => {
    this.setState((prevState) => ({
      darkMode: !prevState.darkMode,
    }));
  };

  render() {
    const { isLoading, generatedRecipe, isModalOpen} = this.state; // Updated to handle dark mode toggling. 

    return (
      <>
        <Box
          borderRadius={"lg"}
          border="2px"
          boxShadow={"lg"}
          borderColor={"gray.100"}
          fontFamily="regular"
          m={10}
          width={"23%"}
          height="fit-content"
          p={5}
        >
          <VStack spacing={"5"} alignItems={"flex-start"}>

            <Text fontSize={"larger"} fontWeight={"semibold"}>
              Get A Recipe
            </Text>
            <InputGroup variant={"filled"} zIndex={+2}>
              <TypeAheadDropDown
                items={this.state.ingredient_list}
                placeholder_inp={"Ingredients"}
                id_inp={"ingredient"}
              />
              <InputRightElement>
                <Button mt={2} mr={2} onClick={this.addHandler} data-testid='add-btn'>
                  Add
                </Button>
              </InputRightElement>
            </InputGroup>
            <HStack direction="row">{this.printHandler()}</HStack>
            <InputGroup variant={"filled"} zIndex={+1}>
              <TypeAheadDropDown
                items={this.state.cuisine_list}
                placeholder_inp={"Cuisine"}
                id_inp={"cuisine"}
              />
            </InputGroup>
            <InputGroup variant={"filled"}>
              <Input
                data-testid="email_id"
                type="text"
                id="email_id"
                color={"gray.500"}
                size={"lg"}
                placeholder="Email"
              />
            </InputGroup>
            <InputGroup variant={"filled"}>
              <FormLabel htmlFor="email-alerts" mb="0">
                Enable email alert?
                <Switch ml={2} id="Send_email" name="email" size="md" data-testid='email-switch' />
              </FormLabel>
            </InputGroup>
            <InputGroup variant={"filled"}>
              <Input
                data-testid="max_time"
                type="number"
                id="max_time"
                color={"gray.500"}
                size={"lg"}
                placeholder="Max Time (in minutes)"
                onChange={(event) =>
                  this.setState({ maxTime: event.target.value })
                }
              />
            </InputGroup>
            <InputGroup variant={"filled"}>
              <Input
                data-testid="type"
                type="string"
                id="type"
                color={"gray.500"}
                size={"lg"}
                placeholder="Vegetarian, Non-veg, Vegan"
                onChange={(event) =>
                  this.setState({ type: event.target.value })
                }
              />
            </InputGroup>
            <HStack width="100%" spacing={4}>
              <Button
                data-testid="submit"
                onClick={this.handleSubmit}
                flex={1}
                _hover={{ bg: "black", color: "gray.100" }}
                color="gray.600"
                bg="green.300"
                // isDisabled={this.state.ingredients.size === 0}
              >
                Search Recipes
              </Button>
              <Button
                data-testid="generate"
                onClick={this.handleGenerateRecipe}
                flex={1}
                _hover={{ bg: "black", color: "gray.100" }}
                color="gray.600"
                bg="green.300"
                // isDisabled={this.state.ingredients.size === 0}
              >
                Generate Recipe
              </Button>
            </HStack>
          </VStack>
        </Box>

        <Modal isOpen={isModalOpen} onClose={this.closeModal}>
          <ModalOverlay data-testid='modal-overlay'/>
          <ModalContent maxWidth="75%" width="75%">
            <ModalHeader>AI Generated Recipe based on your suggestions!</ModalHeader>
            <ModalBody>
              {isLoading ? (
                <Box display="flex" justifyContent="center" width="100%">
                  <Spinner size="xl" role="status" />
                </Box>
              ) : (
                <Box>
                  {generatedRecipe ? (
                    <Box>
                      <Text fontSize="xxl" fontWeight="bold">
                        {generatedRecipe.name}
                      </Text>
                      <Text>{generatedRecipe.description}</Text>
                      <Text fontSize="md" fontWeight="semibold" mt={4}>
                        Ingredients:
                      </Text>
                      <List spacing={2}>
                        {generatedRecipe.ingredients.map((ingredient, index) => (
                          <ListItem key={index}>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            {ingredient}
                          </ListItem>
                        ))}
                      </List>
                      <Text fontSize="md" fontWeight="semibold" mt={4}>
                        Instructions:
                      </Text>
                      <List spacing={2}>
                        {generatedRecipe.instructions.map((instruction, index) => (
                          <ListItem key={index}>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            {instruction}
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  ) : (
                    <Text>No recipe generated</Text>
                  )}
                </Box>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={this.closeModal}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  }
}

export default Form;