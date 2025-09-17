import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const navigate = useNavigate();

  function addContact() {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No auth token found");
      return;
    }

    fetch("http://localhost:3000/api/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ firstName, lastName, phone }),
    })
      .then(async (res) => {
        if (res.status === 401) {
          console.error("Unauthorized when adding contact");
          return Promise.reject(new Error("Unauthorized"));
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to add contact");
        }
        return res.json();
      })
      .then((created) => {
        setContacts((prev) => [...prev, created]);
        setFirstName("");
        setLastName("");
        setPhone("");
      })
      .catch((err) => {
        console.error("Error adding contact:", err);
      });
  }

  function deleteContact(id) {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No auth token found");
      return;
    }

    fetch(`http://localhost:3000/api/contacts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setContacts(function (previousContacts) {
          const updatedContacts = previousContacts.filter(function (contact) {
            return contact._id !== id;
          });
          return updatedContacts;
        });
      })
      .catch((err) => {
        console.error("Error deleting contact:", err);
      });
  }

  function updateContacts(id, updatedContact) {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No auth token found");
      return;
    }

    return fetch(`http://localhost:3000/api/contacts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedContact),
    })
      .then(async (res) => {
        if (res.status === 401) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Unauthorized");
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Failed to update contact");
        }
        return res.json();
      })
      .then((updated) => {
        setContacts((prev) =>
          prev.map((contact) => (contact._id === id ? updated : contact))
        );
      })
      .catch((err) => {
        console.error("Error updating contact:", err);
        throw err;
      });
  }

  function startEdit(contact) {
    setEditingId(contact._id);
    setEditFirstName(contact.firstName || "");
    setEditLastName(contact.lastName || "");
    setEditPhone(contact.phone || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditFirstName("");
    setEditLastName("");
    setEditPhone("");
  }

  function saveEdit() {
    if (!editingId) return;
    const payload = {
      firstName: editFirstName,
      lastName: editLastName,
      phone: editPhone,
    };
    updateContacts(editingId, payload)
      .then(() => {
        cancelEdit();
      })
      .catch((err) => {
        console.error("Failed to save contact:", err);
      });
  }

  function logout() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:3000/api/contacts", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (res.status === 401) {
            console.error("Unauthorized when fetching contacts");
            const body = await res.json().catch(() => ({}));
            throw new Error(body.message || "Unauthorized");
          }
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.message || "Failed to fetch contacts");
          }
          return res.json();
        })
        .then((data) => {
          console.log("Contacts data:", data);
          setContacts(data);
        })
        .catch((err) => {
          console.error("Error fetching contacts:", err);
        });
    }
  }, []);

  return (
    <div>
      <Header />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Contacts</h2>
      </div>
      {contacts.length === 0 ? (
        <p>No contacts found.</p>
      ) : (
        <ul>
          {contacts.map((contact) => (
            <li key={contact._id}>
              {editingId === contact._id ? (
                <div>
                  <div>
                    <label htmlFor={`edit-first-${contact._id}`}>First Name</label>
                    <br />
                    <input
                      id={`edit-first-${contact._id}`}
                      type="text"
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      autoComplete="given-name"
                    />
                  </div>
                  <div>
                    <label htmlFor={`edit-last-${contact._id}`}>Last Name</label>
                    <br />
                    <input
                      id={`edit-last-${contact._id}`}
                      type="text"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      autoComplete="family-name"
                    />
                  </div>
                  <div>
                    <label htmlFor={`edit-phone-${contact._id}`}>Phone</label>
                    <br />
                    <input
                      id={`edit-phone-${contact._id}`}
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      autoComplete="tel"
                    />
                  </div>
                  <button type="button" onClick={saveEdit} aria-label="Save contact">
                    Save
                  </button>
                  <button type="button" onClick={cancelEdit} aria-label="Cancel edit">
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  {contact.firstName} {contact.lastName} - {contact.phone}{" "}
                  <button
                    type="button"
                    onClick={() => startEdit(contact)}
                    aria-label={`Edit ${contact.firstName} ${contact.lastName}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteContact(contact._id)}
                    aria-label={`Remove ${contact.firstName} ${contact.lastName}`}
                  >
                    Remove
                  </button>
                </div>
              )}
              </li>
          ))}
        </ul>
      )}
      <div>
        <h3>Add Contact</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addContact();
          }}
        >
          <div>
            <label htmlFor="firstName">First Name</label>
            <br />
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
            />
          </div>
          <div>
            <label htmlFor="lastName">Last Name</label>
            <br />
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoComplete="family-name"
            />
          </div>
          <div>
            <label htmlFor="phone">Phone</label>
            <br />
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
            />
          </div>
          <button type="submit">Add Contact</button>
        </form>
      </div>
      <button type="button" onClick={logout} aria-label="Log out">
          Logout
        </button>
    </div>
  );
}

export default Contacts;
