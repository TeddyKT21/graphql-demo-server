import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import mongoose from "mongoose";
import BodyParser from "body-parser";
import cors from "cors";
import { typeDefs } from "./graphql/types.js";
import { resolvers } from "./graphql/resolvers.js";
import { createServer } from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
const app = express();
const httpServer = createServer(app);
const schema = makeExecutableSchema({ typeDefs, resolvers });
const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql'
});
const serverCleanup = useServer({ schema }, wsServer);
const apolloServer = new ApolloServer({ schema,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await serverCleanup.dispose();
                    },
                };
            },
        },
    ] });
await apolloServer.start();
app.use("/graphql", cors(), BodyParser.json(), expressMiddleware(apolloServer));
const PORT = 8080;
await mongoose.connect("mongodb://127.0.0.1/myDb");
httpServer.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}`);
});