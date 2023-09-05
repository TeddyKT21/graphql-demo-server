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
    async findById(_,{_id} :{_id: String}){
      return await ProductModel.findById(_id);
    },
  },
  Mutation: {
    async addProduct(_,{productData} : {productData:IProduct}) {
      const product = new ProductModel(productData);
      await product?.save();
      console.log('adding product, ',productData);
      pubsub.publish('PRODUCT_CREATED',{
        productCreated:{...productData,_id:product._id}
      })
      return {...productData, _id:product._id.toString()};
    },
    async updateProduct(_,{productData, _id} : {productData:IProduct,  _id:String}){
      const product = await ProductModel.findByIdAndUpdate(_id,productData);
      await product?.save();
      console.log('updating product, ',productData);
      return product;
    },
    async deleteProduct(_,{_id} : {_id: String}){
      console.log('deleting product, ',_id);
      const product = await ProductModel.findByIdAndDelete(_id); 
      return product;
    },
  },
  Subscription:{
    productCreated:{
      subscribe: () => {
        console.log('in subscription');
        return pubsub.asyncIterator(['PRODUCT_CREATED'])
      },
      // resolve: (payload) => {
      //   const { productCreated } = payload;
      //   console.log('New product created:', productCreated);
      //   return productCreated;
      // },
    }
  }
};
