# JWT Authentication

At first, I will describe for starting work on a express node and mongo project. We need three things to clear.

1. node should be installed into our machine
2. install express using npm package manager
3. install mongodb into the local machine 
4. implement mongo with the project.

## Process

In this section, I will describe how i make this project as well as how to start for a new node, express and mongo project.

We need to run some command into our bash step by step for starting or making our project.

Firstly, create a project directory and then navigate to that directory, you can follow this command for making a directory, otherwise
you can create it by your own.

I am describing what I besically do. At first, I opend my bash

`mkdir projectFloder`

then `cd projectFloder`

Now our directory is ready and we already staying on that folder. However, I need a package.json file where all of my package will 
be initialize what I am doing and what I am installing into my project.

For making that file just we need to run a command into our bash,

`npm init`

then the commandline will ask some question, we can answer those and submit `yes` on last line. This process will create a `package.json` file

On the contrary, we need some other packages to be installed into our project such as, express node and mongo. As a result, below this
command will install all of those packages to our project 

for installing express
`npm install express --save`

for installing mongodb instance to our project
`npm install mongoose --save`

Finally, at this moment we installed all the major dependecies to our project. How we can check that all of this 
dependencies is added to our project or not? . Just open the `package.json` file and you will find the changes

example at the very beginning when I did not install any dependencies to my project the `package.json` file is look like this

```js
{
  "name": "jwtauth",
  "version": "1.0.0",
  "description": "jwt authentication with refresher token express and node",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "julhas",
  "license": "ISC",
}

```

Moreover, after installing the express and mongo to our project we will see the changes to our `package.json` file in this way

```js

{
  "name": "jwtauth",
  "version": "1.0.0",
  "description": "jwt authentication with refresher token express and node",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "julhas",
  "license": "ISC",
  "dependencies": {
    "express": "^4.17.1",  // this line added for express
    "mongoose": "^5.9.9"   // this line added for mongoose
  }
}



```
