import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddProduct.css";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";

const AddProduct = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    category: "",
    price: "",
    discountPrice: "",
    material: "",
    color: "",
    type: "",
    description: "",
    quantity: "",
    isAvailable: true,
    mainImage: null,
    subImages: [null, null, null, null],
  });

  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const recordsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const categories = [
    "Sofas Sets", "Bean Bags", "Chairs", "Shoe Racks", "Bedroom Sets",
    "Study Table", "Dining Sets", "Wardrobes", "BookShelf"
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let updatedValue = type === "number" ? Number(value) : value;
  
    let updatedProduct = {
      ...product,
      [name]: updatedValue,
    };
  
    if (name === "quantity") {
      updatedProduct.isAvailable = updatedValue >= 1;
    }
  
    setProduct(updatedProduct);
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (e.target.name === "mainImage") {
      setProduct({ ...product, mainImage: file });
    } else {
      const updatedSubImages = [...product.subImages];
      updatedSubImages[index] = file;
      setProduct({ ...product, subImages: updatedSubImages });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      Object.keys(product).forEach((key) => {
        if (key !== "subImages" && key !== "mainImage") {
          formData.append(key, product[key]);
        }
      });

      formData.append("isAvailable", product.isAvailable ? "true" : "false");

      if (product.mainImage) {
        formData.append("mainImage", product.mainImage);
      }
      product.subImages.forEach((image) => {
        if (image) {
          formData.append("subImages", image);
        }
      });

      if (editingProductId) {
        await axios.put(`http://localhost:5000/update-product/${editingProductId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Product updated successfully");
        setEditingProductId(null);
      } else {
        await axios.post("http://localhost:5000/add-product", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Product added successfully");
      }

      setProduct({
        name: "", category: "", price: "", discountPrice: "", material: "",
        color: "", type: "", description: "", isAvailable: true,
        mainImage: null, subImages: [null, null, null, null],
      });

      fetchProducts();
      setShowAddForm(false);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    }
  };

  const handleEdit = (product) => {
    setEditingProductId(product._id);
    setProduct({
      name: product.name,
      category: product.category,
      price: product.price,
      discountPrice: product.discountPrice,
      material: product.material,
      color: product.color,
      type: product.type,
      quantity: product.quantity,
      description: product.description,
      isAvailable: product.isAvailable,
      mainImage: null,
      subImages: [null, null, null, null],
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`http://localhost:5000/delete-product/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          alert("Product deleted successfully!");
          fetchProducts();
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Failed to delete product");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product");
      }
    }
  };

  const handleView = async (product) => {
    try {
      const res = await axios.get(`http://localhost:5000/products/${product._id}`);
      setSelectedProduct(res.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching product details:", error);
      alert("Could not fetch full product details.");
    }
  };

  const handleToggleAvailability = async (productId, currentStatus) => {
    try {
      await axios.patch(`http://localhost:5000/update-availability/${productId}`, {
        isAvailable: !currentStatus,
      });
  
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId
            ? { ...product, isAvailable: !currentStatus }
            : product
        )
      );
    } catch (error) {
      console.error("Error toggling availability:", error);
    }
  };

  // Filter and pagination logic
  const filteredData = products.filter((product) => {
    const matchesName = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesName && matchesCategory;
  });
  
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const paginatedProducts = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="addProduct">
      {/* Mobile Add Button */}
      <button className="mobile-add-button" onClick={() => setShowAddForm(true)}>
        <Plus size={24} />
      </button>

      {/* Form Popup */}
      {showAddForm && (
        <div className="form-popup show">
          <div className="form-popup-content">
            <button className="close-popup" onClick={() => {
              setShowAddForm(false);
              setEditingProductId(null);
            }}>×</button>
            <h2>{editingProductId ? "Edit Product" : "Add New Product"}</h2>
            <form className="add-product-form" onSubmit={handleSubmit}>
              <input type="text" name="name" value={product.name} onChange={handleChange} placeholder="Product Name" required />
              <select name="category" value={product.category} onChange={handleChange} required>
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input type="number" name="price" value={product.price} onChange={handleChange} placeholder="Price (₹)" required />
              <input type="number" name="discountPrice" value={product.discountPrice} onChange={handleChange} placeholder="Discount Price (₹)" />
              <input type="text" name="material" value={product.material} onChange={handleChange} placeholder="Material" required />
              <input type="text" name="color" value={product.color} onChange={handleChange} placeholder="Color" required />
              <input type="text" name="type" value={product.type} onChange={handleChange} placeholder="Type" required />
              <input
                type="text"
                name="quantity"
                value={product.quantity}
                onChange={handleChange}
                placeholder="Quantity"
                required
              />
              <textarea name="description" value={product.description} onChange={handleChange} placeholder="Description" required></textarea>
              <label>Main Product Image:</label>
              <input type="file" name="mainImage" accept="image/*" onChange={handleImageChange} />
              <label>Sub Images:</label>
              {[0, 1, 2, 3].map((index) => (
                <input key={index} type="file" accept="image/*" onChange={(e) => handleImageChange(e, index)} />
              ))}
              <button type="submit">{editingProductId ? "Update Product" : "Add Product"}</button>
            </form>
          </div>
        </div>
      )}

      {/* Desktop Form */}
      <div className="desktop-form">
        <h2>{editingProductId ? "Edit Product" : "Add New Product"}</h2>
        <form className="add-product-form" onSubmit={handleSubmit}>
          <input type="text" name="name" value={product.name} onChange={handleChange} placeholder="Product Name" required />
          <select name="category" value={product.category} onChange={handleChange} required>
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input type="number" name="price" value={product.price} onChange={handleChange} placeholder="Price (₹)" required />
          <input type="number" name="discountPrice" value={product.discountPrice} onChange={handleChange} placeholder="Discount Price (₹)" />
          <input type="text" name="material" value={product.material} onChange={handleChange} placeholder="Material" required />
          <input type="text" name="color" value={product.color} onChange={handleChange} placeholder="Color" required />
          <input type="text" name="type" value={product.type} onChange={handleChange} placeholder="Type" required />
          <input
            type="text"
            name="quantity"
            value={product.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            required
          />
          <textarea name="description" value={product.description} onChange={handleChange} placeholder="Description" required></textarea>
          <label>Main Product Image:</label>
          <input type="file" name="mainImage" accept="image/*" onChange={handleImageChange} /> <br />
          <label>Sub Images:</label>
          {[0, 1, 2, 3].map((index) => (
            <input key={index} type="file" accept="image/*" onChange={(e) => handleImageChange(e, index)} />
          ))}
          <button type="submit">{editingProductId ? "Update Product" : "Add Product"}</button>
        </form>
      </div>

      <h2>Product List</h2>
      <div className="filter-controls">
        <input
          type="text"
          placeholder="Search by product name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-dropdown"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Desktop Table */}
      <div className="table-wrapper">
        <table className="product-table">
          <thead>
            <tr>
              <th>Main Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>View</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => (
              <tr key={product._id}>
                <td>
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="table-main-image"
                  />
                </td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.quantity}</td>
                <td>
                  <button className="view-btn-details" onClick={() => handleView(product)}>
                    <Eye size={18} />
                  </button>
                </td>
                <td>
                  {product.quantity < 1 ? (
                    <button className="unavailable-btn">Unavailable</button>
                  ) : (
                    <button className="available-btn">Available</button>
                  )}
                </td>
                <td>
                  <button className="icon-btn" onClick={() => handleEdit(product)} title="Edit">
                    <Pencil size={18} />
                  </button>
                  <button className="icon-btn" onClick={() => handleDelete(product._id)} title="Delete">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="product-cards">
        {paginatedProducts.map((product) => (
          <div className="product-card" key={product._id}>
            <img src={product.mainImage} alt={product.name} className="card-image" />
            <div className="card-body">
              <h3 className="card-title">{product.name}</h3>
              <p className="card-category">{product.category}</p>
              <p className="card-quantity">Quantity: {product.quantity}</p>
              <div className="card-actions">
                <span className={`card-status ${product.quantity < 1 ? 'status-unavailable' : 'status-available'}`}>
                  {product.quantity < 1 ? 'Unavailable' : 'Available'}
                </span>
                <div className="action-buttons">
                  <button className="icon-btn" onClick={() => handleView(product)} title="View">
                    <Eye size={16} />
                  </button>
                  <button className="icon-btn" onClick={() => handleEdit(product)} title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button className="icon-btn" onClick={() => handleDelete(product._id)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        {(() => {
          const totalVisiblePages = 4;
          const pageGroup = Math.floor((currentPage - 1) / totalVisiblePages);
          const startPage = pageGroup * totalVisiblePages + 1;
          const endPage = Math.min(startPage + totalVisiblePages - 1, totalPages);

          return (
            <>
              {startPage > 1 && (
                <button onClick={() => handlePageChange(startPage - 1)}>Prev</button>
              )}

              {[...Array(endPage - startPage + 1)].map((_, index) => {
                const pageNumber = startPage + index;
                return (
                  <button
                    key={pageNumber}
                    className={currentPage === pageNumber ? "active-page" : ""}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              {endPage < totalPages && (
                <button onClick={() => handlePageChange(endPage + 1)}>Next</button>
              )}

              <span className="total-pages">Total Pages: {totalPages}</span>
            </>
          );
        })()}
      </div>

      {/* Product Detail Modal */}
      {showModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedProduct.name}</h3>
            <p><strong>Category:</strong> {selectedProduct.category || "N/A"}</p>
            <p><strong>Price:</strong> ₹{selectedProduct.price || "0"}</p>
            <p><strong>Discount Price:</strong> ₹{selectedProduct.discountPrice || "0"}</p>
            <p><strong>Material:</strong> {selectedProduct.material || "N/A"}</p>
            <p><strong>Color:</strong> {selectedProduct.color || "N/A"}</p>
            <p><strong>Type:</strong> {selectedProduct.type || "N/A"}</p>
            <p><strong>Quantity:</strong> {selectedProduct.quantity || "0"}</p>
            <p><strong>Description:</strong> {selectedProduct.description || "N/A"}</p>

            <div>
              <h4>Main Image:</h4>
              <img src={selectedProduct.mainImage} alt="Main" className="modal-image" />
            </div>

            <div>
              <h4>Sub Images:</h4>
              <div className="sub-image-group">
                {selectedProduct.subImages?.map((img, idx) => (
                  img && <img key={idx} src={img} alt={`Sub ${idx}`} className="modal-sub-image" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;