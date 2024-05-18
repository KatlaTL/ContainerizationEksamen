<a name="readme-top"></a>

# Containerization Eksamen


<!-- TABLE OF CONTENTS -->
<summary>Table of Contents</summary>
<ol>
    <li>
        <a href="#about-the-project">About The Project</a>
    </li>
    <li>
        <a href="#getting-started">Getting Started</a>
        <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        </ul>
    </li>
    <li><a href="#Containerize-the-application">Containerize the application</a>
        <ul>
        <li><a href="#Docker-Image-of-the-Frontend">Docker Image of the Frontend</a></li>
        <li><a href="#Docker-Images-of-the-Backend">Docker Images of the Backend</a></li>
        <li><a href="#Docker-compose">Docker-compose</a></li>
        </ul>
    </li>
    <li><a href="#Docker-Swarm">Docker Swarm</a></li>
</ol>



<!-- ABOUT THE PROJECT -->
## About The Project

There are a separate README.md files in both the frontend and backend project for how to run the projects on localhost.
In this README.md we will explain how to containerize the project as a whole with docker and how to use Docker Swarm for orchestration.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

Make sure you have Docker install before continuing with this guide
[https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)

### Installation

To containerize the application you first of all have to either download or clone project
1. Clone the repository
   ```sh
   git clone https://github.com/KatlaTL/ContainerizationEksamen.git 
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- Containerize -->
## Containerize the application

Containerizing the application is a three part process
1. First we will create a Docker image of the Frontend 
2. Secondly we will create two Docker images of the Backend. One to start the Database and one to seed it
3. Thirdly we will create a Docker-compose.yml to handle and run all of the images at once


### Docker Image of the Frontend

Starting in the root of the project

1. CD (Change directory) into the frontend project
    ```sh
    cd frontend
    ```
2. Create a Dockerfile
    ```sh
    touch Dockerfile
    ```
3. Open the Dockerfile in your favorite editor. We will use Vim in this example
    ```sh
    vim Dockerfile
    ```
4. In the Dockerfile write the following lines
    ```sh
      FROM node:18-alpine

        WORKDIR /app

        COPY package.json .

        RUN npm install

        COPY . .

        RUN npm run build

        EXPOSE 8080

        CMD [ "npm", "run", "preview" ]
    ```
    Line by line this is what the different commands do:
    * Tells the image to use the node:18-alpine as the base of our image 
    * Define the working directory of the code inside the image
    * Copy the package.json of the frontend project to the image
    * Run a `npm install` inside the image
    * Copy the rest of the code to the image
    * Build the frontend project inside the image
    * Expose port 8080
    * Tell the image to run a `npm run preview` when the container is up and running

6. Build the Docker image with name the frontend-image
    ```sh
    docker build -t frontend-image .
    ```
    * To test that the image is working
        ```sh
        docker run -d frontend-image
        ```
        The container can now be access on localhost:8080

<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Docker Images of the Backend

Starting in the root of the project

1. CD (Change directory) into the backend project
    ```sh
    cd backend
    ```
2. Create a Dockerfile
    ```sh
    touch Dockerfile
    ```
3. Open the Dockerfile in your favorite editor. We will use Vim in this example
    ```sh
    vim Dockerfile
    ```
4. In the Dockerfile write the following lines
    ```sh
      FROM node:18-alpine

      WORKDIR /app
      
      COPY package.json .
      
      RUN npm install

      COPY . .

      EXPOSE 3000
      
      CMD [ "npm", "start" ]
    ```
    Line by line this is what the different commands do:
    * Tells the image to use the node:18-alpine as the base of our image 
    * Define the working directory of the code inside the image
    * Copy the package.json of the frontend project to the image
    * Run a `npm install` inside the image
    * Copy the rest of the code to the image
    * Expose port 3000
    * Tell the image to run a `npm start` when the container is up and running

6. Build the Docker image with the name backend-image
    ```sh
    docker build -t backend-image .
    ```
    * To test that the image is working
        ```sh
        docker run -d backend-image
        ```
        The container can now be access on localhost:3000 <br />
        Check that the server is running by visitting `/status`
7. We will then create a second Docker image for the backend which only purpose is to spin up and do a `npm run db:reset` to populate the database with data
    ```sh
    touch Dockerfile.db-reset
    ```
8. Open the Dockerfile in your favorite editor. We will use Vim in this example
    ```sh
    vim Dockerfile.db-reset
    ```
9. In the Dockerfile write the following lines
    ```sh
      FROM node:18-alpine

        WORKDIR /app

        COPY package.json .

        RUN npm install

        COPY . .

        CMD ["npm", "run", "db:reset"]
    ```
    The commands are almost identical with the previous image <br />
    The difference being that we are not exposing any ports as we do not need to access the container and we run a `npm run db:reset` when we run the image
10. Build the Docker image with db-reset
    ```sh
    docker build -t db-reset -f Dockerfile.db-reset .
    ```
<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Docker-compose

When we have builded all three of the images, then it's time to create a docker-compose file to handle the images as well as storage in form of volumes

1. Create a docker-compose file in the root of the project
    ```sh
    touch docker-compose.yml
    ```
2. Open the docker-compose.yml in your favorite editor. We will use Vim in this example
    ```sh
    vim docker-compose.yml
    ```
3. In the docker-compose.yml write the following lines
    ```sh
    version: '3.1'

    services:

        frontend:
        image: frontend-image
        restart: unless-stopped
        ports:
            - 8080:8080

        backend:
        image: backend-image
        restart: unless-stopped
        ports:
            - 3000:3000
        environment:
            DB_USERNAME: admin
            DB_PASSWORD: admin
            DB_DATABASE: zay
            DB_HOSTNAME: db
            PORT: 3000
        volumes:
            - shop:/app/share/backend

        db:
        image: mysql:8.0
        restart: unless-stopped
        environment:
            MYSQL_ROOT_PASSWORD: root
            MYSQL_DATABASE: zay
            MYSQL_USER: admin
            MYSQL_PASSWORD: admin
        ports:
            - 3306:3306
        volumes:
            - db:/app/share/db

        db-reset:
        image: db-reset
        restart: on-failure
        environment:
            DB_USERNAME: admin
            DB_PASSWORD: admin
            DB_DATABASE: zay
            DB_HOSTNAME: db
        depends_on:
            - db

    volumes:
    shop:
    db:
    ```
    This docker-compose.yml runs four different images, the three we just created and mysql:8.0 <br />
    The images are run independently of each others, execept for db-reset which need the mysql image to run first <br />
    To quickly explain what happens in the docker-compose.yml from top to bottom:
    * First we run the frontend-image on port 8080
    * Secondly we run the backend-image on port 3000 and set the different environment variables with the necessary database connection info. We also tell the backend to store data in a volume at `/app/share/backend`
    * Thirdly we run the mysql:8.0 image from Dockerhub on port 3306 and set the environment variables necessary to create a database. We also tell the database to store data in a volume at `/app/share/db`
    * At last we run the db-reset image with the enviroment variables necessary to connect to the database. We tell it to wait for the database image to run before we try seeding it. It has a on-failure restart policy to make sure it retries until the database is fully up and running.
4. To run the docker-compose in the background
    ```sh
    docker compose up -d
    ```
5. Check that all the containers are up and running
    ```sh
    docker ps
    ```
    The container can now be access on localhost:8080 <br />
    Check that the server and database are running by visitting `/shop`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Docker Swarm
TO-DO

<p align="right">(<a href="#readme-top">back to top</a>)</p>