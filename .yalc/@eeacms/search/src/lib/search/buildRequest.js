import buildRequestFilter from './buildRequestFilter';
import registry from '@eeacms/search/registry';

function buildFrom(current, resultsPerPage) {
  if (!current || !resultsPerPage) return;
  return (current - 1) * resultsPerPage;
}

function buildSort(sortDirection, sortField) {
  if (sortDirection && sortField) {
    return [{ [`${sortField}`]: sortDirection }];
  }
}

function buildMatch(searchTerm) {
  return searchTerm
    ? {
        multi_match: {
          query: searchTerm,
          fields: ['all_fields_for_freetext'],
        },
      }
    : { match_all: {} };
}

/*

  Converts current application state to an Elasticsearch request.

  When implementing an onSearch Handler in Search UI, the handler needs to take
  the current state of the application and convert it to an API request.

  For instance, there is a "current" property in the application state that you
  receive in this handler. The "current" property represents the current page
  in pagination. This method converts our "current" property to Elasticsearch's
  "from" parameter.

  This "current" property is a "page" offset, while Elasticsearch's "from"
  parameter is a "item" offset. In other words, for a set of 100 results and
  a page size of 10, if our "current" value is "4", then the equivalent
  Elasticsearch "from" value would be "40". This method does that conversion.

  We then do similar things for searchTerm, filters, sort, etc.
*/
export default function buildRequest(state, config) {
  const {
    current,
    filters,
    resultsPerPage,
    searchTerm,
    sortDirection,
    sortField,
  } = state;

  const sort = buildSort(sortDirection, sortField);
  const match = buildMatch(searchTerm);
  const size = resultsPerPage;
  const from = buildFrom(current, resultsPerPage);
  const filter = buildRequestFilter(filters, config);

  // console.log({ sort, match, size, from, filter, filters });

  const facets = config.facets;

  const aggregations = Object.assign(
    {},
    ...facets.map((facet) => {
      const { buildRequest } = registry.resolve[facet.factory];
      return buildRequest(facet);
    }),
  );

  const { highlight } = config;

  const body = {
    // Static query Configuration
    // --------------------------
    // https://www.elastic.co/guide/en/elasticsearch/reference/7.x/search-request-highlighting.html
    highlight,

    //https://www.elastic.co/guide/en/elasticsearch/reference/7.x/search-request-source-filtering.html#search-request-source-filtering
    // _source: [
    //   // 'id',
    //   // 'CodeCatalogue',
    //   // 'Descriptors',
    // ],

    aggs: {
      ...aggregations,
    },

    // Dynamic values based on current Search UI state
    // --------------------------
    // https://www.elastic.co/guide/en/elasticsearch/reference/7.x/full-text-queries.html
    query: {
      bool: {
        must: [match],
        ...(filter && { filter }),
      },
    },

    // https://www.elastic.co/guide/en/elasticsearch/reference/7.x/search-request-sort.html
    ...(sort && { sort }),

    // https://www.elastic.co/guide/en/elasticsearch/reference/7.x/search-request-from-size.html
    ...(size && { size }),
    ...(from && { from }),
  };

  return body;
}
