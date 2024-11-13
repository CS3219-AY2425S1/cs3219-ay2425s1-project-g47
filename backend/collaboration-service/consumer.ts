import * as amqp from "amqplib/callback_api";
import { MatchModel, Question } from "./models/match";
import axios from "axios";
import { Server } from "socket.io";

export function startRabbitMQ(io: Server) {
  const rabbitMQUrl = process.env.RABBITMQ_URL || "amqp://localhost";
  const questionsAPIUrl = process.env.QUESTIONS_API_URL || "http://localhost/api/question-service/questions/get-question";

  amqp.connect(rabbitMQUrl, (error0, connection) => {
    if (error0) {
      console.error("Failed to connect to RabbitMQ:", error0);
      return;
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        console.error("Failed to open a channel:", error1);
        return;
      }
      const queue = "match_queue";
      channel.assertQueue(queue, { durable: false });
      console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);

      channel.consume(
        queue,
        async (msg) => {
          if (!msg) return;

          const matchResult = JSON.parse(msg.content.toString());
          console.log(`Received message: ${JSON.stringify(matchResult)}`);

          // Build match info based on received message
          const matchInfo = {
            userOne: matchResult.UsernameOne,
            userTwo: matchResult.UsernameTwo,
            room_id: matchResult.RoomID,
            complexity: matchResult.Complexity,
            categories: matchResult.Categories,
            programming_language: matchResult.ProgrammingLanguages,
            question: {} as Question,
            status: 'open',
          };
          console.log(matchInfo.programming_language)

          try {
            // Fetch a question matching the specified categories and complexity
            const question = await fetchQuestion(
              matchInfo.categories,
              matchInfo.complexity,
              questionsAPIUrl
            );

            matchInfo.question = question;

            // Save the match information to MongoDB
            const newMatch = new MatchModel(matchInfo);
            await newMatch.save();
            console.log(`Match saved to MongoDB: ${JSON.stringify(newMatch)}`);
          } catch (error) {
            console.error("Error processing message:", error);
          }
        },
        { noAck: true }
      );
    });
  });
}

// Fetch a single question based on categories and complexity
async function fetchQuestion(
  categories: string[],
  complexities: string[],
  apiURL: string
): Promise<Question> {
  try {
    // Set up the request with categories and complexity as separate query parameters
    const params = new URLSearchParams();
    categories.forEach(category => params.append("categories", category));
    complexities.forEach(complexity => params.append("complexity", complexity));

    const response = await axios.get(apiURL, {
      params,
      paramsSerializer: (params) => params.toString(), // Serialize to standard query string
    });

    const question = response.data;
    if (!question) throw new Error("No matching question found");
    return question;
  } catch (error) {
    console.error("Failed to fetch question:", error);
    throw error;
  }
}
