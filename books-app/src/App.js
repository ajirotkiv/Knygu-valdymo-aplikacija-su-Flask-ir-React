import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({ title: '', author: '', year: '' });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Paimti knygas is backend
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const response = await axios.get('http://localhost:5000/books');
    setBooks(response.data);
  };

  // Formos lauku keitimas
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Prideti nauja knyga
  const handleAddBook = async () => {
    await axios.post('http://localhost:5000/books', formData);
    fetchBooks();  
    setFormData({ title: '', author: '', year: '' });  
  };

  // Esamos knygos redagavimas
  const handleEditBook = async () => {
    await axios.put(`http://localhost:5000/books/${editId}`, formData);
    fetchBooks();
    setFormData({ title: '', author: '', year: '' });
    setEditId(null);
  };

  // Istrinti knyga
  const handleDeleteBook = async (id) => {
    await axios.delete(`http://localhost:5000/books/${id}`);
    fetchBooks();
  };

  // Paieskos tvarkymas
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Knygu filtravimas pagal paieskos lauka
  const filteredBooks = books.filter((book) => {
    return (
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="main-container">

      <h1>KNYGŲ VALDYMO APLIKACIJA</h1>

      {/* Paieskos laukas */}
      <h4>Knygos paieška:</h4>

      <input
        type="text"
        placeholder="Paieška pagal pavadinimą arba autorių"
        value={searchTerm}
        onChange={handleSearchChange}
      />
  
      {/* Knygos ivesties forma */}
      <h4>Кnygos įvedimas / redagavimas</h4>
      <div style={{ marginTop: '20px' }}>
      <div>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Pavadinimas"
        />
        <input
          type="text"
          name="author"
          value={formData.author}
          onChange={handleChange}
          placeholder="Autorius"
        />
        <input
          type="number"
          name="year"
          value={formData.year}
          onChange={handleChange}
          placeholder="Metai"
        />
        <button onClick={editId ? handleEditBook : handleAddBook}>
          {editId ? 'Redaguoti' : 'Pridėti'}
        </button>
      </div>

      {/* Atrinktu knygu atvaizdavimas */}
      <h4>KNYGŲ SĄRAŠAS</h4>
      <div className='books-container'>
      <ul>
        {filteredBooks.map((book) => (
          <li key={book.id}>
            {book.title} by {book.author} ({book.year})
            <div className='buttons'>
            <button onClick={() => {
              setEditId(book.id);
              setFormData({ title: book.title, author: book.author, year: book.year });
            }}>
              Redaguoti
            </button>
            <button onClick={() => handleDeleteBook(book.id)}>Ištrinti</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
    </div>
    </div>
  );
}

export default App;
