const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: "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",
});

const app = express();
const port = 3080;

app.use(bodyParser.json());
app.use(cors());

// MongoDB connection string
const mongoURI =
  // "mongodb+srv://asiflzwd:asiflzwd123@cluster0.gpdaa5w.mongodb.net/";
  "mongodb+srv://user_n1:user_n123@cluster0.gpdaa5w.mongodb.net/";
  const client = new MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//connect to mongodb
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

connectToMongoDB();

async function generateAILearnerLink(userContext) {
  try {
    const searchEngineAPIKey = "AIzaSyBy7nAwbaQpCN4C_mzG6CyLgKcwsvdKVXw";
    const searchEngineCX = "d437f7034a52b4b5b";
    const searchQuery = encodeURIComponent(userContext);
    const searchEndpoint = `https://www.googleapis.com/customsearch/v1?q=${searchQuery}&key=${searchEngineAPIKey}&cx=${searchEngineCX}`;

    const response = await fetch(searchEndpoint);
    const searchData = await response.json();

    // Extract relevant links from search results
    const relevantLinks = searchData.items.map((item) => item.link);
    console.log(relevantLinks);

    return relevantLinks;
  } catch (error) {
    console.error("Error fetching search results:", error);
    return [];
  }
}




async function generateAIAnswer(user, newQuestion, entireConversation = []) {
  try {
    const userMessage =
      (newQuestion && newQuestion.message) || "Invalid user input";

    console.log("New question:", newQuestion); // Add this line for logging

  const relevantConversation = entireConversation
  .filter((conv) => conv.user === "user_name" || conv.user === "gpt")
  .map((conv) => {
    let content;

    // Check if conv.user is "gpt"
    if (conv.user === "gpt") {
      // Add your condition for "gpt" user here
      content = conv.message.Aianswer.aianswer;
    } else {
      content = conv.message;
    }

    return {
      role: conv.user === "gpt" ? "system" : "user",
      content: content,
    };
  });

    //console.log("entire conversation inside generateAIAnswer:",relevantConversation.content)

    const conversation = [
      ...relevantConversation,
      { role: "user", content: `${user}: ${userMessage}` },
    ];
    //console.log("Formatted Existing chat", conversation);


    console.log("Conversation:", conversation); // Add this line for logging

    const createContext = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        // { role: "system", content: "user conversation is given below.\
        // if there is a previous chat than be sure to answer give contexts in that regard.\
        //  your task is to find the contexts from it in 3-7 words seprate words.\
        // absolutely avoid using sentences." },
        {role:"system",content: "generate context in short and concise words."},
        ...conversation, // Assuming conversation is an array of messages
      ],
          max_tokens: 500,
      temperature: 0,
    });
    console.log("context: ", createContext.choices[0].message.content);
    const context = createContext.choices[0].message.content;

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages:  [
        { role: "user", content: "the context of this chat are: " + context },
        { role: "system", content: "You are a helpful assistant. \
        Your task is to answer the users question in context as much as possible." },
        ...conversation, // Assuming conversation is an array of messages
      ],
      max_tokens: 500,
      temperature: 0.5,
    });


    const aianswer = chatCompletion.choices[0].message.content;

    return { aianswer };
  } catch (error) {
    console.error("Error in generateAIAnswer:", error);
    throw error; // Rethrow the error for better debugging
  }
}

async function generateChatName(aianswer, newQuestion) {
  try {
    const conversation = [
      { role: "system", content: "Your task is to generate a name for this chat based on user question and AI generated answer.But keep in mind it has to be in 10 to 15 charecters." },
      { role: "user", content: `User question was: "${newQuestion}" And the AI generated answer was: "${aianswer}"` },
    ];
    // console.log("Chat name initial conversation", conversation);

    // console.log("Conversation:", conversation); // Add this line for logging

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversation,
      max_tokens: 200,
      temperature: 0.5,
    });

    const suggestedChatName = chatCompletion.choices[0].message.content;
    console.log("suggestedChatName inside ",suggestedChatName)

    return { suggestedChatName };
  } catch (error) {
    console.error("Error in generateChatName:", error);
    throw error; // Rethrow the error for better debugging
  }
}

async function generateSimilarQuestion(aianswer, newQuestion) {
  try {
    const conversation = [
      { role: "system", content: "Your task is to generate a similar question as the user asked in context to the aianswer." },
      { role: "user", content: `User question was: "${newQuestion}" And the AI generated answer was: "${aianswer}"` },
    ];
    // console.log("Chat name initial conversation", conversation);

    // console.log("Conversation:", conversation); // Add this line for logging

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversation,
      max_tokens: 200,
      temperature: 0.5,
    });

    const simQ = chatCompletion.choices[0].message.content;
    //console.log("suggestedChatName inside ",suggestedChatName)

    return { simQ };
  } catch (error) {
    console.error("Error in generateSimilarQuestion:", error);
    throw error; // Rethrow the error for better debugging
  }
}



