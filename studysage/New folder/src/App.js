import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AIChat from './AIChat';
import PdfConversation from './PdfConversation';

const App = () => {
  return (
    <Router>
      <div>
        <h3>Studysage</h3>
        <nav>
        <Link to="/aichat">Open AI Chat</Link>
        <Link to="/pdf">Open pdf</Link>

        </nav>

        <Routes>
          <Route path="/aichat" element={<AIChat />} />
        </Routes>
        <Routes>
          <Route path="/pdf" element={<PdfConversation />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;


// App.js
// import React from 'react';
// import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
// import FileUpload from './FileUpload';

// const Home = () => (
//   <div>
//     <h2>Home</h2>
//     <p>Welcome to the PDF Upload App!</p>
//   </div>
// );

// const App = () => (
//   <Router>
//     <div>
//       <nav>
//         <ul>
//           <li>
//             <Link to="/">Home</Link>
//           </li>
//           <li>
//             <Link to="/upload">File Upload</Link>
//           </li>
//         </ul>
//       </nav>

//       <hr />

//       <Switch>
//         <Route exact path="/" component={Home} />
//         <Route path="/upload" component={FileUpload} />
//       </Switch>
//     </div>
//   </Router>
// );

// export default App;

