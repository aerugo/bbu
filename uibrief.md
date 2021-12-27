This brief describes an app that is meant to explore the dataset available at api.babelbetween.us. [Babel Between Us (BBU)](https://github.com/aerugo/bbu/blob/main/README.md) is a collaborative literary project exploring the uncharted waters between collaboration, fiction and ethnography.

## Requirements

* A reactive and mobile-first javascript (use ES6 syntax) UI for api.babelbetween.us.
* It is a very simple read-only app, queries only.
* Every state should be reachable through a route url.
* api.babelbetween.us is a GraphQL endpoint. I recommend the [urql](https://formidable.com/open-source/urql/docs/) GraphQL client library, but if you want to use Apollo that's alright. If you are planning to use something else, that is probably also fine - just check in with me first.
* This is a simple app and you don't really need a complicated framework. However, if you choose to use one, it should be something reasonably modern (not Angular). Bonus points if you write a beautiful ES6 app in plain Javascript.
* This is a completely text-based app, so pay a lot of attention to making the text and formatting look good. There is markdown formatting in the raw text you get from the API. Render the markdown and line breaks correctly and make sure it looks good.
* Use font [Baskervville](https://fonts.google.com/specimen/Baskervville) for everything.

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
Clicking on a fragment brings up the fragment screen.

### Fragment

This screen shows a fragment (called annotation in the API) and the codes that overlap with that fragment.

![Single annotation](https://user-images.githubusercontent.com/7785081/147510468-188ae535-f35a-4fb9-a8e2-a02fcb4d95f7.png)

You get the data with this query:

```
  query {
    annotation: annotation(discourse_id: 7621) {
      discourse_id
			quote
      annotates {
        discourse_id
        in_topic {
          discourse_id
          title
        }
      }
      refers_to {
        name
        annotations_count
    		cooccurring_codes {
          discourse_id
          name
        }
      }
      overlaps {
        discourse_id
          refers_to {
            name
            annotations_count
            cooccurring_codes {
              discourse_id
              name
            }
          }
      }
    }
  }
```

This response is a little more complicated than the others and needs more processing to display as intended. 

"quote" where you find the text fragment itself.

"annotates" -> "in_topic" -> "title" is the title of the topic that should be rendered as a link ("A True Story" in this example) at the bottom of the fragment.
"annotates" -> "discourse_id" is the id of the post that the fragment comes from, which in turn belongs to a topic.
This link at the bottom of the fragment should link to the Post screen, described below.

Below, the codes that this and overlapping fragments refer to are shown under "Themes".
Clicking on a code should bring you to the code page for that code.
In the "refers_to" response array, you will find the first "code" that the fragment overlaps with.
In the "overlaps" response array, you find the rest of the codes.
Render all of those codes in a list below the fragment, as shown in the example.

The number in the left circle is the "annotations_count" for that code, and the number in the right circle is the count of the number of elements in the "cooccurring_codes" array for that code. The symbols used are just random PNGs I found online, you can use something from the fontawesome like the [pen](https://fontawesome.com/v5.15/icons/pen-fancy?style=solid) and the [network](https://fontawesome.com/v5.15/icons/chart-network?style=regular). 

### Post

This screen shows a whole topic of posts. Posts are diplayed in order of when they were created, and each post should have an HTML anchor so that it can be linked to directly. When reaching the post screen, you have usually followed a link from the Annotation screen. That link should bring you to the right anchored post.

![Single post 1 - anchor](https://user-images.githubusercontent.com/7785081/147512082-4c372feb-43e8-497b-8400-0abd62f6415a.png)

For example, the screen above shows post 3018. However, scrolling up should show the other posts belonging to the same topic, and the title of the topic at the top.

![Single post - topic top](https://user-images.githubusercontent.com/7785081/147512168-bdc07c64-5b3f-451a-b23c-732d1de53978.png)

And at the bottom each post in the topic, the different codes that have been used for fragments of that post can be shown by expanding the "Themes" item.

![Group 2](https://user-images.githubusercontent.com/7785081/147512337-c80ec235-7f7e-480b-914f-344704dc13be.png)

![Group 1](https://user-images.githubusercontent.com/7785081/147512310-a688ac2f-2d7c-4ab8-a1f1-864fbf2b0edc.png)
