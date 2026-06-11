import { gql } from "graphql-tag";
import { prisma } from "@/lib/prisma";

export const typeDefs = gql`
  type Product {
    id: Int
    name: String
    price: Float
  }

  type CartItem {
    id: Int
    quantity: Int
    product: Product
  }

  type Cart {
    id: Int
    items: [CartItem]
  }

  type Query {
    products: [Product]
    cart(cartId: Int!): Cart
  }

  type Mutation {
    addProduct(name: String!, price: Float!): Product
    updateProduct(id: Int!, name: String, price: Float): Product
    deleteProduct(id: Int!): Product
    addToCart(cartId: Int!, productId: Int!, quantity: Int): CartItem
    removeFromCart(cartItemId: Int!): CartItem
  }
`;

export const resolvers = {
  Query: {
    products: () => prisma.product.findMany(),
    cart: (_: unknown, { cartId }: { cartId: number }) =>
      prisma.cart.findUnique({ where: { id: cartId }, include: { items: { include: { product: true } } } }),
  },
  Mutation: {
    addProduct: (_: unknown, args: { name: string; price: number }) =>
      prisma.product.create({ data: args }),

    updateProduct: (_: unknown, { id, ...data }: { id: number; name?: string; price?: number }) =>
      prisma.product.update({ where: { id }, data }),

    deleteProduct: (_: unknown, { id }: { id: number }) =>
      prisma.product.delete({ where: { id } }),

    addToCart: async (_: unknown, { cartId, productId, quantity = 1 }: { cartId: number; productId: number; quantity?: number }) => {
      let cart = await prisma.cart.findUnique({ where: { id: cartId } });
      if (!cart) cart = await prisma.cart.create({ data: { id: cartId } });
      return prisma.cartItem.create({ data: { cartId, productId, quantity } });
    },

    removeFromCart: (_: unknown, { cartItemId }: { cartItemId: number }) =>
      prisma.cartItem.delete({ where: { id: cartItemId } }),
  },
};
