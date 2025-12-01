import 'bootstrap/dist/css/bootstrap.min.css';
import 'aos/dist/aos.css'; // if using AOS
import './index.css';                        

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

//  Toastify imports
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
    {/*  Toast container for global notifications */}
    <ToastContainer position="top-right" theme="colored" autoClose={2000} />
  </BrowserRouter>
);