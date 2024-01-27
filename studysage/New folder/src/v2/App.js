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
  const [aiAnswer, setAiAnswer] = useState(null);
  const [additionalData, setAdditionalData] = useState(null);


  useEffect(() => {
    fetchChats();
  }, []);

  async function fetchChats() {
    try {
      // Replace "001" with the actual user ID or use a dynamic value
      const userId = "001";
  
      const response = await fetch(`http://localhost:3080/chats/${userId}`);
      const data = await response.json();
      console.log("Chats from server:", data);
  
      if (data.success) {
        setChats(data.chats);
  
        // Assuming data.message contains both aianswer and additionalData
        if (data.message && data.message.aianswer && data.additionalData) {
        setAiAnswer(data.message.aianswer);
        setAdditionalData(data.additionalData);
        }else {
          // Handle the case where aianswer or additionalData is missing
          console.error("Incomplete server response:", data.message);
        }
      } else {
        console.error("Error fetching chats:", data.message);
      }
  
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  }
  
  
  async function loadChatByChatName(chatName) {
    try {
      // Replace "001" with the actual user ID or use a dynamic value
      const userId = "001";
  
      const response = await fetch(
        `http://localhost:3080/chats/${userId}/${encodeURIComponent(chatName)}`
      );
      const data = await response.json();
      console.info("loaded chat:", data);
  
      if (data.success && data.chat) {
        const selectedChat = data.chat;
  
        // Log the structure of selected chat
        console.log("selectedChat:", selectedChat);
  
        // Extract and flatten all conversations
        const allConversations = selectedChat.conversations || [];
  
        // Log the structure of all conversations
        console.log("allConversations:", allConversations);
  
        // Set the chat log with all conversations
        setChatLog(allConversations);
  
        // Update the chatName state when a chat is loaded
        setChatName(chatName);
      } else {
        console.error("Error loading previous chats:", data.message);
      }
    } catch (error) {
      console.error("Error loading previous chats:", error);
    }
  }
  
  

  useEffect(() => {
    // Scroll to the bottom of the chat interface when it updates
    if (chatInterfaceRef.current) {
      chatInterfaceRef.current.scrollTop =
        chatInterfaceRef.current.scrollHeight;
    }
  }, [chatLog]);

  //new chat and old chat clear,
  function clearChat() {
    setSelectedChat(null);
    setChatLog([]);
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
          chat_name: chatName,
          question: latestQuestion,
        }),
      });
      // if (!response.ok) {
      //   throw new Error(`HTTP error! Status: ${response.status}`);
      // }
    
      const data = await response.json();
      console.log("Server response:", data);
    
      // Check if chats array is non-empty
      if (data.chats && data.chats.length > 0) {
        const updatedChatLog = [
          ...chatLogNew,
          {
            user: "gpt",
            message: data.chats[0].message,
            //additionalData: JSON.parse(data.chats[0].additionalData),
          },
        ];
    
        console.log("Updated chatLog:", updatedChatLog);
    
        setChatLog(updatedChatLog);
        setAiAnswer(data.chats[0].message);
        //setAdditionalData(JSON.parse(data.chats[0].additionalData));
      } else {
        console.warn("No chat data in the server response.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    
    
  }
  
  
  

  return (
    <div className="App">
      <aside className="sidemenu">
        <div className="side-menue-button" onClick={clearChat}>
          <span>+</span>
          New Chat
        </div>
        {/* Input for changing chat name */}
        <input
          type="text"
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
          placeholder="Enter Chat Name"
        />
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
      </aside>
      <section className="chatbox">
        <div ref={chatInterfaceRef} className="chat-interface">
          {/* Display messages for the selected chat */}
          {selectedChat &&
            [...Array(selectedChat.conversationCount).keys()].map(
              (conversationIndex) => (
                <div key={conversationIndex} className="conversation">
                  {selectedChat[`conversation${conversationIndex + 1}`] &&
                    Array.isArray(
                      selectedChat[`conversation${conversationIndex + 1}`]
                    ) &&
                    selectedChat[`conversation${conversationIndex + 1}`].map(
                      (message, messageIndex) => (
                        <ChatMessage key={messageIndex} message={message} />
                      )
                    )}
                </div>
              )
            )}

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


const ChatMessage = ({ message }) => {
  const additionalData = typeof message.additionalData === 'string' ? JSON.parse(message.additionalData) : message.additionalData;

  return (
    <div className={`chat-background ${message.user === "gpt" && "-chatgpt"}`}>
      <div className="chat-message">
        <div
          className={`user-image ${message.user === "gpt" && "-chatgpt"}`}
        ></div>
        <div className="message">
          {message.message}
          {additionalData && additionalData.learnerLinks && (
            <div>
              <hr />
              <h4>Learner Links:</h4>
              <ul>
                {additionalData.learnerLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};




export default App;