# 1. Project description
# Travel App
Travel App is a social platform where users can share their travel experiences and itineraries, explore places, and connect with other travelers.
Built with a React frontend and a C# backend using Entity Framework.
Documentation pdf (in romanian) with photos and video tutorial at the end:
[Link](https://drive.google.com/file/d/1mXvs3_6OCUyiA467SEgyCYgoSoJFoJnc/view?usp=sharing) 
# Key Features:
- User authentication and session management made with the help of the Appwrite cloud service
- Home feed with scrollable posts
- Navigation sidebar
- Post creation
- Two types of posts:
    - itinerary (full trip itineraries with all the details of the trip from photos to accommodation)
    - normal (posts sharing photos of locations/landmarks)
- Map integration using TomTom Api
- Comment section for each post where users can interact and discuss (with delete, edit features)

# Technologies: React, C#, Entity Framework, Tanstack React Query, Appwrite, Tailwind.css

# Folder structure

- [Frontend]:
📁 travel app/
    ├── 📁 public/
    │   ├── 📁 icons
    │   └── 📁 images
    └── 📁 src/
        ├── 📁 _auth/
        │   ├── 📁 forms/
        │   │   ├── 📄 SigninForm.tsx
        │   │   └── 📄 SignupForm.tsx
        │   └── 📄 AuthLayout.tsx
        ├── 📁 _root/
        │   ├── 📁 pages/ # main pages of the app
        │   └── 📄 RootLayout.tsx
        ├── 📁 api/ # all the api calls to the backend
        ├── 📁 components/
        │   ├── 📁 comment/ # components for the comments
        │   ├── 📁 post/ # components for the posts's creation and display
        │   ├── 📁 shared/ # components that can be reusable in other areas of the project
        │   └── 📁 ui/ # shadcn ui components
        ├── 📁 constants/ # constants like the sidebar links
        ├── 📁 context/
        │   └── 📄 AuthContext.tsx # auth context provider
        ├── 📁 hooks/
        ├── 📁 lib/
        │   ├── 📁 react-query/ # everything react query (queries and mutations)
        │   ├── 📁 validation/ # form validation
        │   └── 📄 utils.ts
        ├── 📁 types/
        │   └── 📄 index.ts # all type interfaces used in the app
        ├── 📄 App.tsx
        ├── 📄 globals.css # tailwind classes
        └── 📄 main.tsx

  - Backend:
    📁 travel app backend api/
    ├── 📁 Controllers/ # all controllers
    ├── 📁 DTO's/ # all Data Transfer Objects
    ├── 📁 Migrations/ # database migrations
    ├── 📁 Models/ # classes used to define the tables in the database
    └── 📄 AppDbContext.cs # the database context


  
