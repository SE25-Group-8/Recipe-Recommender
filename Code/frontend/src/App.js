/* MIT License

Copyright (c) 2025 Ayush Gala, Ayush Pathak, Keyur Gondhalekar */

import React, { Component } from "react";
import { Tabs, Tab, TabList, TabPanel, TabPanels, Box, Text, Center, Switch, Flex} from "@chakra-ui/react"; // Updated to support toggle UIs. 
import { withAuth0 } from "@auth0/auth0-react";
import Form from "./components/Form.js";
import recipeDB from "./apis/recipeDB";
import RecipeList from "./components/RecipeList";
import AddRecipe from "./components/AddRecipe.js";
import RecipeLoading from "./components/RecipeLoading.js";
import SearchByRecipe from "./components/SearchByRecipe.js";
import UserProfile from "./components/UserProfile.js";
import LoginButton from './components/LoginButton';
import Nav from "./components/Navbar.js";

import GroceryList from "./components/GroceryList";

class App extends Component {
  constructor() {
    super();
    this.state = {
      cuisine: "",
      ingredients: new Set(),
      recipeList: [],
      recipeByNameList: [],
      groceryList: [],
      email: "",
      flag: false,
      isLoading: false,
      isProfileView: false,
      userData: {}, 
      darkMode: false, // New state added to enable dark mode. 
    };
  }

    // Event handler to toggle dark mode.
    handleDarkModeToggle = () => {
      this.setState(prevState => ({
        darkMode: !prevState.darkMode
      }));
    };

  handleLogout = () => {
    const { logout } = this.props.auth0;
    logout({ returnTo: window.location.origin });
    this.setState({
      userData: {}
    });
    localStorage.removeItem("user");
    alert("Successfully logged out!");
  }

  handleBookMarks = () => {
    this.setState({ isProfileView: true });
  };

  handleProfileView = () => {
    this.setState({ isProfileView: false });
  };

  handleSubmit = async (formDict) => {
    this.setState({
      isLoading: true,
      ingredients: formDict["ingredient"],
      cuisine: formDict["cuisine"],
      email: formDict["email_id"],
      flag: formDict["flag"],
      recipeList: []
      
    });

    // Fetch recipe data based on form input
    try {
      var params = {
        CleanedIngredients: Array.from(formDict["ingredient"]),
        Cuisine: formDict["cuisine"],
        Email: formDict["email_id"],
        Flag: formDict["flag"],
        maxTime: formDict["TotalTimeInMins"],
        type: formDict["type"]
      }

      const response = await recipeDB.get("/recipes", {
        params,
      });

      this.setState({
        recipeList: response.data.recipes,
        isLoading: false
      });
    } catch (err) {
      console.error(err);
      this.setState({ isLoading: false });
    }
  };

  handleRecipesByName = (recipeName) => {
    this.setState({ isLoading: true });

    recipeDB.get("/recipes/getRecipeByName", { params: { recipeName } })
      .then((res) => {
        this.setState({
          recipeByNameList: res.data.recipes,
          isLoading: false
        });
      })
      .catch((err) => {
        console.error(err);
        this.setState({ isLoading: false });
      });
  };

  // AddRecipe-related functionality (if needed)
  handleAddRecipe = async (recipeData) => {
    try {
      const response = await recipeDB.post("/recipes/add", recipeData);
      if (response.data.success) {
        alert("Recipe added successfully!");
      } else {
        alert("Failed to add recipe");
      }
    } catch (err) {
      console.error("Error adding recipe:", err);
    }
  };

  registerUser = async () => {
    const { user } = this.props.auth0;
    if (!user) return;
    
    /* This is the part causing errors as outlined in Issue 3. The API awaits indefinitely due to some issue in REST structure */

    // try {
    //   const response = await recipeDB.post("recipes/oAuthLogin", { email: user.nickname });
    //   if (response.data.success) {
    //     this.setState({ userData: response.data.user });
    //   } else {
    //     console.error("Failed to register user");
    //   }
    // } catch (err) {
    // }
  };

