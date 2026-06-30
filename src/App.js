import "./App.css";
import PortScreenChoice from "./pages/PortScreenChoice";
import Home from "./pages/Home";
import PortDisplay from "./pages/PortDisplay";
import PortEditPage from "./pages/PortEditPage";
import SpecialenEditPage from "./pages/SpecialenEditPage";
import TorgetEditPage from "./pages/TorgetEditPage";

import TorgetDisplay from "./pages/TorgetDisplay";
import SpecialenDisplay from "./pages/SpecialenDisplay";


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PortScreenChoice />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/PortDisplay/:portNr" element={<PortDisplay />} />
        <Route path="/PortEditPage" element={<PortEditPage />} />
        <Route path="/PortScreenChoice" element={<PortScreenChoice />} />
        <Route path="/SpecialenEditPage" element={<SpecialenEditPage />} />
        <Route path="/TorgetEditPage" element={<TorgetEditPage />} />

        <Route path="/TorgetDisplay" element={<TorgetDisplay />} />
        <Route path="/SpecialenDisplay" element={<SpecialenDisplay />} />
      </Routes>
    </Router>
  );
}

export default App;
