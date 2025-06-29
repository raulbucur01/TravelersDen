# 🌍 Traveler’s Den

**Traveler’s Den** is a full-stack travel-focused social media web application built with the goal of combining trip planning with community interaction. The app allows users to share travel experiences, create detailed itineraries, explore destinations, and discover similar users and posts through intelligent recommendations.

This project was developed as a self-directed learning experience and for my bachelor's degree, integrating a wide range of modern web development technologies and artificial intelligence tools. The focus was on learning to build, orchestrate, and optimize a robust, scalable, and feature-rich full-stack application.

---

## 🔍 Features

- 📄 Two types of posts: simple place sharing & detailed travel itineraries
- 🤖 AI-based itinerary generation with an interactive editor for personalisation
- 🔐 Secure authentication (JWT, cookies, protected routes)
- 🚀 Smart recommendations for posts and users using NLP techniques (TF-IDF + SBERT combination)
- 📱 Responsive frontend built with React, TailwindCSS, TanStack Query
- 💾 Data persistence via SQL Server & Entity Framework
- ⚙️ Background tasks, caching, and performance optimization

---

## 🧱 Technologies Used

Traveler’s Den is a full-stack application composed of several interconnected technologies. Each layer is carefully chosen to handle a specific responsibility, creating a cohesive and scalable system.

### 🖥️ Frontend
- **React** – Core library for building the Single Page Application (SPA)
- **TypeScript** – Type safety and tooling support across the frontend codebase
- **Vite** – Lightning-fast frontend build tool and dev server
- **TailwindCSS** – Utility-first CSS framework for fast and responsive UI design
- **TanStack Query (React Query)** – Data fetching, caching, and synchronization
- **TomTom Maps SDK** – Interactive maps
- **Appwrite** – Media Storage

### 🌐 C# Backend (Main API)
- **ASP.NET Core (C#)** – Backend RESTful API responsible for core business logic and data persistence
- **Entity Framework Core** – ORM for managing SQL Server database models and queries
- **SQL Server** – Relational database to store users, posts, comments, itineraries, etc.

### 🧠 Python Backend (For AI related tasks)
- **Python (FastAPI)** – RESTful API for leveraging the AI functionalities
- **Redis** – Caching layer for storing Top-N recommendations (posts and users)
  
---

## 🧪 AI Recommendation System

The recommendation engine combines traditional keyword-based techniques (TF-IDF) with semantic embeddings (SBERT) to compute similarity between travel posts. Cosine similarity is used to measure closeness between vectors, and results are blended using a weighted average.

Top-N most similar posts and users are stored in Redis for fast retrieval via API endpoints:

- `/similar-posts/{post_id}`
- `/similar-users/{user_id}`

---

## ✈️ AI-Powered Itinerary Generator & Editor

One of the standout features of Traveler’s Den is the built-in **AI itinerary generator**, designed to assist users in planning personalized trips with minimal effort.

### 🔮 Itinerary Generator
- Uses a Mistral AI model to generate structured travel itineraries based on user input.
- Input examples: destination, number of days, preferred activities.

### 📝 Itinerary Editor (React)
- Interactive drag-and-drop editor built in **React** that allows users to customize the AI generated itineraries. They can:
  - Edit, rearrange, or remove AI-suggested activities.
  - Add their own custom entries manually.
  - Save the result as a finalized **itinerary-style post**.
  - Can choose to regenerate parts of the itinerary

---

## 🧑‍💻 Author

This project was created by Raul-Paraschiv Bucur as part of the Bachelor’s thesis in Informatics at Transylvania University From Brasov (2025).