  handleGetGroceryList = async () => {
    this.setState({ isLoading: true });
  
    const { user } = this.props.auth0;
    const userName = user?.nickname || this.state.userData?.nickname; // Get username
    console.log("Username got is :", userName); // Debug log
  
    if (!userName) {
      console.error("No username found for fetching grocery list.");
      this.setState({ isLoading: false });
      return;
    }

  
    try {
      const response = await recipeDB.get("/recipes/getGroceryList", {
        params: { userName , timestamp: new Date().getTime(),}, // Pass the username
      });
  
      console.log("Fetched Grocery List:", response.data); // Debug log
  
      this.setState({
        groceryList: response.data.groceryList || [],
        isLoading: false,
      });
    } catch (err) {
      console.error("Error fetching grocery list:", err);
      this.setState({ isLoading: false });
    }
  };

  
  render() {
    this.registerUser();
    const { isAuthenticated, user } = this.props.auth0;
    const { isProfileView, recipeList, recipeByNameList, groceryList, isLoading, userData, darkMode } = this.state; // State updated to support dark mode toggling. 

    // Conditional styling for dark mode. 
    const appBackgroundStyle = darkMode ? { backgroundColor: '#121212', color: '#ffffff' } : { backgroundColor: '#ffffff', color: '#000000' };

    this.registerUser();
    return (
      <div style = {appBackgroundStyle}> 
        <Nav 
          handleLogout={this.handleLogout} 
          handleBookMarks={this.handleBookMarks} 
          user={user || userData} 
        />

        {!isAuthenticated ? (
          <Center flexDirection="column" mt="100px">
            <Text fontSize="4xl" mb="20px">Welcome to Recipe Finder</Text>
            <Text fontSize="xl" mb="40px">Discover and share delicious recipes.</Text>
            <LoginButton />
          </Center>
        ) : (
          <>
            {isProfileView ? (
              <UserProfile handleProfileView={this.handleProfileView} user={user || userData} />
            ) : (

                <Tabs variant="soft-rounded" colorScheme="green"> 

                  <Flex justify="space-between" align="center" mx={10} my={4}>

                    <TabList ml={10}>
                      <Tab>Search Recipe</Tab>
                      <Tab>Add Recipe</Tab>
                      <Tab>Search Recipe By Name</Tab>
                      <Tab>Grocery List</Tab> 
                    </TabList>

                    <Flex align="center">
                      <Text>Dark Mode</Text>
                        <Switch 
                          isChecked={darkMode}  
                          onChange={this.handleDarkModeToggle}  
                          ml={3} 
                          colorScheme="green"
                        />
                    </Flex>
                  </Flex> 
               
                <TabPanels>
                  <TabPanel>
                    <Box display="flex">
                      <Form sendFormData={this.handleSubmit} />
                      {isLoading ? <RecipeLoading /> : <RecipeList recipes={recipeList} darkMode={darkMode} />}
                    </Box>
                  </TabPanel>
                  <TabPanel>
                    {/* Ensure that AddRecipe receives any necessary props */}
                    <AddRecipe handleAddRecipe={this.handleAddRecipe} />
                  </TabPanel>
                  <TabPanel>
                    <Box minHeight="100vh" display="flex" flexDirection="column" justifyContent="flex-start">
                      <SearchByRecipe sendRecipeData={this.handleRecipesByName} />
                      {isLoading ? <RecipeLoading /> : <RecipeList recipes={recipeByNameList} darkMode={darkMode} />}
                    </Box>
                  </TabPanel>
                  <TabPanel>
                    <Box minHeight="100vh" display="flex" flexDirection="column" justifyContent="flex-start">
                      <Box textAlign="center" mb={4}>
                        <button onClick={this.handleGetGroceryList} style={{ padding: "10px 20px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                          Fetch Grocery List
                        </button>
                      </Box>
                    </Box>
                    <GroceryList groceryList={this.state.groceryList} fetchGroceryList={this.handleGetGroceryList} />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </>
        )}
      </div>
    );
  }
}

export default withAuth0(App);
