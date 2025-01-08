import 'dotenv/config';
import fetch from 'node-fetch';
const { SHOPIFY_STORE_URL, SHOPIFY_ACCESS_TOKEN } = process.env;

const graphqlEndpoint = `https://${SHOPIFY_STORE_URL}/admin/api/2025-01/graphql.json`;

let cursor = null, hasNextPage = true;

while (hasNextPage) {
    console.log("entered while loop")

    const query =`
        query{
        orders(first: 250, after: ${cursor? `"${cursor}"` : null}){
            edges {
                node {
                    id
                    name
                    createdAt
                    lineItems(first: 100){
                        edges{
                            node{
                                id
                                name
                            }
                        }
                    }
                }
            }
            pageInfo {
                hasPreviousPage
                hasNextPage
                startCursor
                endCursor
            }
        }
    }`
    console.log("query");

    try {
        const response = await fetch(graphqlEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
            },
            body: JSON.stringify({ query }),
        });

        const data = await response.json();
        const len = data.data.orders.edges.length;
        for (let i = 0; i < len; i++) {
            const orderNode = data.data.orders.edges[i]?.node;
            if(!orderNode) break;

            console.log(orderNode);
        }
        hasNextPage = data.data.orders.pageInfo.hasNextPage;
        cursor = data.data.orders.pageInfo.endCursor;
    } catch(error) {
        console.error('Error fetching products:', error);
        break;
    }
}
// const query = `
//   {
//     orders(first: 2) {
//     nodes {
//       id
//       name
//       createdAt
//       lineItems(first: 250){
//         edges{
//           node{
//             id
//             name
//           }
//         }
//       }
//     }
//     pageInfo {
//       hasPreviousPage
//       hasNextPage
//       startCursor
//       endCursor
//     }
//   }
//   }
// `;

