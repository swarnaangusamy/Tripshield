import React, { useState } from "react";
import { motion } from "framer-motion";
import "./registration.css";

export default function Register() {
  const [personal, setPersonal] = useState({
    name: "",
    username: "",
    phone: "",
    email: "",
    dob: "",
    blood: "",
    password: "",
    confirmPassword: "",
  });

  const [contacts, setContacts] = useState([
    { name: "", phone: "", relation: "", email: "", address: "" },
  ]);

  const [errors, setErrors] = useState({});

  // Handle Personal Inputs
  const handlePersonalChange = (e) => {
    setPersonal({ ...personal, [e.target.name]: e.target.value });
  };

  // Handle Contact Inputs
  const handleContactChange = (i, e) => {
    const list = [...contacts];
    list[i][e.target.name] = e.target.value;
    setContacts(list);
  };

  // VALIDATION
  const validate = () => {
    const newErrors = {};

    if (!personal.name) newErrors.name = "Name is required";
    if (!personal.username) newErrors.username = "Username is required";
    if (!personal.phone || personal.phone.length !== 10)
      newErrors.phone = "Phone must be 10 digits";
    if (!personal.email.includes("@"))
      newErrors.email = "Enter a valid email";

    if (!personal.password || personal.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (personal.password !== personal.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    contacts.forEach((c, index) => {
      if (!c.name) newErrors[`cname${index}`] = "Required";
      if (!c.phone || c.phone.length !== 10)
        newErrors[`cphone${index}`] = "Phone must be 10 digits";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT FORM
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      ...personal,
      contacts: contacts,
    };

    const response = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log(result);
    alert("Registered Successfully!");
  };

  const addNewContact = () => {
    setContacts([
      ...contacts,
      { name: "", phone: "", relation: "", email: "", address: "" },
    ]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="page-container"
    >
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="title"
      >
        TRIPSHIELD
      </motion.h1>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="form-card"
      >
        <h2 className="section-title">Registration</h2>

        {/* PERSONAL INFO SECTION */}
        <div className="box-section">
          <div className="input-grid">
            {[
              ["Name", "name"],
              ["Username", "username"],
              ["Phone Number", "phone"],
              ["Email Id", "email"],
              ["DOB", "dob"],
              ["Blood Group", "blood"],
              ["Password", "password"],
              ["Confirm Password", "confirmPassword"],
            ].map(([label, field]) => (
              <label key={field} className="input-label">
                {label}
                <input
                  className="input-box"
                  type={
                    field === "dob"
                      ? "date"
                      : field.includes("password")
                      ? "password"
                      : "text"
                  }
                  name={field}
                  value={personal[field]}
                  onChange={handlePersonalChange}
                />
                {errors[field] && (
                  <span className="error-text">{errors[field]}</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* EMERGENCY CONTACTS */}
        <h3 className="section-subtitle">Emergency Contacts</h3>

        {contacts.map((c, i) => (
          <motion.div
            key={i}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="box-section"
          >
            {[
              ["Name", "name"],
              ["Phone Number", "phone"],
              ["Relationship", "relation"],
              ["Email Id", "email"],
              ["Address", "address"],
            ].map(([label, field]) => (
              <label key={field} className="input-label">
                {label}
                <input
                  className="input-box"
                  type="text"
                  name={field}
                  value={c[field]}
                  onChange={(e) => handleContactChange(i, e)}
                />
                {errors[`c${field}${i}`] && (
                  <span className="error-text">
                    {errors[`c${field}${i}`]}
                  </span>
                )}
              </label>
            ))}
          </motion.div>
        ))}

        <div className="button-container">
          <button type="submit" className="btn primary" onClick={handleSubmit}>
            Submit
          </button>
          <button className="btn secondary" onClick={addNewContact}>
            Add New
          </button>
        </div>
      </motion.div>

      <p className="footer">© Copyright</p>
    </motion.div>
  );
}
