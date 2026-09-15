pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'jeevanjacob11'
    }

    stages {

        stage('Test') {
    steps {
        sh 'docker run --rm -v jenkins_home:/var/jenkins_home -w /var/jenkins_home/workspace/DevOps-Task-Manager/server node:24 npm install'
        sh 'docker run --rm -v jenkins_home:/var/jenkins_home -w /var/jenkins_home/workspace/DevOps-Task-Manager/server node:24 npm test'
    }
}

        stage('Build Backend Docker Image') {
    steps {
        sh 'docker build -t task-manager-backend:$BUILD_NUMBER ./server'
    }
}

stage('Build Frontend Docker Image') {
    steps {
        sh 'docker build -t task-manager-frontend:$BUILD_NUMBER ./client'
    }
}
        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USER" --password-stdin

    docker tag task-manager-backend:$BUILD_NUMBER $DOCKER_USER/task-manager-backend:$BUILD_NUMBER
    docker tag task-manager-backend:$BUILD_NUMBER $DOCKER_USER/task-manager-backend:latest

    docker tag task-manager-frontend:$BUILD_NUMBER $DOCKER_USER/task-manager-frontend:$BUILD_NUMBER
    docker tag task-manager-frontend:$BUILD_NUMBER $DOCKER_USER/task-manager-frontend:latest

    docker push $DOCKER_USER/task-manager-backend:$BUILD_NUMBER
    docker push $DOCKER_USER/task-manager-backend:latest

    docker push $DOCKER_USER/task-manager-frontend:$BUILD_NUMBER
    docker push $DOCKER_USER/task-manager-frontend:latest

    docker logout
'''
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sh '''
                    cd /workspace/task-manager-devops

                    docker compose -p task-manager-devops pull

                    docker compose -p task-manager-devops up -d
                '''
            }
        }
    }
}