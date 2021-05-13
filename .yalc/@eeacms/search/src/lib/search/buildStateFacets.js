import registry from '@eeacms/search/registry';

export default function buildStateFacets(aggregations, config) {
  const { facets } = config;
  const facetsMap = Object.assign(
    {},
    ...facets.map((facet) => {
      return { [facet.field]: registry.resolve[facet.factory] };
    }),
  );

  const result = Object.assign(
    {},
    ...facets.map((facet) => {
      const { getValue } = facetsMap[facet.field];
      const value = getValue(aggregations, facet.field);
      return value ? { [facet.field]: value } : {};
    }),
  );

  if (Object.keys(result).length > 0) {
    return result;
  }
}
