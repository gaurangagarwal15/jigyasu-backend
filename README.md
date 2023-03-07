# JigYasu <img src="https://i.ibb.co/SXVTwtK/Screenshot-2022-09-04-113119.png" align="right">
One stop portal which will contain all the information about all academic activities of different universities spanning across the country and the international arena in chronological order. It is a multiservice platform which benefits one on all the stages, i.e from registration to earning the certificate; we have covered it all!
<br><br>
Check out the live site - [**JigYasu**](https://jigyaasu.netlify.app/)

📂 Project Organization
------------

    ├── README.md          <- The top-level README for developers using this project.
    ├── node_modules       <- Folder containg node modules 
    ├── .env               <- MongoDB connection string
    ├── app.js             <- Main Express app containing all the api routes
    ├── index.js           <- startup js file intializing the app and the port
    ├── package.json       <- Containing the required node modules start up scripts etc
    ├── middlewares 
    |    └── auth.js       <- Middleware to check if user is authenticated
    |
    ├── models
    |   ├── events.js             <- database schema for event
    |   ├── models.js             <- database schema for listings
    |   └── user.js               <- database schema for users
    |
    ├── routes
    |   ├── events.js             <- event handler and routes for event
    |   ├── models.js             <- event handler and routes for listings
    |   └── user.js               <- event handler and routes for users
    └── db
