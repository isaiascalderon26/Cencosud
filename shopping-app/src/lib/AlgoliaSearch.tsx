import algoliasearch from 'algoliasearch';

class AlgoliaSearch {
  /*
    * Buscar informacion de productos en Algolia
  */
  async searchExact(store: string, filter: Array<string>,hits: number, ind: string) {
    const client = algoliasearch(`${process.env.REACT_APP_ALGOLIA_CLIENT_ID}`, `${process.env.REACT_APP_ALGOLIA_CLIENT_TOKEN}`);
    const index = client.initIndex(ind);
    let findedProduct;
    await index.search(store, {
      hitsPerPage: hits,
      facetFilters: filter
    }).then(({ hits }) => {
      findedProduct = hits;
    });
    return findedProduct;
  }
  async search(store: string, query: string, hits: number, ind: string) {
    const client = algoliasearch(`${process.env.REACT_APP_ALGOLIA_CLIENT_ID}`, `${process.env.REACT_APP_ALGOLIA_CLIENT_TOKEN}`);
    const index = client.initIndex(ind);
    let findedProduct;
    await index.search('', {
      facetFilters: `store:${store}`,
      similarQuery: query,
      hitsPerPage: hits,
    }).then(({ hits }) => {
      findedProduct = hits;
    });
    return findedProduct;
  }
  async searchWithoutStore(query: string, hits: number, ind: string) {
    const client = algoliasearch(`${process.env.REACT_APP_ALGOLIA_CLIENT_ID}`, `${process.env.REACT_APP_ALGOLIA_CLIENT_TOKEN}`);
    const index = client.initIndex(ind);
    let findedProduct;
    await index.search(query,{
      hitsPerPage: hits,
    }).then(({hits}) => {
      findedProduct = hits;
    });
    return findedProduct;
  }
}

export default new AlgoliaSearch();