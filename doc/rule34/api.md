# Rule34 API

Rule34's API is made up of various URLs used to retrieve info for data such as
posts, comments, and tags.

API URLs all modify from the base URL: `https://api.rule34.xxx/`

All requests require the following parameters:

- **page:** dapi
- **q:** index

## Posts

Accessing post data requires the following parameters:

- **s:** post

### Parameters

When accessing posts using search queries, the following parameters may be used.

- limit
  - Defines how many items to retrieve.
  - Maximum is 1000.
  - Default is 50.
  <!-- TODO: check minimum, check reactions to lower/higher numbers, check default -->
- pid
  - Defines the 'page' of results to retrieve; retrieves results from index ((`pid` - 1) &times; `limit`) to ((`pid` &times; `limit`) - 1).