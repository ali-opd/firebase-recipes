import { useEffect, useState } from 'react';
import ImageUploadPreview from './ImageUploadPreview';

export default function AddEditRecipeForm({
  existingRecipe,
  handleAddRecipe,
  handleUpdateRecipe,
  handleDeleteRecipe,
  handleEditRecipeCancel
}) {
  useEffect(() => {
    if (existingRecipe) {
      setName(existingRecipe.name);
      setCategory(existingRecipe.category);
      setDirection(existingRecipe.direction);
      setPublishDate(existingRecipe.publishDate.toISOString().split('T')[0]);
      setIngredients(existingRecipe.ingredients);
      setImageUrl(existingRecipe.imageUrl);
    } else {
      resetForm();
    }
  }, [existingRecipe]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [publishDate, setPublishDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [direction, setDirection] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [ingredientName, setIngredientName] = useState([]);
  const [imageUrl, setImageUrl] = useState('');

  const handleAddIngredient = (e) => {
    if (e.key && e.key !== 'Enter') {
      return;
    }

    e.preventDefault();

    if (!ingredientName) {
      alert('Missing ingredient field. Please double check');
      return;
    }

    setIngredients([...ingredients, ingredientName]);
    setIngredientName('');
  };

  const handleRecipeFormSubmit = (e) => {
    e.preventDefault();

    if (ingredients.length === 0) {
      alert('Ingredients cannot be empty. P');
      return;
    }

    if (!imageUrl) {
      alert('Missing recipe image. Please add a recipe image');
      return;
    }

    const isPublished = new Date(publishDate) <= new Date() ? true : false;

    const newRecipe = {
      name,
      category,
      direction,
      publishDate: new Date(publishDate),
      // publishDate: new Date(publishDate).getTime() / 1000,
      isPublished,
      ingredients,
      imageUrl
    };

    if (existingRecipe) {
      handleUpdateRecipe(newRecipe, existingRecipe.id);
    } else {
      handleAddRecipe(newRecipe);
    }

    resetForm();
  };

  const resetForm = () => {
    setName('');
    setCategory('');
    setDirection('');
    setPublishDate('');
    setIngredients([]);
    setImageUrl('');
  };
  return (
    <form
      className='add-edit-recipe-form-container'
      onSubmit={handleRecipeFormSubmit}
    >
      {existingRecipe ? <h2>Update Recipe</h2> : <h2>Add a new recipe</h2>}
      <div className='top-form-section'>
        <div className='image-input-box'>
          Recipe Image
          <ImageUploadPreview
            basePath='recipes'
            existingImageUrl={imageUrl}
            handleUploadFinish={(downloadUrl) => setImageUrl(downloadUrl)}
            handleUploadCancel={() => setImageUrl('')}
          />
        </div>
        <div className='fields'>
          <label className='recipe-label input-label'>
            Recipe Name:
            <input
              type='text'
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='input-text'
            />
          </label>
          <label className='recipe-label input-label'>
            Category:
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
          <label className='recipe-label input-label'>
            Directions
            <textarea
              className='input-text directions'
              required
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
            ></textarea>
          </label>
          <label className='recipe-label input-label'>
            Publish Date:
            <input
              className='input-text'
              type='date'
              required
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className='ingredients-list'>
        <h3 className='text-center'>Ingredienst</h3>
        <table className='ingredients-table'>
          <thead>
            <tr>
              <th className='table-header'>Ingredients</th>
              <th className='table-header'>Delete</th>
            </tr>
          </thead>
          <tbody>
            {ingredients && ingredients.length > 0
              ? ingredients.map((ingredient) => (
                  <tr key={ingredient}>
                    <td className='table-data text-center'>{ingredient}</td>
                    <td className='ingredient-delete-box'>
                      <button
                        type='button'
                        className='secondary-button ingredient-delete-button'
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
        {ingredients && ingredients.length === 0 ? (
          <h3 className='text-center no-ingredients'>
            No ingredients added yet
          </h3>
        ) : null}
        <div className='ingredient-form'>
          <label className='ingredient-label'>
            Ingredient:
            <input
              className='input-text'
              placeholder='ex. 1 cup of sugar'
              type='text'
              value={ingredientName}
              onChange={(e) => setIngredientName(e.target.value)}
              onKeyPress={handleAddIngredient}
            />
          </label>
          <button
            type='button'
            className='primary-button add-ingredient-button'
            onClick={handleAddIngredient}
          >
            Add Ingredient
          </button>
        </div>
      </div>
      <div className='action-button'>
        <button type='submit' className='primary-button action-button'>
          {existingRecipe ? 'Update Recipe' : 'Create Recipe'}
        </button>
        {existingRecipe ? (
          <>
            <button
              type='button'
              onClick={handleEditRecipeCancel}
              className='primary-button action-button'
            >
              Cancel
            </button>
            <button
              type='button'
              className='primary-button action-button'
              onClick={() => handleDeleteRecipe(existingRecipe.id)}
            >
              Delete
            </button>
          </>
        ) : null}
      </div>
    </form>
  );
}
