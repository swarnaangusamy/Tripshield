import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
export default function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />

        </Routes>
      </main>

      <Footer />
    </div>
  );
}
