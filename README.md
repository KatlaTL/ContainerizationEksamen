<a name="readme-top"></a>

# Containerization Eksamen

<!-- TABLE OF CONTENTS -->
<h4>Table of Contents</h4>
<ol>
    <li>
        <a href="#about-the-project">About The Project</a>
    </li>
    <li>
        <a href="#getting-started">Getting Started</a>
        <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
            <li><a href="#connect-to-wifi">Connect to wifi</a></li>
            <li><a href="#install-docker">Install Docker</a></li>
            <li><a href="#change-hostname-and-host">Change hostname and host</a></li>
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
    <li><a href="#Docker-Stack">Docker Stack</a></li>
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

## Connect to wifi

The nodes has Ubuntu:22.04 installed therefore we need to use Linux commands.

The first thing to do is to connect to the wifi

1. First identify the name of the wireless network interface
   ```sh
   ls /sys/class/net
   ```
2. Navigate to the netplan directory and find the configuration file
   ```sh
   ls /etc/netplan/
   ```
3. Edit the netplan config
   ```sh
   sudo nano /etc/netplan/00-installer-config-wifi.yaml
   ```
4. Add the following
   ```sh
   network:
   ethernets:
       eth0:
           dhcp4: true
           optional: true
   version: 2
   wifis:
       wlp3s0:
           optional: true
           access-points:
               "SSID-NAME-HERE":
                   password: "PASSWORD-HERE"
           dhcp4: true
   ```
   5. Apply your changes to your wireless interface and connect to wifi
   ```sh
   sudo netplan apply
   ```
   6. Check if you can see the nodes ip
   ```sh
   ip a
   ```

## Install Docker

1. Use following command
   ```sh
   sudo apt install docker.io
   ```

## Change hostname and host

All laptops had the name "user" which made it hard to differeniate them. To change this do the following:

1. Locate the files hostname and hosts
   ```sh
   cd /etc
   ```
2. Edit the file
   ```sh
   sudo nano [ either hostname or hosts]
   ```

### Installation

To containerize the application you first have to either download or clone the project

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

   - Tells the image to use the node:18-alpine as the base of our image
   - Define the working directory of the code inside the image
   - Copy the package.json of the frontend project to the image
   - Run a `npm install` inside the image
   - Copy the rest of the code to the image
   - Build the frontend project inside the image
   - Expose port 8080
   - Tell the image to run a `npm run preview` when the container is up and running

5. Build the Docker image with name the frontend-image
   ```sh
   docker build -t frontend-image .
   ```
   - To test that the image is working
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

   - Tells the image to use the node:18-alpine as the base of our image
   - Define the working directory of the code inside the image
   - Copy the package.json of the frontend project to the image
   - Run a `npm install` inside the image
   - Copy the rest of the code to the image
   - Expose port 3000
   - Tell the image to run a `npm start` when the container is up and running

5. Build the Docker image with the name backend-image
   ```sh
   docker build -t backend-image .
   ```
   - To test that the image is working
     ```sh
     docker run -d backend-image
     ```
     The container can now be access on localhost:3000 <br />
     Check that the server is running by visitting `/status`
6. It's now time to create a second Docker image for the backend which only purpose is to spin up and do a `npm run db:reset` to populate the database with data
   ```sh
   touch Dockerfile.db-reset
   ```
7. Open the Dockerfile in your favorite editor. We will use Vim in this example
   ```sh
   vim Dockerfile.db-reset
   ```
8. In the Dockerfile write the following lines

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

9. Build the Docker image with the name db-reset
`sh
    docker build -t db-reset -f Dockerfile.db-reset .
    `
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

   - First we run the frontend-image on port 8080
   - Secondly we run the backend-image on port 3000 and set the different environment variables with the necessary database connection info. We also tell the backend to store data in a volume at `/app/share/backend`
   - Thirdly we run the mysql:8.0 image from Dockerhub on port 3306 and set the environment variables necessary to create a database. We also tell the database to store data in a volume at `/app/share/db`
   - At last we run the db-reset image with the enviroment variables necessary to connect to the database. We tell it to wait for the database image to run before we try seeding it. It has a on-failure restart policy to make sure it retries until the database is fully up and running.

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

We have 3 laptops with ubuntu 22.04 installed, they are used as nodes in our swarm cluster.

First we will ssh into one of the machines, and run docker swarm on it.

1. Ssh into a node
   ```sh
   ssh laptop-username@ip-adress
   ```
2. Install docker on the node
   ```sh
   sudo apt install docker.io
   ```
3. Init docker swarm on the node
   ```sh
   sudo docker swarm init
   ```

Now this node have become a manager, and you should see the docker swarm join token. Remember to save it.

Now repeat step 1 and 2 for the other nodes.

4. Add the other nodes to the swarm cluster
   ```sh
   sudo docker swarm join --token [ join-token ip:port ]
   ```

Now we have to promote the other workers to managers, so they're reachable in case of any failure in the swarm cluster

First ssh into the manager node

5. Get the list of swarm nodes
   ```sh
   sudo docker node ls
   ```
6. Promote the worker node to manager
   ```sh
   sudo docker node promote [ node-name... ]
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Docker Stack

First we need to update docker compose to include replicas. We will add 3 replicas to each of the services: frontend, backend and mysql. This ensures that each of the nodes are running the same content.

1. In the docker-compose.yml update it so it has a deploy section

   ```sh
   version: '3.1'

   services:

       frontend:
           image: frontend-image
           restart: unless-stopped
           ports:
               - 8080:8080
           deploy:
               mode: replicated
               replicas: 3

       backend:
           image: backend-image
           restart: unless-stopped
           ports:
               - 3000:3000
           deploy:
               mode: replicated
               replicas: 3
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
           deploy:
               mode: replicated
               replicas: 3
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

Clone project to one of the workers and build the docker files into images

2. Deploy the stack to the swarm
   ```sh
   sudo docker stack deploy --compose-file docker-compose.yml [ stackname ]
   ```
3. Check that services is running
   `sh
 sudo docker service ls
 `
   Now you can access the nodes in the browser on each of the nodes ip adresses on port 8080

<p align="right">(<a href="#readme-top">back to top</a>)</p>
