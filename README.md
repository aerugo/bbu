# Babel Between Us 

Babel Between Us (BBU) is a collaborative literary project exploring the uncharted waters between collaboration, fiction and ethnography.

A group of 18 writers collectively improvised stories on the [bbu.world forum](https://bbu.world/c/babel-between-us/9) from March to December 2020. The resulting fiction was read and annotated by a group of readers using experimental ethnographic methods. Their work was visualised as a ["Semantic Social Network"](http://server-2021.edgeryders.eu/dashboard/bbu/ethno-bbu?m=cn%7Ccl&cn.weightFilter=3&cn.labelDensity=0.67&cn.labelThreshold=7), which was then presented back to the writers. 

Babel Between Us includes over 900 fragments of prose and poetry. Many of the fragments are parts of [stories written as  collaborative threads](https://bbu.world/t/the-wonderful-journals-of-2020-first-edition/888). Some are [thematic explorations of form](https://bbu.world/t/copy-paste-like-a-lil-piece-of-clay-molding-writing-moldy-writing/1260/8). Some fragments are connected through [shared symbolism and context](http://server-2021.edgeryders.eu/dashboard/bbu/ethno-bbu?m=cn%7Cctl&cn.weightFilter=4&cn.labelDensity=0.67&cn.labelThreshold=7&cn.mode=scopeArea&sc.post=x%C2%9C%2B%C3%88%2F.%C2%8974%C2%B70%C2%AE\)%00%C2%B3%2CM%C3%A0%2CSK\(%C3%8B%C3%82%C3%90%14%C3%82224%C2%86%C3%8A%1A%19%1B%C2%98%40X%C3%86%06%C2%86%C2%960%C2%96%C2%81%01%00N%14%1A%C3%BA).

In the next step of the project we want to explore other ways to present volumes of annotated text, especially related to prose and poetry. 

# BBU as data

There are multiple ways to explore BBU at the moment.

## Babel Explorer

You can exlplore the world of BBU through [explore.babelbetween.us](https://explore.babelbetween.us/). This is the most straight forward and simple way to experience the project.

## bbu.world forum

Explore BBU as it was originally written on [bbu.world](https://bbu.world/c/babel-between-us/9). Unfortunately, the annotation interface is not publicly available without being logged in with the right user authorization. This is only because [our annotation tool](https://github.com/edgeryders/annotator_store-gem) does not offer a public read-only mode. 

## SSNA and dashboard

One interesting perspective on the BBU data is to explore the fiction through focusing on cooccurring codes. If codes "pandemic" and "restart" are to annotate the same fragment (one forum post its considered a fragment) then the codes are said to cooccur. Through counting cooccurrences and introducing weighted edges between codes as nodes, we can build a cooccurrence graph. Unfiltered, the cooccurrence graph is useless as it is extremely dense. If it is filtered at 7 or more cooccurrences we lose most of the interesting associations, but still retain some frequently cooccurring motifs like the links between "pandemic" and "bathroom", and between "mother" and "self-reflection". Exploring an SSNA graph is best done by moving back and forth between different cooccurrence levels to find interesting motifs. One might find the connection between "mother" and "fear" at 7 cooccurrences, filter to 4 cooccurrences and notice that there is a triad connection between "mother", "fear", and "non-human". One can then look into the fragments in which the readers have noticed these concepts and see that there seems to be a reoccurring theme of eery [stories](https://bbu.world/t/where-is-quarantine/899/6) that involve mothers the presence and unsettling animals and other non-human creatures.

[RyderEx](http://server-2021.edgeryders.eu/dashboard/bbu/ethno-bbu) is a dashboard developed by Edgeryders and OuestWare for [Semantic Social Network Analysis](https://journals.sagepub.com/doi/full/10.1177/1525822X20908236). It is primarily aimed at researchers, and slightly complex to use. It gives access to all dimensions of the BBU dataset.

## BBU GraphQl API

Our entire dataset is available through our [GraphQl API](http://207.154.248.234:4000/graphql), which can be improved with new queries as requested. See the [schema](https://github.com/aerugo/bbu/blob/main/api/src/graphql/schema.ts) to understand which data is available.

# Codes as worlds

We are currently experimenting with different ways to experience the Babel unvierse. Our first exploration will be to focus on codes and their cooccurring codes, as well as the annotations that refer to those codes. We want to design an experience where one can "travel" between codes, exploring the "cooccurrence space" of one code at a time. 

We want the person experiencing this view of BBU to see a central focus code in the middle of a "universe" where the other codes that it cooccurs with (filtered to some degree) are shown around it. It should be possible to tell from looking at a code if it has relatively many or few uses, as well as if it co-occurs with relatively many or few other codes at the degree of cooccurrence one is using. 

Annotations should be very prominent in this visualisation, as the codes are rather uninteresting without the literary prose that they are annotating. One could imagine the annotations "floating" or somehow appearing around the codes. It should be possible to interact with the annotations to be taken to the post that they annotate on bbu.world. 

In later experiments we would like to explore how to focus more on the content and annotations, perhaps letting the codes be less prominent.

Through this experiment, we would like to explore the experience of annotated reading. We don't know what the end result of this is, but we have some ideas we wish to explore. It could be a new method to understand and explore text, a new way to experience prose and poetry, or a methodology one could use to inspire new prose or poetry by stringing together motifs that arise from the exploration on an annotated text.

### Query to start with

We have defined the "codes" type on the GraphQl endpoint to return the data you will need for this experiment. This query should get you everything you need for a given code:

```
query {
  code: code(name: "Mother") {
    discourse_id
    name
    description
    annotations_count
    annotations {
      quote
      post_id
    }
    cooccurring_codes {
      discourse_id
      name
      annotations_count
      description
      cooccurrences
      cooccurrence_degree
      annotations {
        quote
        post_id
      }
    }
  }
}
```

This returns a code by name and all annotations that refer to that code. It also returns all cooccurring codes at 2 or more cooccurrences. Each cooccurring_codes object has a cooccurrences property with the cooccurrence count with the "origin" code. Annotations for cooccurring_codes are not all annotations that refer to this code. Instead, these are the annotations that refer to this code that are made on posts that have been also been annotated with the origin code. 

There should not be two codes of the same name in the dataset, but it is a little dirty. If there are ever two results for a single code name, just pick the first one. We will include constraints in the next update to ensure that code names are unique.
