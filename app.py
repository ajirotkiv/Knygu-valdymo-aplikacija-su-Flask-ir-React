from IPython.core.release import author
from flask import Flask, request, jsonify
from flask_cors import CORS
from database import db
from models import Book

# ------------------ CONFIGURATION ------------------ #

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///book.db'
db.init_app(app)

with app.app_context():
    db.create_all()

# ------------------ API ROUTES ------------------ #

@app.route('/books', methods=['GET'])
def get_books():
    # Gauti paieškos parametrą iš URL (pvz., ?search=Harry)
    search_term = request.args.get('search', '').lower()

    if search_term:
        # Paieška pagal pavadinimą ir autorių
        books = Book.query.filter(
            (Book.title.ilike(f'%{search_term}%')) |
            (Book.author.ilike(f'%{search_term}%'))
        ).all()
    else:
        # Jei paieškos nėra, grąžinti visas knygas
        books = Book.query.all()

    return jsonify([{
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'year': book.year
    } for book in books])


@app.route('/books', methods=['GET'])
def books():
    """
    Gauti visas knygas
    """
    all_books = Book.query.all()
    return jsonify([book.to_dict() for book in all_books])

@app.route('/books', methods=['POST'])
def add_book():
    """
    Prideti knyga
    """
    data = request.json
    new_book = Book(
        title=data['title'],
        author=data.get('author', ''),
        year=data.get('year', '')
    )
    db.session.add(new_book)
    db.session.commit()
    return jsonify(new_book.to_dict()), 201

@app.route('/books/<int:id>', methods=['PUT'])
def edit_book(id):
    data = request.get_json()
    book = Book.query.get(id)
    if book:
        book.title = data['title']
        book.author = data['author']
        book.year = data['year']
        db.session.commit()
        return jsonify({'message': 'Knygos duomenys pakeisti'})
    return jsonify({'message': 'Knyga nerasta'}), 404


@app.route('/books/<int:id>', methods=['DELETE'])
def delete_book(id):
    book = Book.query.get(id)
    if book:
        db.session.delete(book)
        db.session.commit()
        return jsonify({'message': 'Knyga ištrinta sekmingai'})
    return jsonify({'message': 'Knyga nerasta'}), 404

if __name__ == '__main__':
    app.run(debug=True)

