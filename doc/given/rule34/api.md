# API Basics

You should never receive an error unless the server is overloaded or the search dies. In cases of the searcher breaking, you will receive a response success of "false" and a message stating "search down" or similar.

# Posts

## List

Url for API access: **index.php?page=dapi&amp;s=post&amp;q=index**

* **limit** How many posts you want to retrieve. There is a hard limit of 1000 posts per request.
* **pid** The page number.
* **tags** The tags to search for. Any tag combination that works on the web site will work here. This includes all the meta-tags. See cheatsheet for more information.
* **cid** Change ID of the post. This is in Unix time so there are likely others with the same value if updated at the same time.
* **id** The post id.
* **json** Set to 1 for JSON formatted response.

## Deleted Images

Url for API access: **index.php?page=dapi&amp;s=post&amp;q=index&amp;deleted=show**

* **last_id** A numerical value. Will return everything above this number.

# Comments

## List

Url for API access: **ndex.php?page=dapi&amp;s=comment&amp;q=index**

* **post_id** The id number of the comment to retrieve.

# Tags

## List

Url for API access: **index.php?page=dapi&amp;s=tag&amp;q=index**

* **id** The tag's id in the database. This is useful to grab a specific tag if you already know this value.
* **limit** How many tags you want to retrieve. There is a default limit of 100 per request.