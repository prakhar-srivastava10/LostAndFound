import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [editItem, setEditItem] = useState(null);
  const token = localStorage.getItem("token");
  const nav = useNavigate();
  const userId = JSON.parse(atob(token.split(".")[1])).id;
  const [filter, setFilter] = useState("All");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");

  const headers = { authorization: token };

const fetchItems = async () => {
  const res = await axios.get("https://lostandfound-ozmi.onrender.com/api/items", {
    headers: { authorization: token }
  });

  setItems(res.data);
};
  useEffect(() => {
    if (!token) nav("/login");
    fetchItems();
  }, []);

  const addItem = async (e) => {
    e.preventDefault();
    await axios.post("https://lostandfound-ozmi.onrender.com/api/items", form, { headers });
    fetchItems();
  };


  const deleteItem = async (id) => {
    await axios.delete(`https://lostandfound-ozmi.onrender.com/api/items/${id}`, { headers });
    fetchItems();
  };

const searchItem = async () => {
  if (!search.trim()) return fetchItems();

  try {
    const res = await axios.get(
      `https://lostandfound-ozmi.onrender.com/api/items/search?name=${encodeURIComponent(search)}`,
      {
        headers: {
          authorization: token
        }
      }
    );

    setItems(res.data);
  } catch (err) {
    console.log(err.response?.data || err.message); // 👈 see real error
    alert("Search failed");
  }
};

  const logout = () => {
    localStorage.removeItem("token");
    nav("/login");
  };

  const filteredItems =
  filter === "All"
    ? items
    : items.filter((i) => i.type === filter);

    const updateItem = async () => {
  try {
    await axios.put(
      `https://lostandfound-ozmi.onrender.com/api/items/${editItem._id}`,
      editItem,
      { headers }
    );

    setEditItem(null);
    fetchItems();
  } catch (err) {
    alert("Update failed");
  }
};

return (
  <div className="app">

    {/* SIDEBAR */}
    <div className="sidebar">
      <h2>Lost & Found</h2>
      <p style={{ fontSize: "12px", opacity: 0.7 }}>
        College Portal
      </p>

<button onClick={() => setFilter("All")}>All Items</button>
<button onClick={() => setFilter("Lost")}>Lost Items</button>
<button onClick={() => setFilter("Found")}>Found Items</button>
      <button className="logout" onClick={logout}>Logout</button>
    </div>

    {/* MAIN CONTENT */}
    <div className="main">

      {/* TOP BAR */}
      <div className="topbar">
        <h2>Dashboard</h2>
      </div>

      {/* SEARCH */}
      <div className="searchBox">
        <input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={searchItem}>Search</button>
      </div>

      {/* ADD ITEM */}
      <h3>Add New Item</h3>

      <input placeholder="Item Name"
        onChange={e => setForm({ ...form, itemName: e.target.value })} />

      <input placeholder="Description"
        onChange={e => setForm({ ...form, description: e.target.value })} />

      <input placeholder="Type (Lost / Found)"
        onChange={e => setForm({ ...form, type: e.target.value })} />

      <input placeholder="Location"
        onChange={e => setForm({ ...form, location: e.target.value })} />

      <input placeholder="Contact Info"
        onChange={e => setForm({ ...form, contactInfo: e.target.value })} />

      <button onClick={addItem}>Add Item</button>
{editItem && (
  <div className="card">
    <h3>Edit Item</h3>

    <input
      value={editItem.itemName}
      onChange={(e) =>
        setEditItem({ ...editItem, itemName: e.target.value })
      }
    />

    <input
      value={editItem.description}
      onChange={(e) =>
        setEditItem({ ...editItem, description: e.target.value })
      }
    />

    <input
      value={editItem.type}
      onChange={(e) =>
        setEditItem({ ...editItem, type: e.target.value })
      }
    />

    <input
      value={editItem.location}
      onChange={(e) =>
        setEditItem({ ...editItem, location: e.target.value })
      }
    />

    <button onClick={updateItem}>Save</button>
    <button onClick={() => setEditItem(null)}>Cancel</button>
  </div>
)}
      {/* ITEMS */}
      <h3 style={{ marginTop: "20px" }}>All Items</h3>

      {filteredItems.map((i) => (
        <div className="card" key={i._id}>
          <b>{i.itemName}</b>
          <p>{i.description}</p>
          <p>Type: {i.type}</p>
          <p>Location: {i.location}</p>
{i.userId === userId && (
  <button
    style={{ background: "#3b82f6", marginRight: "5px" }}
    onClick={() => setEditItem(i)}
  >
    Update
  </button>
)}
          {i.userId === userId && (
          <button style={{ background: "#ef4444", marginTop: "5px" }} onClick={() => deleteItem(i._id)}>Delete</button>


)}
        </div>
      ))}

    </div>
  </div>
);
}