# 1. Project description
# Travel App
Travel App is a social platform where users can share their travel experiences and itineraries, explore places, and connect with other travelers.
Built with a React frontend and a C# backend using Entity Framework.

Documentation pdf (in romanian) and video tutorial:
- [documentation](https://drive.google.com/file/d/1mXvs3_6OCUyiA467SEgyCYgoSoJFoJnc/view?usp=sharing) 
- [video](https://drive.google.com/file/d/1ECst38NeP8ABaqFEIMk-8Bt-pUdMvG4f/view?usp=sharing)
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

# Technologies: 
React, C#, Entity Framework, Tanstack React Query, Appwrite, Tailwind.css

# 2. Folder structure
- [Frontend](https://drive.google.com/file/d/1-ZsZ8X8o3Lq-vsMMBDgfD3nv0HbB3bg2/view?usp=sharing)
- [Backend](https://drive.google.com/file/d/1xGUn2FjZiKuiblOFDTyn5zOtoVIIF5mg/view?usp=sharing)

# 3. [Architectural diagram](https://drive.google.com/file/d/1MInfcX1eKHq9CzmHIDOFlDCYQAj0f1Ww/view?usp=sharing)

# 4. Installation procedure
Unfortunately momentarily it is not possible to use the app on other devices as it is quite complex and this is a feature that will be made possible in the future.
You can see the app workflow in this [video](https://drive.google.com/file/d/1ECst38NeP8ABaqFEIMk-8Bt-pUdMvG4f/view?usp=sharing)

# 5. Design patterns utilised in the project:
- Provider pattern
The provider pattern is very useful for data management as it utilizes the context API to pass data through the application's component tree. This pattern is an effective solution to prop drilling, which has been a common concern in react development.

To implement the provider pattern, we will first create a Provider Component. A Provider is a higher-order component that the Context object provides to us. We can construct a Context object by utilizing the createContext method provided by React.

- Prop combination pattern
Props are used to pass data from one component to another. The prop combination pattern groups related props into a single object. This object is then passed as a single prop to a component.

- Conditional rendering pattern
Conditional rendering involves dynamically displaying different UI elements based on certain conditions. This pattern is very useful when building applications that display different information depending on application state, user interactions and various other factors.
