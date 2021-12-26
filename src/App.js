import { useEffect, useState } from 'react';
import FirebaseAuthService from './FirebaseAuthService';
import LoginForm from './components/LoginForm';
import AddEditRecipeForm from './components/AddEditRecipeForm';

import './App.scss';
import FirebaseFirestoreService from './FirebaseFirestoreService';
// import FirebaseFirestoreRestService from './FirebaseFirestoreRestService';

function App() {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [isLoading, setIsloading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [orderBy, setOrderBy] = useState('publishDateDesc');
  const [recipesPerPage, setRecipesPerPage] = useState(3);
  const [isLastPage, setIsLastPage] = useState(false);
  const [totalNumberOfPages, setTotalNumberOfPages] = useState(0);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);

  useEffect(() => {
    setIsloading(true);
    fetchRecipes()
      .then((data) => {
        setRecipes(data);
      })
      .catch((error) => {
        console.log(error.message);
        throw error;
      })
      .finally(() => setIsloading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, categoryFilter, orderBy, recipesPerPage, currentPageNumber]);

  const fetchRecipes = async (cursorId = '') => {
    const queries = [];

    if (categoryFilter) {
      queries.push({
        field: 'category',
        condition: '==',
        value: categoryFilter
      });
    }

    if (!user) {
      queries.push({
        field: 'isPublished',
        condition: '==',
        value: true
      });
    }

    const orderByField = 'publishDate';
    let orderByDirection;

    if (orderBy) {
      switch (orderBy) {
        case 'publishDateAsc':
          orderByDirection = 'asc';
          break;
        case 'publishDateDesc':
          orderByDirection = 'desc';
          break;
        default:
          break;
      }
    }

    let fetchedRecipes = [];

    try {
      const response = await FirebaseFirestoreService.readDocuments({
        collection: 'recipes',
        queries: queries,
        orderByField,
        orderByDirection,
        perPage: recipesPerPage,
        cursorId: cursorId
      });
      const newRecipes = response.docs.map((recipeDoc) => {
        const id = recipeDoc.id;
        const data = recipeDoc.data();
        data.publishDate = new Date(data.publishDate.seconds * 1000);

        return { ...data, id };
      });

      if (cursorId) {
        fetchedRecipes = [...recipes, ...newRecipes];
      } else {
        fetchedRecipes = [...newRecipes];
      }

      // const response = await FirebaseFirestoreRestService.readDocuments({
      //   collection: 'recipes',
      //   queries: queries,
      //   orderByField: orderByField,
      //   orderByDirection: orderByDirection,
      //   perPage: recipesPerPage,
      //   pageNumber: currentPageNumber
      // });

      if (response && response.documents) {
        const totalNumberOfPages = Math.ceil(
          response.recipeCount / recipesPerPage
        );

        setTotalNumberOfPages(totalNumberOfPages);

        const nextPageQuery = {
          collection: 'recipes',
          queries: queries,
          orderByField: orderByField,
          orderByDirection: orderByDirection,
          perPage: recipesPerPage,
          pageNumber: currentPageNumber + 1
        };

        const nextPageResponse = await FirebaseFirestoreService.readDocuments(
          nextPageQuery
        );

        if (
          nextPageResponse &&
          nextPageResponse.documents &&
          nextPageResponse.documents.length === 0
        ) {
          setIsLastPage(true);
        } else {
          setIsLastPage(false);
        }

        if (response.documents.length === 0 && currentPageNumber !== 1) {
          setCurrentPageNumber(currentPageNumber - 1);
        }

        fetchedRecipes = response.documents;

        fetchedRecipes.forEach((recipe) => {
          const unixPublishDateTime = recipe.publishDate;
          recipe.publishDate = new Date(unixPublishDateTime * 1000);
        });
      }
    } catch (error) {
      console.log(error.message);
      throw error;
    }

    return fetchedRecipes;
  };

  const handleRecipesPerPageChange = (event) => {
    const recipesPerPage = event.target.value;

    setRecipes([]);
    setRecipesPerPage(recipesPerPage);
  };

  // const handleLoadMoreRecipesClick = () => {
  //   const lastRecipe = recipes[recipes.length - 1];
  //   const cursorId = lastRecipe.id;
  //   handleFetchRecipes(cursorId);
  // };

  const handleFetchRecipes = async (cursorId = '') => {
    try {
      const fetchedRecipes = await fetchRecipes(cursorId);
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  };

  FirebaseAuthService.subscribeToAuthChanges(setUser);

  const handleAddRecipe = async (newRecipe) => {
    try {
      const response = await FirebaseFirestoreService.createDocument(
        'recipes',
        newRecipe
      );

      // const response = await FirebaseFirestoreRestService.createDocument(
      //   'recipes',
      //   newRecipe
      // );

      // TODO: fetch new recipes from firestore
      handleFetchRecipes();

      alert(`successfully created recipe with an id ${response.id}`);
    } catch (error) {
      alert(error.message);
    }
  };

  const lookupCategoryLabel = (categoryKey) => {
    const categories = {
      breadSandwichesAndPizza: 'Bread, Sandwiches, and Pizza',
      eggsAndBreakfast: 'Eggs & Breakfast',
      dessertAndBakedGoods: 'Dessert & Baked Goods',
      fishAndSeafood: 'Fish & Seafood',
      vegetables: 'Vegetables'
    };

    const label = categories[categoryKey];
    return label;
  };

  // const formatDate = (date) => {
  //   const day = date.getUTCDate();
  //   const month = date.getUTCMonth();
  //   const year = date.getFullYear();
  //   const dateString = `${month}-${day}-${year}`;
  //   return dateString;
  // };

  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short'
  };

  const handleUpdateRecipe = async (newRecipe, recipeId) => {
    try {
      await FirebaseFirestoreService.updateDocument(
        'recipes',
        recipeId,
        newRecipe
      );

      // await FirebaseFirestoreRestService.updateDocument(
      //   'recipes',
      //   recipeId,
      //   newRecipe
      // );

      handleFetchRecipes();

      alert(`Successfully update a recipe with an ID = ${recipeId}`);
      setCurrentRecipe(null);
    } catch (error) {
      console.log('error here');
      alert(error.message);
      throw error;
    }
  };

  const handleEditRecipeClick = (recipeId) => {
    const selectedRecipe = recipes.find((recipe) => recipe.id === recipeId);

    if (selectedRecipe) {
      setCurrentRecipe(selectedRecipe);
      window.scrollTo(0, document.body.scrollHeight);
    }
  };

  const handleEditRecipeCancel = () => {
    setCurrentRecipe(null);
  };

  const handleDeleteRecipe = async (recipeId) => {
    const deleteConfirmation = window.confirm(
      'Are you sure you want to delete this recipe ? OK for Yes. Cancel for No'
    );

    if (deleteConfirmation) {
      try {
        await FirebaseFirestoreService.deleteDocument('recipes', recipeId);
        // await FirebaseFirestoreRestService.deleteDocument('recipes', recipeId);
        handleFetchRecipes();
        setCurrentRecipe(null);
        window.scrollTo(0, 0);
        alert(`successfully deleted a recipe with an ID = ${recipeId}`);
      } catch (error) {
        alert(error.message);
        throw error;
      }
    }
  };

  return (
    <div className='App'>
      <div className='title-row'>
        <h1 className='title'>Firebase Recipe</h1>
        <LoginForm existingUser={user} />
      </div>
      <div className='main'>
        <div className='row filters'>
          <label className='recipe-label input-label'>
            Category:
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className='select'
              required
            >
              <option value=''></option>
              <option value='breadSandwichesAndPizza'>
                Breads, Sandwich, and Pizza
              </option>
              <option value='eggsAndBreakfast'>Eggs & Breakfast</option>
              <option value='dessertsAndBakedGoods'>
                Desserts & Baked Goods
              </option>
              <option value='fishAndSeafoood'>Fish & Seafood</option>
              <option value='vegetables'>Vegetables</option>
            </select>
          </label>
          <label className='input-label'>
            <select
              className='select'
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
            >
              <option value='publishDateDesc'>
                Publish date(newest - oldest)
              </option>
              <option value='publishDateAsc'>
                Publish date(oldest - newest)
              </option>
            </select>
          </label>
        </div>
        <div className='recipe-list-box'>
          <div className='center'>
            {isLoading && (
              <div className='fire'>
                <div className='flames'>
                  <div className='flame'></div>
                  <div className='flame'></div>
                  <div className='flame'></div>
                  <div className='flame'></div>
                </div>
                <div className='logs'></div>
              </div>
            )}

            {!isLoading && recipes && recipes.length === 0 ? (
              <h5 className='no-recipes'>No Recipes Found</h5>
            ) : null}
            {!isLoading && recipes && recipes.length > 0 ? (
              <div className='recipe-list'>
                {recipes.map((recipe) => (
                  <div className='recipe-card' key={recipe.id}>
                    {recipe.isPublished === false ? (
                      <div className='unpublished'>UNPUBLISHED</div>
                    ) : null}
                    <div className='recipe-name'>{recipe.name}</div>
                    <div className='recipe-image-box'>
                      {recipe.imageUrl ? (
                        <img
                          className='recipe-image'
                          src={recipe.imageUrl}
                          alt={recipe.name}
                        />
                      ) : null}
                    </div>
                    <div className='recipe-field'>
                      Category: {lookupCategoryLabel(recipe.category)}
                    </div>
                    <div className='recipe-field'>
                      {/* Publish Date: {formatDate(recipe.publishDate)} */}
                      Publish Date:{' '}
                      {recipe.publishDate.toLocaleDateString('id-ID', options)}
                    </div>
                    {user && (
                      <button
                        type='button'
                        onClick={() => handleEditRecipeClick(recipe.id)}
                        className='primary-button eidt-button'
                      >
                        EDIT
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        {isLoading || (recipes && recipes.length > 0) ? (
          <>
            <label className='input-label'>
              Recipes Per Page:
              <select
                className='select'
                value={recipesPerPage}
                onChange={handleRecipesPerPageChange}
              >
                <option value='3'>3</option>
                <option value='6'>6</option>
                <option value='9'>9</option>
              </select>
            </label>
            <div className='pagination'>
              {/* <button
                className='primary-button'
                onClick={handleLoadMoreRecipesClick}
              >
                LOAD MORE RECIPES
              </button> */}

              <div className='row'>
                <button
                  className={
                    currentPageNumber === 1
                      ? 'primary-button hidden'
                      : 'primary-button'
                  }
                  type='button'
                  onClick={() => setCurrentPageNumber(currentPageNumber - 1)}
                >
                  Previous
                </button>
                <div>Page {currentPageNumber}</div>
                <button
                  className={
                    isLastPage ? 'primary-button hidden' : 'primary-button'
                  }
                  type='button'
                  onClick={() => setCurrentPageNumber(currentPageNumber + 1)}
                >
                  Next
                </button>
              </div>
              <div className='row'>
                {!categoryFilter
                  ? new Array(totalNumberOfPages)
                      .fill(0)
                      .map((value, index) => {
                        return (
                          <button
                            key={index}
                            className={
                              currentPageNumber === index + 1
                                ? 'selected-page primary-button page-button'
                                : 'primary-button page-button'
                            }
                            onClick={() => setCurrentPageNumber(index + 1)}
                          >
                            {index + 1}
                          </button>
                        );
                      })
                  : null}
              </div>
            </div>
          </>
        ) : null}
        {user ? (
          <AddEditRecipeForm
            existingRecipe={currentRecipe}
            handleUpdateRecipe={handleUpdateRecipe}
            handleEditRecipeCancel={handleEditRecipeCancel}
            handleAddRecipe={handleAddRecipe}
            handleDeleteRecipe={handleDeleteRecipe}
          />
        ) : null}
      </div>
    </div>
  );
}

export default App;
