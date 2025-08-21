const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Book = require('../models/Book');

// Sample books data
const sampleBooks = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "9780743273565",
    description: "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan, of lavish parties on Long Island at a time when The New York Times noted 'gin was the national drink and sex the national obsession.'",
    price: 12.99,
    originalPrice: 15.99,
    discount: 19,
    category: "Fiction",
    genre: ["Classic", "Romance", "Drama"],
    language: "English",
    pages: 180,
    publisher: "Scribner",
    publishDate: "1925-04-10",
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400"
    ],
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    rating: { average: 4.5, count: 120 },
    tags: ["classic", "romance", "drama", "1920s"],
    featured: true,
    bestseller: true
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "9780446310789",
    description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it, addressing issues of race, inequality and segregation.",
    price: 14.99,
    originalPrice: 16.99,
    discount: 12,
    category: "Fiction",
    genre: ["Classic", "Drama", "Historical"],
    language: "English",
    pages: 281,
    publisher: "Grand Central Publishing",
    publishDate: "1960-07-11",
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"
    ],
    coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    rating: { average: 4.8, count: 200 },
    tags: ["classic", "drama", "historical", "civil rights"],
    featured: true,
    bestseller: true
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    description: "A dystopian social science fiction novel and cautionary tale. The novel is set in Airstrip One, a province of the superstate Oceania in a world of perpetual war.",
    price: 13.99,
    originalPrice: 15.99,
    discount: 13,
    category: "Science Fiction",
    genre: ["Dystopian", "Political", "Social Commentary"],
    language: "English",
    pages: 328,
    publisher: "Signet Classic",
    publishDate: "1949-06-08",
    stock: 60,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400"
    ],
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    rating: { average: 4.6, count: 180 },
    tags: ["dystopian", "political", "social commentary", "totalitarianism"],
    featured: true,
    bestseller: true
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "9780141439518",
    description: "The story follows the main character Elizabeth Bennet as she deals with issues of manners, upbringing, morality, education, and marriage in the society of the landed gentry of the British Regency.",
    price: 11.99,
    originalPrice: 13.99,
    discount: 14,
    category: "Romance",
    genre: ["Classic", "Romance", "Historical"],
    language: "English",
    pages: 432,
    publisher: "Penguin Classics",
    publishDate: "1813-01-28",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400"
    ],
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    rating: { average: 4.7, count: 150 },
    tags: ["classic", "romance", "historical", "regency"],
    featured: true,
    bestseller: false
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    isbn: "9780547928244",
    description: "A fantasy novel about the adventures of Bilbo Baggins, a hobbit who embarks on a quest to help a group of dwarves reclaim their homeland from a dragon.",
    price: 16.99,
    originalPrice: 19.99,
    discount: 15,
    category: "Fantasy",
    genre: ["Fantasy", "Adventure", "Epic"],
    language: "English",
    pages: 366,
    publisher: "Houghton Mifflin Harcourt",
    publishDate: "1937-09-21",
    stock: 55,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400"
    ],
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    rating: { average: 4.4, count: 90 },
    tags: ["fantasy", "adventure", "epic", "middle-earth"],
    featured: false,
    bestseller: true
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    isbn: "9780316769488",
    description: "The novel details two days in the life of 16-year-old Holden Caulfield after he has been expelled from prep school. Confused and disillusioned, Holden searches for truth and rails against the 'phoniness' of the adult world.",
    price: 12.99,
    originalPrice: 14.99,
    discount: 13,
    category: "Fiction",
    genre: ["Coming-of-age", "Drama", "Literary"],
    language: "English",
    pages: 277,
    publisher: "Little, Brown and Company",
    publishDate: "1951-07-16",
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400"
    ],
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    rating: { average: 4.3, count: 110 },
    tags: ["coming-of-age", "drama", "literary", "teenage"],
    featured: false,
    bestseller: false
  },
  {
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    isbn: "9780547928213",
    description: "An epic high-fantasy novel about the quest to destroy a powerful ring that could bring about the end of Middle-earth.",
    price: 24.99,
    originalPrice: 29.99,
    discount: 17,
    category: "Fantasy",
    genre: ["Fantasy", "Epic", "Adventure"],
    language: "English",
    pages: 1216,
    publisher: "Houghton Mifflin Harcourt",
    publishDate: "1954-07-29",
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400"
    ],
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    rating: { average: 4.9, count: 300 },
    tags: ["fantasy", "epic", "adventure", "middle-earth"],
    featured: true,
    bestseller: true
  },
  {
    title: "Animal Farm",
    author: "George Orwell",
    isbn: "9780451526342",
    description: "A satirical allegory about a group of farm animals who rebel against their human farmer, hoping to create a society where the animals can be equal, free, and happy.",
    price: 10.99,
    originalPrice: 12.99,
    discount: 15,
    category: "Fiction",
    genre: ["Satire", "Allegory", "Political"],
    language: "English",
    pages: 140,
    publisher: "Signet",
    publishDate: "1945-08-17",
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400"
    ],
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    rating: { average: 4.2, count: 80 },
    tags: ["satire", "allegory", "political", "revolution"],
    featured: false,
    bestseller: false
  }
];

// Sample admin user
const adminUser = {
  name: "Admin User",
  email: "admin@bookstore.com",
  password: "Admin123!",
  role: "admin",
  phone: "+1234567890",
  address: {
    street: "123 Admin Street",
    city: "Admin City",
    state: "Admin State",
    zipCode: "12345",
    country: "United States"
  }
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for seeding'))
.catch(err => console.error('MongoDB connection error:', err));

// Seed function
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminUser.password, 12);
    const admin = new User({
      ...adminUser,
      password: hashedPassword
    });
    await admin.save();
    console.log('Admin user created:', admin.email);

    // Create sample books
    const createdBooks = await Book.insertMany(sampleBooks);
    console.log(`${createdBooks.length} sample books created`);

    console.log('Database seeding completed successfully!');
    console.log('\nAdmin credentials:');
    console.log('Email:', adminUser.email);
    console.log('Password:', adminUser.password);
    console.log('\nYou can now login with these credentials');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
