import { ReactComponent as Logo } from './logo.svg';

import "./normal.css";
import "./chat.css";
import { useState, useEffect, useRef } from "react";

function AIChat() {
  const chatInterfaceRef = useRef();
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [chatName, setChatName] = useState("");
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [unique_id, setUnique_id] = useState(null); // Declare unique_id as a global variable
  const [suggestedQuestion, setSuggestedQuestion] = useState(null);
  const [value, setValue] = useState(null);

// In your component's render method
<Logo />

  useEffect(() => {
    fetchChats();
  }, []);

  async function fetchChats() {
    try {
      const response = await fetch(`http://localhost:3080/chats/001`);
      const data = await response.json();
      console.log("Chats from server:", data);

      if (data.success) {
        // let all_chat_names = data.chat.map((chat) => ({ chat_name: chat.chat_name }));
        // setChats(all_chat_names);
        setChats(data.chats);
      } else {
        console.error("Error fetching chats:", data.message);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  }



  async function loadChatByChatName(chat_id) {
    try {
      const response = await fetch(
        // Edit chatName to be the unique id of the chat.
        `http://localhost:3080/internal_chats/${encodeURIComponent(chat_id)}`
      );
      const data = await response.json();
      console.info("loaded chat:", data);
  
      if (data.success && data.chats.length > 0) {
        const selectedChat = data.chats[0];
        setSelectedChat(selectedChat);
        console.log(selectedChat._id)
        setUnique_id(selectedChat._id);
        // Extract and flatten all conversations using the provided map
        const uniqueConversations = new Map();
        selectedChat.conversations.forEach((conv) => {
          if (conv.user === "gpt") {
            // Add your condition for "gpt" user here
            uniqueConversations.set(`${conv.user}:${conv.message.Aianswer.aianswer}`, conv);
  
          } else {
            uniqueConversations.set(`${conv.user}:${conv.message}`, conv);
          }
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
            };
          }
        });


  
        // Log the formatted conversations
        // console.log("formattedConversations:", formattedConversations);
  
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


  // Handle the Tab key press event
  const handleTabKeyPress = (e) => {
    if (e.key === "Tab" && suggestedQuestion !== null) {
      e.preventDefault(); // Prevent default Tab behavior (e.g., moving focus)
      setInput(suggestedQuestion);
    }
  };

  // new chat and old chat clear,
  function clearChat() {
    setSelectedChat(null);
    setUnique_id(null);
    setSuggestedQuestion(null);
    setChatLog([]);
    setChatName(""); // Clear chat name when starting a new chat
  }

  async function submitHandler(e) {
    e.preventDefault();
    if (input.trim() === '') {
      // Input is empty, do not proceed with the API call
      return;
    }
    let chatLogNew = [...chatLog, { user: "user_name", message: `${input}` }];
    setInput("");
    setChatLog(chatLogNew);

    // Send only the latest question to the server
    const latestQuestion = { user: "user_name", message: input };

    try {
      const response = await fetch("http://localhost:3080/postai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: "001",
          unique_id: unique_id !== null ? unique_id : null, // Check if unique_id is not null
          question: latestQuestion,
        }),
      });

      const data = await response.json();
      console.log("Server response:", data);
      console.log("unique id :",data.id);
      console.log("Message:", data.message.Aianswer.aianswer);
      

      const updatedChatLog = [
        ...chatLogNew,
       {
          user: "gpt",
          message: `${data.message.Aianswer.aianswer}`,
          context: `${data.message.userContext}`,
          learnerLinks: data.message.learnerLinks,
        },
      ];
      // console.log("learners links inside response:",updatedChatLog.learnerLinks[0]);
      console.log("Updated chatLog:", updatedChatLog);
      console.log("internal message:", updatedChatLog[1].message);

      setSuggestedQuestion(data.message.similarQ)
      setChatLog(updatedChatLog);
      fetchChats();
      setUnique_id(data.id);
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

          
          <div className="side-menue-chatbutton">
            {/* Display previous chats as buttons */}
            {chats.map((chat) => (
              <button
                key={chat._id}
                className="chat-name"
                onClick={() => loadChatByChatName(chat.chat_id)}
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
              //value={input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleTabKeyPress}
              className="chat-input-textarea"
              placeholder={suggestedQuestion !== null ? suggestedQuestion : "Ask Studysage here"}
              ></input>
              <button
              className="chat-input-submit"
              type="submit"
            >
              Submit
            </button>

          </form>
        </div>
      </section>
    </div>
  );
}

// ...
const ChatMessage = ({ message }) => {

  const [showMore, setShowMore] = useState(false);

  // Function to toggle the "Show more/less" link
  const toggleShowMore = () => {
    setShowMore(!showMore);
  };
  // console.log("Message inside view",message);
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

            {/* {message.context && (
              
              <>
            <hr />
            <h4>Context of Question:</h4>
            <p>{message.context}</p> 
            </>
            )} */}
            {message.learnerLinks && (

<>
<div className="learner-links">
  <h4>Learner Links:</h4>
  <ul>
    {/* Display only the first 2 links initially */}
    {message.learnerLinks.slice(0, showMore ? undefined : 2).map((link, index) => (
      <li key={index}>
        <a href={link} target="_blank" rel="noopener noreferrer">
          {link}
        </a>
      </li>
    ))}
  </ul>
  {/* Show more/less link */}
  {message.learnerLinks.length > 2 && (
    <span className="show-more-less" onClick={toggleShowMore}>
      {showMore ? "Show less" : "Show more"}
    </span>
  )}
</div>
</>
            )}
              </div>  
          </>
          )}
          
          {message.user !== "gpt" && message.message}
          
        </div>
      </div>
    </div>
  );
};

export default AIChat;
