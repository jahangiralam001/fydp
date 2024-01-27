  async function loadChatByChatName(chatName) {
    try {
      const response = await fetch(
        //  Edit chatName to be the unique id of the chat.
        `http://localhost:3080/chats/001/${encodeURIComponent(chatName)}`
      );
      const data = await response.json();
      console.info("loaded chat:", data);

      if (data.success && data.chats.length > 0) {
        const selectedChat = data.chats[0];
        setSelectedChat(selectedChat);

        // Log the structure of selected chat
        console.log("selectedChat:", selectedChat);

        // Extract and flatten all conversations
        const allConversations = Object.entries(selectedChat)
          .filter(([key, value]) => key.startsWith("conversation"))
          .flatMap(([key, value]) => value);

        // Log the structure of all conversations
        console.log("allConversations:", allConversations);

        // Set the chat log with all conversations
        setChatLog(allConversations);

        // Update the chatName state when a chat is loaded
        setChatName(chatName || selectedChat.chat_name); // Use selectedChat.chat_name as default
      } else {
        console.error("Error loading previous chats:", data.message);
      }
    } catch (error) {
      console.error("Error loading previous chats:", error);
    }
  }


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
              {message.message !== "" ? (
              <>
              <h4>AI Answer:</h4>
              <p>{message.message}</p>
              </>
               ) : (
                <>
              <h4>AI Answer:</h4>
              <p>{message.message.Aianswer.aianswer}</p>
              </>
               )}
            </>
          //   <>
          //   <h4>AI Answer:</h4>
          //   <p>{message.message}</p>
          //   { <hr />
          //   <h4>Context of Question:</h4>
          //     <p>{message.context}</p> }

              
              
                
          // </>
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