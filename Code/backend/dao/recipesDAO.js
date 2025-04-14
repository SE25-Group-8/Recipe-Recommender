import mongodb from "mongodb";
import nodemailer from "nodemailer";
import password from "./mail_param.js";
const pass = password.password;
const GMAIL = process.env.GMAIL;

// const ObjectId = mongodb.ObjectId;
let recipes;
let ingredients;
let users;
//Function to connect to DB
export default class RecipesDAO {
    static async injectDB(conn) {
        if (recipes) {
            return;
        }
        try {
            recipes = await conn
                .db(process.env.RECIPES_NS)
                .collection("recipes");
            ingredients = await conn
                .db(process.env.RECIPES_NS)
                .collection("ingredient_list");
            users = await conn.db(process.env.RECIPES_NS).collection("user");
        } catch (e) {
            console.error(
                `Unable to establish a collection handle in recipesDAO: ${e}`
            );
        }
    }

    static async getUser({ filters = null } = {}) {
        let query;
        let cursor;
        let user;
        query = { userName: filters.userName };
        if (filters) {
            cursor = await users.findOne(query);
            if (cursor) {
                if (cursor.userName) {
                    if (cursor.password == filters.password) {
                        return { success: true, user: cursor };
                    } else {
                        return { success: false };
                    }
                } else {
                    return { success: false };
                }
            } else {
                return { success: false };
            }
        }
    }

    static async addUser({ data = null } = {}) {
        let query;
        let cursor;
        let user;
        query = { userName: data.userName };
        console.log(query);
        if (data) {
            cursor = await users.findOne(query);
            console.log(cursor);
            if (cursor !== null) {
                return { success: false };
            } else {
                const res = await users.insertOne(data);
                return { success: true };
            }
        }
    }

    //function to get bookmarks
    static async getBookmarks(userName) {
        let query;
        let cursor;
        let user;
        query = { userName: userName };
        console.log(query);
        try {
            cursor = await users.findOne(query);
            if (cursor.userName) {
                return cursor.bookmarks;
            } else {
                return { bookmarks: [] };
            }
        } catch (e) {
            console.log(`error: ${e}`);
        }
    }

    static async getBookmarkedRecipes(userName) {
        try {
            const user = await users.findOne({ userName }, { bookmarks: 1 });
            return user ? user.bookmarks : [];
        } catch (e) {
            console.error(`Failed to fetch bookmarks for ${userName}:`, e);
            return { error: e.message };
        }
    }

    //Function to get recipe by name
    static async getRecipeByName({ filters = null } = {}) {
        let query;
        if (filters) {
            if ("recipeName" in filters) {
                const words = filters["recipeName"].split(" ");
                const regexPattern = words
                    .map((word) => `(?=.*\\b${word}\\b)`)
                    .join("");
                const regex = new RegExp(regexPattern, "i");
                query = { TranslatedRecipeName: { $regex: regex } };
                // query["Cuisine"] = "Indian";
            }
            let recipesList;
            try {
                recipesList = await recipes
                    .find(query)
                    .collation({ locale: "en", strength: 2 })
                    .toArray();
                return { recipesList };
            } catch (e) {
                console.error(`Unable to issue find command, ${e}`);
                return { recipesList: [], totalNumRecipess: 0 };
            }
        }
    }

