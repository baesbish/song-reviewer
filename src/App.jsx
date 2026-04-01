import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import StartReview from "./pages/StartReview";
import Search from "./pages/Search";
import ViewReview from "./pages/ViewReview";
import Archive from "./pages/Archive"; // Added import

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/start" element={<StartReview />} />
          <Route path="/search" element={<Search />} />
          <Route path="/review/:id" element={<ViewReview />} />
          <Route path="/archive" element={<Archive />} />
        </Route>
      </Routes>
    </Router>
  );
}