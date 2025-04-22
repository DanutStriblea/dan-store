import { useState } from "react";
import { useNavigate } from "react-router-dom";

const UserDetails = () => {
  const [user, setUser] = useState({
    firstName: "Nume",
    lastName: "Prenume",
    birthDate: "1990-01-01", // Formatul de dată pentru input de tip date
    phoneNumber: "123-456-7890",
    email: "user@example.com",
    password: "********",
  });

  const [isEditing, setIsEditing] = useState({
    firstName: false,
    lastName: false,
    birthDate: false,
    phoneNumber: false,
    email: false,
    password: false,
  });

  const [error, setError] = useState({
    email: "",
  });

  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1);
  };

  const handleEditClick = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
    if (name === "email") {
      validateEmail(value);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError((prev) => ({
        ...prev,
        email: "Formatul adresei de email este incorect",
      }));
    } else {
      setError((prev) => ({ ...prev, email: "" }));
    }
  };

  return (
    <div className="flex justify-center mt-6 p-3">
      <form className="relative bg-white p-6 rounded shadow-md w-full max-w-2xl">
        <button
          type="button"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={handleClose}
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">Datele Mele</h2>
        {Object.keys(user).map((field) => (
          <div className="mb-4 relative" key={field}>
            <label htmlFor={field} className="block text-gray-700">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            {isEditing[field] ? (
              field === "birthDate" ? (
                <div className="flex items-center">
                  <input
                    type="date"
                    id={field}
                    name={field}
                    value={user[field]}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded "
                  />
                  <button
                    type="button"
                    onClick={() => handleEditClick(field)}
                    className="ml-2 px-3 py-2 text-sky-600 hover:underline"
                  >
                    Confirmă
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    id={field}
                    name={field}
                    value={user[field]}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleEditClick(field)}
                    className="absolute inset-y-0 right-0 px-3 text-sky-600 hover:underline"
                  >
                    Confirmă
                  </button>
                </div>
              )
            ) : (
              <div className="relative flex items-center">
                <p className="w-full px-3 py-2 border rounded bg-gray-100">
                  {user[field]}
                </p>
                <button
                  type="button"
                  onClick={() => handleEditClick(field)}
                  className="absolute inset-y-0 right-0 px-3 text-sky-600 hover:underline"
                >
                  Modifică
                </button>
              </div>
            )}
            {field === "email" && error.email && (
              <p className="text-red-500 text-sm">{error.email}</p>
            )}
          </div>
        ))}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleClose}
            className="bg-sky-900 text-white py-2 px-4 rounded hover:bg-sky-800"
          >
            Anulează
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="bg-sky-900 text-white py-2 px-4 rounded hover:bg-sky-800"
          >
            Salvează
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserDetails;
