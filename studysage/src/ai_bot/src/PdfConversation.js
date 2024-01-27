// Import necessary React components and CSS
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./pdf.css";

function PdfConversation() {
  const [isPdfUploaderVisible, setIsPdfUploaderVisible] = useState(true);
  const [uploadedPdf, setUploadedPdf] = useState(null);
  const [file, setFile] = useState(null);
  const [chatName, setchatName] = useState(null);
  const [newChatName, setnewChatName] = useState(null);
  const [pdfAnswer, setpdfAnswer] = useState(null);
  const [input, setInput] = useState("");
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [directories, setDirectories] = useState([]);
  const chatBoxRef = useRef(null);
  const [userId, setUserId] = useState(null); 

  useEffect(() => {
    fetch('http://localhost:3070/api/getStudentId', {
  credentials: 'include'  // Include credentials (cookies, authorization headers, etc.)
})
      .then(response => {
        console.log("Raw Response: ", response); // Log the raw response
        return response.json();
      })
      .then(data => {
        console.log("Fetched Data: ", data); // Log the fetched data
        setUserId(data.student_id); // Set the fetched student_id
        console.log("Setting userId to: ", data.student_id); // Log the value being set
      })
      .catch(error => {
        console.error('Error fetching student ID:', error);
      });
  }, []);
  
  // Add this useEffect to monitor changes to userId
  useEffect(() => {
    console.log("Updated userId: ", userId);
  }, [userId]);
  
  // Logic to run when chatHistory changes
  useEffect(() => {
    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    get_directories();
    // Any other logic that should run when chatHistory changes
  }, [chatHistory]); // This will run every time chatHistory changes

  const togglePdfUploader = () => {
    setIsPdfUploaderVisible(!isPdfUploaderVisible);
  };




  const fetchData = async () => {
    try {
      console.log("fetching data");
      const response = await fetch(`http://localhost:8000/internal_chats/${encodeURIComponent(userId)}/${encodeURIComponent(chatName)}`);
      const data = await response.json();

      if (data.success) {
        const fetchedChats = data.chats;

      // Format the fetched chats and update chatHistory
      const formattedChats = fetchedChats.map((chat) => {
        const chatEntries = [];
        for (let i = 0; i < chat.questions.length; i++) {
          chatEntries.push({ type: "user", text: chat.questions[i] });
          chatEntries.push({ type: "pdfAnswer", text: chat.answers[i] });
        }
        return chatEntries;
      }).flat();

      setChatHistory(formattedChats);
      } else {
        console.error('Error fetching internal chats:', data.error);
      }
    } catch (error) {
      console.error('Error fetching internal chats:', error);
    } 
  }




  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (
          typeof e.target.result === "string" &&
          e.target.result.startsWith("data:application/pdf")
        ) {
          setUploadedPdf(e.target.result);
        } else {
          console.error("Invalid PDF file");
        }
      };

      reader.readAsDataURL(selectedFile);
    }
  };

  const querypdf = async (chatName, question) => {
    if (userId === null) {
      console.error("User ID is not set");
      return;
    }
    try {
      setInput(question);
      console.log("chat name:", chatName);

      const newChatHistory = [...chatHistory, { type: "user", text: question }];
      setChatHistory(newChatHistory);

      const response = await fetch(
        `http://localhost:8000/chats/${encodeURIComponent(
          userId
        )}/${encodeURIComponent(
          chatName
        )}/${encodeURIComponent(question)}`
      );

      const data = await response.json();
      console.log("response from server: ", data.chats);

      if (data.success) {
        const updatedChatHistory = [
          ...newChatHistory,
          { type: "pdfAnswer", text: data.chats },
        ];
        setChatHistory(updatedChatHistory);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  async function get_directories() {
    try {
      const response = await fetch("http://localhost:8000/directories");
      const data = await response.json();

      if (data.success) {
        const directories = data.directories;
        console.log("Directories:", directories);
        setDirectories(directories); // Update state with directories
      } else {
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  const handleFileUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await axios.post(
        "http://localhost:8000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setnewChatName(response.data.chats);
      }
    } catch (error) {
      console.error("Error uploading file:", error.message);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];

    setFile(droppedFile);

    if (droppedFile) {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (
          typeof e.target.result === "string" &&
          e.target.result.startsWith("data:application/pdf")
        ) {
          setUploadedPdf(e.target.result);
        } else {
          console.error("Invalid PDF file");
        }
      };

      reader.readAsDataURL(droppedFile);
    }
  };

  return (
    <div
      className="app-container"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className={`pdf-uploader ${isPdfUploaderVisible ? 'visible' : 'hidden'}`}>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div
        className="dropbox"
        onClick={() => {
          setIsPdfUploaderVisible(true);
          document.querySelector('input[type="file"]').click();
        }}
      >
        <p>Drag & Drop PDF or click here to upload</p>
      </div>
      {uploadedPdf && (
        <div className="pdf-preview">
          <embed src={uploadedPdf} type="application/pdf" width="95%" height="550px" />
        </div>
      )}
      <button onClick={handleFileUpload}>Upload PDF</button>
    </div>
      <div className="chat-container">
        <div className="side-menu">
          <button
            className="toggle-pdf-uploader-btn"
            onClick={togglePdfUploader}
          >
            {isPdfUploaderVisible ? "Hide PDF Uploader" : "Show PDF Uploader"}
          </button>
          {newChatName && (
            <button onClick={() => {setchatName(newChatName); fetchData();}}>
              {newChatName}
            </button>
          )}
          {/* <button onClick={get_directories}> Courses </button> */}
          <button className="refresh" onClick={get_directories}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>

          {/* Render buttons dynamically based on directories */}
          {directories.map((dir, index) => (
  <button key={index} onClick={() => { setchatName(`./courses/${dir}`); fetchData(); }}>
  {dir}
            </button>
          ))}
        </div>

        <div
          className={`chat-box ${
            isPdfUploaderVisible ? "with-pdf-uploader" : "without-pdf-uploader"
          }`}
        >
          <div className="chat-area" ref={chatBoxRef}>
            {chatHistory.map((chat, index) => (
              <div key={index} className={chat.type}>
                {chat.text}
              </div>
            ))}
          </div>
          <div className="chat-input-holder">
            <input
              row="1"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="chat-input-textarea"
              placeholder="Query pdf here"
            />
            <button
              className="chat-input-submit"
              onClick={(e) => {
                e.preventDefault();
                querypdf(chatName, question);
                setQuestion(""); // Clear the input field after submission
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PdfConversation;