// Update the app.post route
app.post("/postai", async (req, res) => {
  // const { user_id, chat_name = req.body.question, unique_id, question } = req.body;
  const { user_id, unique_id, question } = req.body;
  console.log("Incoming request:", { user_id, unique_id, question });
  

  try {
    const db = client.db("appdb_online");
    const collection = db.collection("aiqus_new");
    let aianswer = [];
    let Aianswer;
    let chat_name;
    let similarQ;
    let id;

    if (unique_id !== null) {
      // Existing chat logic
      const existingChat = await collection.findOne({ _id: new ObjectId(unique_id) });

      if (existingChat) {
        Aianswer = await generateAIAnswer(
          question.user,
          { message: question.message },
          existingChat.conversations
        );

        const learnerLinks = await generateAILearnerLink(Aianswer.aianswer);
        const similarQuestion = await generateSimilarQuestion(Aianswer.aianswer,question.message);

        aianswer = {
          Aianswer,
          userContext: question.message,
          learnerLinks,
          similarQ: similarQuestion.simQ,

        };


        const result = await collection.updateOne(
          { _id: new ObjectId(existingChat._id) },
          {
            $push: {
              conversations: {
                $each: [
                  { user: "user_name", message: question.message },
                  { user: "gpt", message: aianswer },
                ],
              },
            },
            $set: {
              summary: "blank",
            },
          }
        );

        console.log("Chat document updated:", result.modifiedCount);
      }
    } else {
      // New chat logic
      Aianswer = await generateAIAnswer(question.user, { message: question.message }, []);
      console.log("New ai ans:", Aianswer.aianswer);
      console.log("New question:", question.message);

      const learnerLinks = await generateAILearnerLink(Aianswer.aianswer);
      //console.log("Aians inside post methode:",Aianswer);
      let temp_chat_name = await generateChatName(Aianswer.aianswer,question.message);
      chat_name= temp_chat_name.suggestedChatName;
      const similarQuestion = await generateSimilarQuestion(Aianswer.aianswer,question.message);



      aianswer = {
        Aianswer,
        userContext: question.message,
        learnerLinks,
        similarQ: similarQuestion.simQ,
      };
      
      // console.log(chat_name);


      const result = await collection.insertOne({
        user_id,
        chat_name,
        conversations: [
          { user: question.user, message: question.message },
          { user: "gpt", message: aianswer },
        ],
        summary: "blank",
      });
      id = result.insertedId;

      console.log("Chat document inserted:", id._id);
    }

    res.json({
      success: true,
      message: aianswer,
      id: id,
      //similarQ: similarQuestion.simQ,


    });

    console.log("Server response sent:", {
      success: true,
      message: aianswer,
    });
  } catch (error) {
    console.error("Error updating/inserting chat document:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


// Internal chats fetch
app.get("/internal_chats/:chat_id", async (req, res) => {
  const { user_id, chat_id } = req.params;

  try {
    // console.log("Fetching chats for:", user_id, chat_id);

    const db = client.db("appdb_online");
    const collection = db.collection("aiqus_new");

    const chats = await collection.find({ _id: new ObjectId(chat_id)  }).toArray();

    // Flatten the conversation arrays
    const flattenedChats = chats.map((chat) => {
      const uniqueConversations = new Map();
      chat.conversations.forEach((conv) => {
        // uniqueConversations.set(`${conv.user}:${conv.message}`, conv);
        if (conv.user === "gpt") {
          // Add your condition for "gpt" user here
          uniqueConversations.set(`${conv.user}:${conv.message.Aianswer.aianswer}`, conv);

        } else {
          uniqueConversations.set(`${conv.user}:${conv.message}`, conv);
        }
      });
      return { ...chat, conversations: [...uniqueConversations.values()] };
    });

    console.log("Chats retrieved:", flattenedChats);
    console.log("Chats retrieved:", chats);

    res.json({
      success: true,
      chats: flattenedChats,
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// All chat_name 's fetch
app.get("/chats/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    // console.log("Fetching chats for user:", user_id);

    const db = client.db("appdb_online");
    const collection = db.collection("aiqus_new");

    const chats = await collection.find({ user_id }).toArray();
    // console.log("Chat names fetched:", chats);

    res.json({
      success: true,
      chats: chats.map((chat) => ({ chat_id: chat._id,chat_name: chat.chat_name })),
      //chats: chats.map((chat) => ({ chat_name: chat.chat_name })),
      // chat: chats,
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

