This brief describes an app that is meant to explore the dataset available at api.babelbetween.us. [Babel Between Us (BBU)](https://github.com/aerugo/bbu/blob/main/README.md) is a collaborative literary project exploring the uncharted waters between collaboration, fiction and ethnography.

## Requirements

* A reactive and mobile-first javascript (use ES6 syntax) UI for api.babelbetween.us.
* It is a very simple read-only app, queries only.
* Every state should be reachable through a route url.
* api.babelbetween.us is a GraphQL endpoint. I recommend the [urql](https://formidable.com/open-source/urql/docs/) GraphQL client library, but if you want to use Apollo that's alright. If you are planning to use something else, that is probably also fine - just check in with me first.
* This is a simple app and you don't really need a complicated framework. However, if you choose to use one, it should be something reasonably modern (not Angular). Bonus points if you write a beautiful ES6 app in plain Javascript.

## API 

You can access the API at https://api.babelbetween.us and test queries at https://api.babelbetween.us/graphql. This API is read-only.

## App screens

### Codebook

This is the starting screen for the app. 

![Codebook default](https://user-images.githubusercontent.com/7785081/147507990-9f3ce987-63d7-43a8-8e43-5336fcbab6fb.png)

To get the data for this screen, use this query:

```
query {
  code(
    filter: {annotations_count_gt: 1}
  	orderBy: name_asc
  ) {
    discourse_id
    name
    description
    annotations_count
  }
}
```

Searching through codes should dynamically change the list. 

![Codebook search](https://user-images.githubusercontent.com/7785081/147509947-71477ad1-8981-4ce3-858f-6375428c0c22.png)

Clicking a code name should bring you to the Code screen for that code - see next section.

If you click the hamburger menu in the top right corner, you get this overlay - which can be minimized again by pressing the hamburger.

![Menu](https://user-images.githubusercontent.com/7785081/147509851-6071a181-d3b6-4261-876e-2c255ddec62f.png)


### Code

This screen shows data that is connected to a certain "code" in the dataset. 

![Single code (1)](https://user-images.githubusercontent.com/7785081/147510242-7ac41927-af4b-466b-a249-61211953b627.png)

You get the additional information and annotations for a code with this query:

```
query {
  code: code(discourse_id: 1238) {
    discourse_id
    name
    description
    annotations_count
    annotations {
      discourse_id
      quote
      post_id
    }
  }
}
```
