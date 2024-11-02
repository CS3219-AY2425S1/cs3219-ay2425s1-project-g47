import index from "./index.js";
import "dotenv/config";
import { connectToDB } from "./model/repository.js";

const port = process.env.PORT || 8000;

await connectToDB().then(() => {
  console.log("MongoDB Connected!");

  index.listen(port);
  console.log("User service server listening on port:" + port);
}).catch((err) => {
  console.error("Failed to connect to DB");
  console.error(err);
});

