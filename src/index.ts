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
//כאן נראה איך לייצר שרת שמסוגל לטפל גם בבקשות רגילות
//wensocket - subscriptions וגם בבקשות 
//התהליך הוא מעט מסורבל, זה מה שקיים בדוקומנטציה נכון להיום
//יצירת השרת
const app = express();
//http עטיפת השרת בשרת
// websocketכדי שנוכל להעבירו לשרת ה
const httpServer = createServer(app);
//websocket יצירת שרת 
const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql'
});

const schema = makeExecutableSchema({ typeDefs, resolvers });
//הפעלת השרת שלנו, הכולל את שני פרוטוקולי התקשורת 
//makeExecutableSchema אותו שרת גם כולל את הסכמה שלנו, לכן יצרנו אתה לפני עם 
const serverCleanup = useServer({ schema }, wsServer);

//העלאת שרת האפולו שלנו בקוניפורציה 
//אשר תתאים לשימוש בשרת עם שני הפרוטוקולים שיצרנו קודם לכן
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
//הפעלת שרת האפולו
await apolloServer.start();

app.use(cors());
//של שרת האקספרס middlware-שילוב שרת אפולו כ 
app.use("/graphql", cors(), BodyParser.json(), expressMiddleware(apolloServer));


const PORT = 8080;
await mongoose.connect("mongodb://127.0.0.1:27017/my-database");
httpServer.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}`);
});