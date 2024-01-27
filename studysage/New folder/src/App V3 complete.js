import logo from "./logo.svg";
import "./normal.css";
import "./App.css";
import { useState, useEffect, useRef } from "react";

function App() {
  const chatInterfaceRef = useRef();
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [chatName, setChatName] = useState("");
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [unique_id, setUnique_id] = useState(null); // Declare unique_id as a global variable


  useEffect(() => {
    fetchChats();
  }, []);

  async function fetchChats() {
    try {
      const response = await fetch(`http://localhost:3080/chats/001`);
      const data = await response.json();
      console.log("Chats from server:", data);

      if (data.success) {
        setChats(data.chats);
      } else {
        console.error("Error fetching chats:", data.message);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  }



  async function loadChatByChatName(chatName) {
    try {
      const response = await fetch(
        // Edit chatName to be the unique id of the chat.
        `http://localhost:3080/chats/001/${encodeURIComponent(chatName)}`
      );
      const data = await response.json();
      console.info("loaded chat:", data);
  
      if (data.success && data.chats.length > 0) {
        const selectedChat = data.chats[0];
        setSelectedChat(selectedChat);
        // setUnique_id(selectedChat._id)
        // Extract and flatten all conversations using the provided map
        const uniqueConversations = new Map();
        selectedChat.conversations.forEach((conv) => {
          uniqueConversations.set(`${conv.user}:${conv.message}`, conv);
        });
  
        // Format conversations into the desired JSON format
        const formattedConversations = [...uniqueConversations.values()].map((conv) => {
          if (conv.user === "gpt") {
            return {
              user: conv.user,
              message: conv.message.Aianswer.aianswer,
              context: conv.message.userContext,
              learnerLinks: conv.message.learnerLinks,
            };
          } else {
            return {
              user: conv.user,
              message: conv.message,
              // context: "",
              // learnerLinks: "",
            };
          }
        });
  
        // Log the formatted conversations
        console.log("formattedConversations:", formattedConversations);
  
        // Set the chat log with the formatted conversations
        setChatLog(formattedConversations);
  
        // Update the chatName state when a chat is loaded
        setChatName(chatName || selectedChat.chat_name); // Use selectedChat.chat_name as default
      } else {
        console.error("Error loading previous chats:", data.message);
      }
    } catch (error) {
      console.error("Error loading previous chats:", error);
    }
  }
  

  // Scroll to the bottom of the chat interface when it updates
  useEffect(() => {
    if (chatInterfaceRef.current) {
      chatInterfaceRef.current.scrollTop =
        chatInterfaceRef.current.scrollHeight;
    }
  }, [chatLog]);

  // new chat and old chat clear,
  function clearChat() {
    setSelectedChat(null);
    setChatLog([]);
    setChatName(""); // Clear chat name when starting a new chat
  }

  async function submitHandler(e) {
    e.preventDefault();
    let chatLogNew = [...chatLog, { user: "user_name", message: `${input}` }];
    setInput("");
    setChatLog(chatLogNew);

    // Send only the latest question to the server
    const latestQuestion = { user: "user_name", message: input };

    try {
      const response = await fetch("http://localhost:3080/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: "001",
          chat_name: chatName || latestQuestion.message,
          //chat_name: chatName,
          question: latestQuestion,
        }),
      });

      const data = await response.json();
      console.log("Server response:", data);
      console.log("Message:", data.message.Aianswer.aianswer);
      

      const updatedChatLog = [
        ...chatLogNew,
       {
          user: "gpt",
          message: `${data.message.Aianswer.aianswer}`,
          context: `${data.message.userContext}`,
          learnerLinks: `${data.message.learnerLinks}`,
        },
      ];
      console.log("Updated chatLog:", updatedChatLog);
      console.log("internal message:", updatedChatLog[1].message);

      // if (data.success && data.aianswer.length > 0) {
      //   const selectedChat = data;
      //   setSelectedChat(selectedChat);

      //   // Log the structure of selected chat
      //   console.log("selectedChat:", selectedChat);

      //   // Extract and flatten all conversations
      //   const updatedChatLog = Object.entries(selectedChat)
      //     .filter(([key, value]) => key.startsWith("conversation"))
      //     .flatMap(([key, value]) => value);

      setChatLog(updatedChatLog);
      // }else{
      //   console.log("Error loading the data fetched from server.")
      // }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  return (
    <div className="App">
      <aside className="sidemenu">
        <div className="sidemenu-content">
          <div className="side-menue-button" onClick={clearChat}>
            <span>+</span>
            New Chat
          </div>

          {/* Input for changing chat name */}
          {/* <input
            type="text"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            placeholder="Enter Chat Name"
          /> */}
          <div className="side-menue-chatbutton">
            {/* Display previous chats as buttons */}
            {chats.map((chat) => (
              <button
                key={chat._id}
                className="chat-name"
                onClick={() => loadChatByChatName(chat.chat_name)}
              >
                {chat.chat_name}
              </button>
            ))}
          </div>
        </div>
      </aside>
      <section className="chatbox">
        <div ref={chatInterfaceRef} className="chat-interface">
          {/* Display previous chat messages */}
          {chatLog.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
        </div>
        <div className="chat-input-holder">
          <form onSubmit={submitHandler}>
            <input
              row="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="chat-input-textarea"
              placeholder="Ask Studysage here"
            ></input>
          </form>
        </div>
      </section>
    </div>
  );
}

// ...
const ChatMessage = ({ message }) => {
  console.log("Message inside view",message);
  return (
    <div className={`chat-background ${message.user === "gpt" && "-chatgpt"}`}>
      <div className="chat-message">
        <div
          className={`user-image ${message.user === "gpt" && "-chatgpt"}`}
        ></div>
        <div className="message">
          {message.user === "gpt" && message.message && (
            
            <>
              <>
              <h4>AI Answer:</h4>
              <p>{message.message}</p>
              </>
               
          
            <div>

            {message.context && (
              
              <>
            <hr />
            <h4>Context of Question:</h4>
            <p>{message.context}</p> 
            </>
            )}
            {message.learnerLinks && (

            <>
            
                  <h4>Learner Links:</h4>
                  <ul>
                    {message.learnerLinks.map((link, index) => (
                      <li key={index}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
            )}
                </div>  
          </>
          )}
          {/* {message.user === "gpt" && message.message && (
            // <>
            //   <h4>AI Answer:</h4>
            //   <p>{message.message.Aianswer.aianswer}</p>
            // </>
            <>
            <h4>AI Answer:</h4>
            <p>{message.message}</p>
            <hr />
            <h4>Context of Question:</h4>
              <p>{message.context}</p> 

              
              
                
          </>
          )} */}
          {message.user !== "gpt" && message.message}
          {message.message.context && (
            <div>
              <hr />
              <h4>Context of Question:</h4>
              <p>{message.message.context}</p>
              {message.message.learnerLinks && (
                <>
                  <h4>Learner Links:</h4>
                  <ul>
                    {message.message.learnerLinks.map((link, index) => (
                      <li key={index}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
