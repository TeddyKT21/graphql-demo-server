import { Document, Schema, model } from "mongoose";

export interface IProduct{
    name:String,
    description:String,
    price:Number,
    quantity:Number,
    image:String,
}

interface ProductDocument extends Document,IProduct{}

const productSchema  = new Schema<ProductDocument>({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    image:{
        type:String,
        required:false
    }
})

export const ProductModel = model<ProductDocument>('Product',productSchema);