import "./App.css";
import PortScreenChoice from "./pages/PortScreenChoice";
import MenuPage from "./pages/MenuPage";
import PortDisplay from "./pages/PortDisplay";
import ChangeUpdatePage from "./pages/ChangeUpdatePage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PortScreenChoice />} />
        <Route path="/MenuPage" element={<MenuPage />} />
        <Route path="/PortDisplay/:portNr" element={<PortDisplay />} />
        <Route path="/ChangeUpdatePage" element={<ChangeUpdatePage />} />
      </Routes>
    </Router>
  );
}

export default App;
