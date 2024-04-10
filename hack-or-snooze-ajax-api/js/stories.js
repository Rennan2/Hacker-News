"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story,showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const showStar = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
        ${showDeleteBtn ? getDeleteBtnHTML() : ""}
        ${showStar ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function getDeleteBtnHTML(){
  return ` 
    <span class="trash-can">
      <i class="fas fa-trash-alt"></i>
    </span>`;
}
function getStarHTML(story, user){
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
  <span class="star">
    <i class="${starType} fa-star"></i>
  </span>`;
}


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
// deleting story's//
async function deleteStory(evt){
  console.debug("deleteStory");
  const $closetli = $(evt.target).closet("li");
  const storyId = $closetli.attr("id");
  await storyList.removeStory(currentUser, StoryId);
  putUserStoriesOnPage();
}
$myStories.on("click", ".trash-can", deleteStory);

// Generate user's stories tab//
function putUserStoriesOnPage(){
  console.debug("putUserStoriesOnPage");
  $ownStories.empty();
  if(currentUser.$ownStories.lenght === 0){
    $myStories.append("<h4>NO stories added</h4>");
  } else {
    for (let story of currentUser.$myStories){
      let $story = generateStoryMarkup(story, true);
      $myStories.append($story);
    }
  }
  $myStories.show()
}
/*submit new story form */
async function submitNewStory(evt){
  console.debug("submitNewStory");
  evt.preventDefault

  //info form form
  const title = $("#create-title").val();
  const url = $("#create-url").val();
  const author = $("#create-author").val();
  const username = currentUser.username
  const storyData = { title, url, author, username };
  const story = await storyList.addStory(currentUser, storyData);
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
  // reset form
  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}
$submitForm.on("submit", submitNewStory);
/* favorites list  */
function putFavoritesListOnPage(){
  console.debug("putFavoritesListOnPage");
  $favoritedStories.empty();
  if(currentUser.favorites.lenght === 0){
    $favoritedStories.append("<h4>No Favorites</h4>");
  } else {
    for (let story of currentUser.favorites){
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }
  $favoritedStories.show();
}
async function toggleStoryFvorite(event){
  console.debug("toggleStoryFvorite");
  const $target = $(evt.target);
  const $closetLi = $target.closet("li");
  const storyId = $closetLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);
  /* checks to see if story starred */
  if ($target.hasClass("fas")){
    await currentUser.removeFavorite(story);
    $target.closet("i").toggleClass("fas far");
  } else{
    await currentUser.addFavorite(story);
    $target.closet("i").toggleClass("fas far");
  }
}
$storiesList.on("click", ".star", toggleStoryFvorite);