import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout"; // Assuming you have this wrapping your pages
import Home from "./pages/Home";
import StartReview from "./pages/StartReview"; // Your new launchpad
import Search from "./pages/Search";           // Formerly NewReview
import ViewReview from "./pages/ViewReview";   // The actual editor

export default function App() {
  return (
    <Router>
      {/* Assuming Layout contains your Navbar/Footer */}
      <Layout>
        <Routes>
          {/* 1. The Entry Point */}
          <Route path="/" element={<Home />} />
          
          {/* 2. The Launchpad (New vs Resume) */}
          <Route path="/start" element={<StartReview />} />
          
          {/* 3. The iTunes API Search */}
          <Route path="/search" element={<Search />} />
          
          {/* 4. The Editor */}
          <Route path="/review/:id" element={<ViewReview />} />
        </Routes>
      </Layout>
    </Router>
  );
}