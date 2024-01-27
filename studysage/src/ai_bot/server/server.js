// server.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const PDFParser = require("pdf-parse");
const { FaissStore } = require("@langchain/community/vectorstores/faiss");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { CharacterTextSplitter } = require("langchain/text_splitter");
const OpenAI = require("openai");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");


const app = express();
const port = 8000;
app.use(bodyParser.json());

app.use(cors());
let pdfName = null;
const directory = "./";

// Set OpenAI API key
process.env.OPENAI_API_KEY =
  "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";

const openai = new OpenAI({
  apiKey: "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",
});


//MongoDB connection string
const mongoURI =
  "mongodb+srv://user_n1:user_n123@cluster0.gpdaa5w.mongodb.net/";
const client = new MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

connectToMongoDB();



// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "pdf_files"); // Save files to the pdf_files directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Keep the original file name
    pdfName = file.originalname;
    console.log(pdfName);
  },
});

async function generateAIAnswer(embeddingAnswer, Question) {
  try {
    // console.log("New question:", embeddingAnswer.pageContent); // Add this line for logging

    const conversation = [
      {
        role: "system",
        content:
          "You are a helpful assistant. you have an answer form an embedded doc (embedding Answer) and question of the user\
      you have to relate the question with the answer and give in context short answers.\
      try to relate your data with the embedded data as much as possible.\
      do not mention anything about embedding to the user\
      this answer will be sent to a front end and will be viewed in html so if you have to add formatting add in them in that way.\
      If the message is out of context tell the user that ( The question is out of context for this pdf please ask questions from the pdf).",
      },
      {
        role: "user",
        content: `question:${Question} embedding Answer: ${embeddingAnswer}`,
      },
    ];

    console.log("Conversation:", conversation);

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversation,
      max_tokens: 200,
      temperature: 0.5,
    });

    const aianswer = chatCompletion.choices[0].message.content;
    //console.log("AIanswer:", aianswer[0]);
    return { aianswer };
  } catch (error) {
    console.error("Error in generateAIAnswer:", error);
    throw error; // Rethrow the error for better debugging
  }
}

const upload = multer({ storage });

// Serve static files from the pdf_files directory
app.use("/pdf_files", express.static("pdf_files"));

// Handle file uploads
app.post("/upload", upload.single("pdf"), (req, res) => {
  try {
    // Path to PDF file/files
    const pdfPath = "./pdf_files/" + pdfName;
    const directoryName = pdfName.replace(/\.pdf$/, ""); // Remove ".pdf" extension
    console.log(pdfPath);
    console.log(directoryName);

    // Create a directory with the same name as the PDF (excluding ".pdf")
    fs.mkdirSync(directoryName, { recursive: true });

    // Read text from PDF using pdf-parse
    const pdfBuffer = fs.readFileSync(pdfPath);
    PDFParser(pdfBuffer)
      .then((pdfData) => {
        // Extract text from the parsed PDF data
        const rawText = pdfData.text;

        // Split the text using Character Text Split
        const textSplitter = new CharacterTextSplitter({
          separator: "\n",
          chunk_size: 200,
          chunk_overlap: 50,
          length_function: (str) => str.length,
        });

        // Wait for the promise to resolve
        return textSplitter.splitText(rawText);
      })
      .then((texts) => {
        console.log("splitted text: ", texts.length);
        const index = [];

        for (let i = 0; i < texts.length; i++) {
          //console.log("splitted text: ", texts[i]);
          index.push({ id: i });
          //console.log("splitted text: ", texts[i]);
          //console.log("\n", i);
        }

        const embedAndStoreDocuments = async () => {
          //create pdf texts to mongodb.


          // Create a vector store through any method, here from texts as an example
          const vectorStore = await FaissStore.fromTexts(
            texts,
            index,
            new OpenAIEmbeddings()
          );

          await vectorStore.save(directoryName);

          console.log("embedding succesful");
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return true;
        };

        async function embed() {
          if (await embedAndStoreDocuments()) {
          }
        }
        embed();
      });
    res.json({
      success: true,
      chats: directoryName,
    });
  } catch (error) {
    console.error("Error in /upload", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }

  //res.json({ message: "File uploaded & trained successfully" });
});

//ask pdf question
app.get("/chats/:user_id/:chat_name/:question", async (req, res) => {
  const {user_id ,chat_name, question } = req.params;
  console.log("chat_name", chat_name);
  console.log("question", question);
  console.log("user id", user_id);

  try {
    let Answer; 
    let vector_ans;
    let generated_ans;

    //find all the chats with chat_name variable inside the collection


    const db = client.db("pdf_conversation");
    const collection = db.collection(user_id);

    async function performSimilaritySearch() {
      const loadedVectorStore = await FaissStore.load(
        chat_name,
        new OpenAIEmbeddings()
      );
      // ... (your existing code)
      vector_ans = await loadedVectorStore.similaritySearch(question, 3);
      //console.log("answer:", Answer[0].pageContent);
      generated_ans = await generateAIAnswer(vector_ans[0].pageContent, question);
    }

    await performSimilaritySearch(); // Wait for the similarity search to complete

    console.log("answer", generated_ans.aianswer);
    Answer=generated_ans.aianswer;

    try {
      const existingDocument = await collection.findOne({ chat_name: chat_name });
    
      if (existingDocument) {
        // If the document with chat_name exists, update it
        await collection.updateOne(
          { chat_name: chat_name },
          { $push: { questions: question, answers: Answer } }
        );
      } else {
        // If the document with chat_name doesn't exist, insert a new one
        await collection.insertOne({
          chat_name: chat_name,
          questions: [question],
          answers: [Answer]
        });
      }
    
      console.log("data inserted successfully.");
    } catch (error) {
      console.error("Error occurred:", error);
    } 

    res.json({
      success: true,
      chats: Answer,
    });
  } catch (error) {
    console.error("Error in /chats/:chat_name/:question", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.get("/internal_chats/:user_id/:chat_name", async (req, res) => {
  const {user_id ,chat_name } = req.params;

  const db = client.db("pdf_conversation");
  const collection = db.collection(user_id);

  try {
    let query = {}; // You can modify the query based on your requirements

    if (chat_name) {
      query = { chat_name: chat_name };
    }

    const internalChats = await collection.find(query).toArray();

    if (internalChats.length > 0) {
      console.log("Internal Chats:", internalChats);
      res.json({
        success: true,
        chats: internalChats,
      });

    } else {
      console.log("No internal chats found.");
      res.json({
        success: true,
        chats: [],
      });

    }
    
  } catch (error) {
    console.error("Error occurred:", error);
  }

});

app.get("/directories", (req, res) => {
  try {
    const coursesDirectory = "./courses";
    // Read the contents of the specified directory
    const directories = fs
      .readdirSync(coursesDirectory)
      .filter((file) =>
        fs.statSync(path.join(coursesDirectory, file)).isDirectory()
      );

    res.json({
      success: true,
      directories: directories,
    });
  } catch (error) {
    console.error("Error in /directories", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
