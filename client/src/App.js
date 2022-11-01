
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";

import Login from "./components/Login/Login";
import Home from "./components/Home/Home";
import About from "./components/About/About";
import AlertState from "./context/alerts/AlertState";
import URLState from "./context/url/URLState";
import Alert from "./components/Alert/Alert";
import Profile from "./components/Profile/Profile";
import Scanned from "./components/Scanned/Scanned";

function App() {
  return (
    <>
    <AlertState>
    <URLState>
      <Router>
        <Navbar />
        <Alert />
        <div className="container">
          <Routes>
            <Route exact path="/" element={<Home />}></Route>
            <Route exact path="/profile" element={<Profile/>}></Route>
            <Route path="/about" element={<About />}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/scanned" element={<Scanned />}></Route>
          </Routes>
        </div>
      </Router>
      </URLState>
      </AlertState>
    </>
  );
}

export default App;
