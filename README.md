# Secure API Gateway

### Tech Stack

Front End: Vite <img src="./public/images/Vitejs-logo.svg.png" alt="vite logo" width="20"/> TypeScript <img src="./public/images/typescript.svg" alt="typescript logo" width="20"/> React <img src="./public/images/react.svg" alt="react logo" width="20"/>  
Back End: Node.js <img src="./public/images/nodejs.svg" alt="nodejs logo" width="20"/>

## Getting Started

The repo requires an installation of nodejs.  
Check if you have node on your system by typing in the following in your terminal:

`node -v`<br>

As of creating this repo, I am using node v22.15.0.

_WHAT IF I DON'T HAVE NODEJS INSTALLED_  
Download Nodejs from this [link](https://nodejs.org/en)
<br>
Once you run through the installation, open your terminal and run the following commands<br>  
`node -v`  
`npm -v`  
  
  If your terminal returns versions for both, you have successfully installed Nodejs. 

## Running api-gateway
from parent folder, cd to the folder containing the API related index.js file  
`cd api-gateway`  
run the following command  
`npm start`  
The terminal should say "server running at..." and provide a link to the server you can view.

## Running front end
from parent folder, cd to frontend  
`cd frontend`  
run the following command  
`npm run dev` => hit o to run the front end locally

## !! IMPORTANT !!
Since we do not have an all encompassing run script you need to run the api-gateway first, and in another terminal run the front end. 
