import { PubSub } from "graphql-subscriptions";
import { IProduct, ProductModel } from "../models/product.js";

const pubsub = new PubSub();
export const resolvers = {
  Query: {
    hello() {
      return {
        text: "hello world",
        number: 999,
      };
    },
    async getProducts() {
      return await ProductModel.find();
    },
    async findById(_, { _id }: { _id: String }) {
      return await ProductModel.findById(_id);
    },
  },
  Mutation: {
    async addProduct(_, { productData }: { productData: IProduct }) {
      const product = new ProductModel(productData);
      await product?.save();
      console.log("adding product, ", productData);

      //subscription-כאן יש הפעלה של ה 
      //מדוע ? כי נרצה ליידע את כל הלקוחות (לא רק היוצר) שאכן נוסף מוצר חדש
      //pubsub- שימו לב שזו מתבצעת בעזרת אובייקט ה
      pubsub.publish("PRODUCT_CREATED", {
        productCreated: { ...productData, _id: product._id },
      });

      return { ...productData, _id: product._id.toString() };
    },
    async updateProduct(
      _,
      { productData, _id }: { productData: IProduct; _id: String }
    ) {
      const product = await ProductModel.findByIdAndUpdate(_id, productData);
      await product?.save();
      console.log("updating product, ", productData);
      return product;
    },
    async deleteProduct(_, { _id }: { _id: String }) {
      console.log("deleting product, ", _id);
      const product = await ProductModel.findByIdAndDelete(_id);
      return product;
    },
  },
  Subscription: {
    //שימו לב לתוספת הזו
    //subscription- בעזרתה לקוחות יכולים להאזין ל
    //pubSub-גם היא בעזרת אובייקט ה
    productCreated: {
      subscribe: () => {
        return pubsub.asyncIterator(["PRODUCT_CREATED"]);
      },
    },
  },
};
