import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Thread from './Components/pages/Thread';
import Fragment from "./Components/pages/Fragment";
import About from "./Components/pages/About";
import Code from "./Components/pages/Code";
import CodeBook from "./Components/pages/CodeBook";

function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CodeBook />}/>
          <Route path="/codes" element={<CodeBook />} />
          <Route path="/codes/:id" element={<Code />} />
          <Route path="/about" element={<About />} />
          <Route path="/fragment/:id" element={<Fragment />} />
          <Route path="/post/:id" element={<Thread />} />
          <Route path="*" element={() => <>No Page | 404</>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