    //Function to get the Recipe List
    static async getRecipes({
        filters = null,
        page = 0,
        recipesPerPage = 10,
    } = {}) {
        let query;
        if (filters) {
            if ("CleanedIngredients" in filters) {
                var str = "(?i)";
                for (var i = 0; i < filters["CleanedIngredients"].length; i++) {
                    const str1 = filters["CleanedIngredients"][i];
                    str += "(?=.*" + str1 + ")";
                }
                console.log(str);
                query = { "Cleaned-Ingredients": { $regex: str } };
                query["Cuisine"] = filters["Cuisine"];
                // query["TotalTimeInMins"] = { $lte: filters["maxTime"] };
                console.log(query);
                var email = filters["Email"];
                var flagger = filters["Flag"];
                console.log(email);
                console.log(flagger);
            }
        }

        // console.log("\n\n\nFilters in the DAO controller are: ", filters)

        let cursor;

        try {
            cursor = await recipes
                .find(query)
                .collation({ locale: "en", strength: 2 });
                
        } catch (e) {
            console.error(`Unable to issue find command, ${e}`);
            return { recipesList: [], totalNumRecipess: 0 };
        }

        const displayCursor = cursor.limit(recipesPerPage);
        try {
            const recipesList1 = await displayCursor.toArray();
            const newreciplist = []
            let recipesList = []
            console.log("\n\nRecipe list is ", recipesList1)
            console.log("\n\nFilters are ", filters)
            for(let i =0;i<recipesList1.length;i++){
                // if(recipesList1[i].TotalTimeInMins<=filters["maxTime"] && recipesList1[i]["Diet-type"].toLowerCase()===filters["type"].toLowerCase())
                newreciplist.push(recipesList1[i])
            }
            recipesList=newreciplist
            const totalNumRecipes = await recipes.countDocuments(query);

            var str_mail = "";
            for (var j = 1; j <= recipesList.length; j++) {
                str_mail += "\nRecipe " + j + ": \n";
                str_mail += recipesList[j - 1]["TranslatedRecipeName"] + "\n";
                str_mail +=
                    "Youtube Link: https://www.youtube.com/results?search_query=" +
                    recipesList[j - 1]["TranslatedRecipeName"].replace(
                        / /g,
                        "+"
                    ) +
                    "\n\n";
            }

            if (flagger == "true") {
                var transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    auth: {
                        user: GMAIL,
                        pass: pass,
                    },
                });

                var mailOptions = {
                    from: GMAIL,
                    to: email,
                    subject: "Recommended Recipes! Enjoy your meal!!",
                    text: str_mail,
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("Email sent: " + info.response);
                    }
                });
            }

            return { recipesList, totalNumRecipes };
        } catch (e) {
            console.error(
                `Unable to convert cursor to array or problem counting documents, ${e}`
            );
            return { recipesList: ["error so you get this"], totalNumRecipes: 0 };
        }
    }

    //Function to get the list of Cuisines
    static async getCuisines() {
        let cuisines = [];
        try {
            cuisines = await recipes.distinct("Cuisine");
            return cuisines;
        } catch (e) {
            console.error(`Unable to get cuisines, ${e}`);
            return cuisines;
        }
    }

    // Function to add a recipe
    static async addRecipe(recipe) {
        console.log("Inside addRecipe");
        console.log(recipe);
        let inputRecipe = {};
        inputRecipe["TranslatedRecipeName"] = recipe["recipeName"];
        inputRecipe["TotalTimeInMins"] = recipe["cookingTime"];
        inputRecipe["Diet-type"] = recipe["dietType"];
        inputRecipe["Recipe-rating"] = recipe["recipeRating"];
        inputRecipe["Cuisine"] = recipe["cuisine"];
        inputRecipe["image-url"] = recipe["imageURL"];
        inputRecipe["URL"] = recipe["recipeURL"];
        inputRecipe["TranslatedInstructions"] = recipe["instructions"];
        var ingredients = "";
        for (var i = 0; i < recipe["ingredients"].length; i++) {
            ingredients += recipe["ingredients"][i] + "%";
        }
        inputRecipe["Cleaned-Ingredients"] = ingredients;
        var restaurants = "";
        var locations = "";
        for (var j = 0; j < recipe["restaurants"].length; j++) {
            restaurants += recipe["restaurants"][j] + "%";
            locations += recipe["locations"][j] + "%";
        }
        inputRecipe["Restaurant"] = restaurants;
        inputRecipe["Restaurant-Location"] = locations;
        console.log("Input Recipe");
        console.log(inputRecipe);
        let response = {};
        try {
            response = await recipes.insertOne(inputRecipe);
            return response;
        } catch (e) {
            console.error(`Unable to add recipe, ${e}`);
            return response;
        }
    }

    //function to add recipe to user profile
    static async addRecipeToProfile(userName, recipe) {
        let response;
        console.log(userName);
        try {
            response = await users.updateOne(
                { userName: userName },
                { $push: { bookmarks: recipe } }
            );
            console.log(response);
            return response;
        } catch (e) {
            console.log(`Unable to add recipe, ${e}`);
        }
    }

    static async removeRecipeFromProfile(userName, recipe) {
        let response;
        console.log(userName);
        try {
            response = await users.updateOne(
                { userName: userName },
                { $pull: { bookmarks: { _id: recipe._id } } }
            );
            console.log(response);
            return response;
        } catch (e) {
            console.log(`Unable to remove recipe, ${e}`);
        }
    }

    // static async getIngredients() {
    //     let response = {};
    //     try {
    //         response = await ingredients.distinct("item_name");
    //         console.log("All Ingredients: \n", response)
    //         return response;
    //     } catch (e) {
    //         console.error(`Unable to get ingredients, ${e}`);
    //         return response;
    //     }
    // }

    // static async getIngredients() {
    //     let response = [];
    //     try {
    //         // Find all recipes in the collection
    //         const recipes = await recipesCollection.find({}).toArray();

    //         // Collect all ingredients from each recipe
    //         const ingredientsSet = new Set();
    //         recipes.forEach((recipe) => {
    //             if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    //                 recipe.ingredients.forEach((ingredient) => {
    //                     ingredientsSet.add(ingredient); // Use a Set to avoid duplicates
    //                 });
    //             }
    //         });

    //         // Convert the Set back to an array
    //         response = Array.from(ingredientsSet);
    //         console.log("All Ingredients: \n", response);
    //         return response;
    //     } catch (e) {
    //         console.error(`Unable to get all ingredients, ${e}`);
    //         return response; // Return an empty array in case of an error
    //     }
    // }

    static async getIngredients() {
        let response = {};
        try {
            response = await ingredients.distinct("item_name");
            return response;
        } catch (e) {
            console.error(`Unable to get ingredients, ${e}`);
            return response;
        }
    }


    static async getGroceryList(userName) {


        try {
            console.log(`Fetching bookmarked recipes for user: ${userName}`);
    
            // Fetch bookmarked recipes from the users collection
            const bookmarkedRecipes = await this.getBookmarkedRecipes(userName);
    
            if (!bookmarkedRecipes || bookmarkedRecipes.length === 0) {
                console.log(`No bookmarked recipes found for user: ${userName}`);
                return [];
            }
    
            console.log(`Bookmarked recipes:`, bookmarkedRecipes);
    
            let ingredientSet = new Set();
    
            // Iterate over bookmarked recipes and extract ingredients directly
            for (let recipe of bookmarkedRecipes) {
                if (recipe["Cleaned-Ingredients"]) {
                    console.log(`Ingredients for ${recipe.TranslatedRecipeName}:`, recipe["Cleaned-Ingredients"]);
    
                    // Add ingredients to the set (avoiding duplicates)
                    recipe["Cleaned-Ingredients"].split(',').forEach(ingredient => {
                        ingredientSet.add(ingredient.trim());
                    });
                } else {
                    console.log(`No cleaned ingredients found for: ${recipe.TranslatedRecipeName}`);
                }
            }
    
            const groceryList = Array.from(ingredientSet);
            console.log(`Generated grocery list:`, groceryList);
    
            return groceryList;
        } catch (error) {
            console.error(`Error generating grocery list:`, error);
            return { error: error.message };
        }



        // try {

        //     console.log(`Fetching bookmarked recipes for user: ${userName}`);

        //     // const bookmarkedRecipes = await db
        //     //     .collection("recipe_recommender.recipe")
        //     //     .find({ bookmarkedBy: userName })
        //     //     .toArray();

        //     const bookmarkedRecipes = await this.getBookmarkedRecipes(userName);

        //     if (!bookmarkedRecipes || bookmarkedRecipes.length === 0) {
        //         console.log(`No bookmarked recipes found for user: ${userName}`);
        //         return [];
        //     }
        //     console.log(`Bookmarked recipes:`, bookmarkedRecipes);

        //     let ingredientSet = new Set();

        //     // Fetch recipe details from the recipe collection
        //     for (let recipeName of bookmarkedRecipes) {
        //         console.log(`Fetching ingredients for recipe: ${recipeName}`);
    
        //         const recipeData = await recipes.findOne(
        //             { TranslatedRecipeName: recipeName },
        //             { projection: { CleanedIngredients: 1 } }
        //         );
    
        //         if (recipeData && recipeData.CleanedIngredients) {
        //             console.log(`Ingredients for ${recipeName}:`, recipeData.CleanedIngredients);
    
        //             // Add ingredients to the set (avoiding duplicates)
        //             recipeData.CleanedIngredients.split(',').forEach(ingredient => {
        //                 ingredientSet.add(ingredient.trim());
        //             });
        //         } else {
        //             console.log(`No recipe found for: ${recipeName}`);
        //         }
        //     }
    
        //     const groceryList = Array.from(ingredientSet);
        //     console.log(`Generated grocery list:`, groceryList);
    
        //     return groceryList;
        // } catch (error) {
        //     console.error(`Error generating grocery list:`, error);
        //     return { error: error.message };
        // }

    }

}
