export const typeDefs = `
type Hello{
    text:String
    number:Int
}
type Query{
    hello:Hello
    getProducts:[IProduct]
    findById(_id:String!):IProduct
}

type IProduct{
    name:String!
    description:String
    price:Int!
    quantity:Int!
    image:String
    _id:String
}

input ProductData{
    name:String
    description:String
    price:Int
    quantity:Int
    image:String
}
type Mutation{
    addProduct(productData:ProductData!):IProduct
    updateProduct(_id:String! productData:ProductData!):IProduct
    deleteProduct(_id:String!):IProduct
}
type Subscription{
    productCreated:IProduct
}
schema {
    query:Query
    mutation:Mutation
    subscription:Subscription
} 
`