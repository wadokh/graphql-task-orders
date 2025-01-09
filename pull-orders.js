import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

const { SHOPIFY_STORE_URL, SHOPIFY_ACCESS_TOKEN } = process.env;

const graphqlEndpoint = `https://${SHOPIFY_STORE_URL}/admin/api/2025-01/graphql.json`;

let cursor = null, hasNextPage = true;

while (hasNextPage) {
    console.log("entered while loop")

    const query =`
 query {
  orders(first: 250, after: ${cursor? `"${cursor}"` : null}){
    edges {
      node {
        id
        name
        createdAt
        lineItems(first: 100) {
          edges {
            node {
              id
              name
              currentQuantity
              originalUnitPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
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
}
    `
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
            const {id: shopifyId, name, createdAt} = orderNode;
            console.log(shopifyId);
            console.log(name);
            console.log(createdAt);
            const itemsArr = orderNode.lineItems.edges;
            // console.log(itemsArr);
            const len = itemsArr.length;
            for (let j = 0; j < len; j++) {
                console.log(j+"test");
                const productId = itemsArr[j].node.id;
                console.log(productId);
                const productName = itemsArr[j].node.name;
                console.log(productName);
                const quantity = itemsArr[j].node.currentQuantity;
                console.log(quantity);
                const price  = parseFloat(itemsArr[j].node.originalUnitPriceSet.shopMoney.amount);
                const currencyCode = itemsArr[j].node.originalUnitPriceSet.shopMoney.currencyCode;
                console.log("Price:" + price);
                console.log("currency: " + currencyCode);
                try {
                    await prisma.orders.create({
                        data: {
                            shopifyId,
                            name,
                            createdAt,
                            productId,
                            productName,
                            quantity,
                            price,
                            currencyCode,
                        },
                    })
                } catch (error) {
                    console.log("error inserting data", error);
                }
            }
        }
        hasNextPage = data.data.orders.pageInfo.hasNextPage;
        cursor = data.data.orders.pageInfo.endCursor;
    } catch(error) {
        console.error('Error fetching products:', error);
        break;
    }
}

