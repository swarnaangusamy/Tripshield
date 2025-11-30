import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();

  // ----------------------
  // USER DETAILS STATE
  // ----------------------
  const [user, setUser] = useState({
    name: "",
    phone: "",
    email: "",
    dob: "",
    blood: "",
    password: ""
  });

  // ----------------------
  // EMERGENCY CONTACTS (multiple)
  // ----------------------
  const [contacts, setContacts] = useState([
    { cname: "", cphone: "", relation: "", cemail: "", caddress: "" }
  ]);

  // ----------------------
  // LIVE ERROR STATE
  // ----------------------
  const [errors, setErrors] = useState({ userErrors: {}, contactErrors: [] });

  // ----------------------
  // INLINE VALIDATION FUNCTIONS
  // ----------------------
  const validateUserField = (field, value) => {
    const newErrors = { ...errors.userErrors };

    switch (field) {
      case "name":
        newErrors.name = value.trim() ? "" : "Name is required.";
        break;
      case "phone":
        newErrors.phone = /^[6-9]\d{9}$/.test(value)
          ? ""
          : "Enter valid 10-digit phone.";
        break;
      case "email":
        newErrors.email = value.includes("@") ? "" : "Invalid email.";
        break;
      case "password":
        newErrors.password =
          value.length >= 6 ? "" : "Password must be at least 6 characters.";
        break;
      case "dob":
        newErrors.dob = value ? "" : "DOB required.";
        break;
      case "blood":
        newErrors.blood = value ? "" : "Select blood group.";
        break;
      default:
        break;
    }

    setErrors({ ...errors, userErrors: newErrors });
  };

  const validateContactField = (index, field, value) => {
    const newContactErrors = [...errors.contactErrors];

    if (!newContactErrors[index]) {
      newContactErrors[index] = {};
    }

    switch (field) {
      case "cname":
        newContactErrors[index].cname = value.trim()
          ? ""
          : "Emergency contact name required.";
        break;

      case "cphone":
        newContactErrors[index].cphone = /^[6-9]\d{9}$/.test(value)
          ? ""
          : "Enter valid phone.";
        break;

      case "relation":
        newContactErrors[index].relation = value.trim()
          ? ""
          : "Relationship required.";
        break;

      case "cemail":
        newContactErrors[index].cemail = value.includes("@")
          ? ""
          : "Invalid email.";
        break;

      case "caddress":
        newContactErrors[index].caddress = value.trim()
          ? ""
          : "Address required.";
        break;

      default:
        break;
    }

    setErrors({ ...errors, contactErrors: newContactErrors });
  };

  // ---------------------
  // HANDLE INPUT CHANGES
  // ---------------------
  const handleUserChange = (field, value) => {
    setUser({ ...user, [field]: value });
    validateUserField(field, value);
  };

  const handleContactChange = (index, field, value) => {
    const updatedContacts = [...contacts];
    updatedContacts[index][field] = value;
    setContacts(updatedContacts);

    validateContactField(index, field, value);
  };

  // ---------------------
  // ADD ANOTHER CONTACT
  // ---------------------
  const addNewContact = () => {
    setContacts([
      ...contacts,
      { cname: "", cphone: "", relation: "", cemail: "", caddress: "" },
    ]);
  };

  // ---------------------
  // FINAL SUBMIT
  // ---------------------

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!allValid) {
    alert("Please fix all errors before submitting.");
    return;
  }

  const payload = {
    ...user,
    emergencyContacts: contacts,
  };

  try {
    const res = await axios.post("http://localhost:3000/api/auth/register", payload);

    if (res.data.success) {
      alert("Registration Successful!");
      window.location.href = "/login";  // redirect to login
    }
  } catch (error) {
    console.error(error);
    alert("Error registering user. Check console.");
  }
};

  // ---------------------
  // RESET ALL
  // ---------------------
  const handleReset = () => {
    setUser({
      name: "",
      phone: "",
      email: "",
      dob: "",
      blood: "",
      password: "",
    });

    setContacts([
      { cname: "", cphone: "", relation: "", cemail: "", caddress: "" },
    ]);

    setErrors({ userErrors: {}, contactErrors: [] });
  };

  return (
    <div className="container py-4">
      <div className="glass p-4 rounded shadow">
        
        <h2 className="text-peacock fw-bold text-center mb-4">
          Create Your TripShield Account
        </h2>

        <form onSubmit={handleSubmit}>

          {/* ------------------------------------
              USER DETAILS SECTION
              ------------------------------------ */}
          <h4 className="text-tealcustom fw-semibold mb-3">User Details</h4>

          <div className="row g-3">

            <div className="col-md-6">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={user.name}
                onChange={(e) => handleUserChange("name", e.target.value)}
              />
              {errors.userErrors.name && (
                <small className="text-danger">{errors.userErrors.name}</small>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-control"
                value={user.phone}
                onChange={(e) => handleUserChange("phone", e.target.value)}
              />
              {errors.userErrors.phone && (
                <small className="text-danger">{errors.userErrors.phone}</small>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={user.email}
                onChange={(e) => handleUserChange("email", e.target.value)}
              />
              {errors.userErrors.email && (
                <small className="text-danger">{errors.userErrors.email}</small>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-control"
                value={user.dob}
                onChange={(e) => handleUserChange("dob", e.target.value)}
              />
              {errors.userErrors.dob && (
                <small className="text-danger">{errors.userErrors.dob}</small>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">Blood Group</label>
              <select
                className="form-select"
                value={user.blood}
                onChange={(e) => handleUserChange("blood", e.target.value)}
              >
                <option value="">Choose...</option>
                <option>A+</option><option>A-</option>
                <option>B+</option><option>B-</option>
                <option>O+</option><option>O-</option>
                <option>AB+</option><option>AB-</option>
              </select>
              {errors.userErrors.blood && (
                <small className="text-danger">{errors.userErrors.blood}</small>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={user.password}
                onChange={(e) => handleUserChange("password", e.target.value)}
              />
              {errors.userErrors.password && (
                <small className="text-danger">{errors.userErrors.password}</small>
              )}
            </div>

          </div>

          <hr className="my-4" />

          {/* ------------------------------------
              EMERGENCY CONTACTS (DYNAMIC)
              ------------------------------------ */}
          <h4 className="text-tealcustom fw-semibold mb-3">
            Emergency Contact Details
          </h4>

          {contacts.map((c, index) => (
            <div key={index} className="border rounded p-3 mb-3">

              <h5 className="fw-bold text-peacock">
                Contact {index + 1}
              </h5>

              <div className="row g-3 mt-2">

                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={c.cname}
                    onChange={(e) =>
                      handleContactChange(index, "cname", e.target.value)
                    }
                  />
                  {errors.contactErrors[index]?.cname && (
                    <small className="text-danger">
                      {errors.contactErrors[index].cname}
                    </small>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={c.cphone}
                    onChange={(e) =>
                      handleContactChange(index, "cphone", e.target.value)
                    }
                  />
                  {errors.contactErrors[index]?.cphone && (
                    <small className="text-danger">
                      {errors.contactErrors[index].cphone}
                    </small>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Relationship</label>
                  <input
                    type="text"
                    className="form-control"
                    value={c.relation}
                    onChange={(e) =>
                      handleContactChange(index, "relation", e.target.value)
                    }
                  />
                  {errors.contactErrors[index]?.relation && (
                    <small className="text-danger">
                      {errors.contactErrors[index].relation}
                    </small>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={c.cemail}
                    onChange={(e) =>
                      handleContactChange(index, "cemail", e.target.value)
                    }
                  />
                  {errors.contactErrors[index]?.cemail && (
                    <small className="text-danger">
                      {errors.contactErrors[index].cemail}
                    </small>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={c.caddress}
                    onChange={(e) =>
                      handleContactChange(index, "caddress", e.target.value)
                    }
                  ></textarea>
                  {errors.contactErrors[index]?.caddress && (
                    <small className="text-danger">
                      {errors.contactErrors[index].caddress}
                    </small>
                  )}
                </div>

              </div>

            </div>
          ))}

          {/* Add Contact Button */}
          <button
            type="button"
            className="btn btn-outline-peacock mb-3"
            style={{ borderColor: "#046D63", color: "#046D63" }}
            onClick={addNewContact}
          >
            + Add Another Contact
          </button>

          {/* FINAL BUTTONS */}
          <div className="d-flex justify-content-between mt-4">
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Reset
            </button>

            <button type="button" className="btn btn-success">
              Submit All
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
