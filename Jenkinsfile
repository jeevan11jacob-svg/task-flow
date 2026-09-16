pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'jeevanjacob11'
        DOCKER_CREDENTIALS = 'dockerhub-creds'
        HELM_RELEASE = 'taskflow'
        K8S_NAMESPACE = 'taskflow'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test Backend') {
            steps {
                sh '''
                    docker run --rm \
                      -v "$WORKSPACE/server:/app" \
                      -w /app \
                      node:24 \
                      sh -c "npm ci && npm test"
                '''
            }
        }

        stage('Set Image Tag') {
            steps {
                script {
                    env.IMAGE_TAG = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()

                    echo "Docker image tag: ${env.IMAGE_TAG}"
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                sh '''
                    docker build \
                      -t ${DOCKERHUB_USER}/taskflow-backend:${IMAGE_TAG} \
                      ./server
                '''
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh '''
                    docker build \
                      -t ${DOCKERHUB_USER}/taskflow-frontend:${IMAGE_TAG} \
                      ./client
                '''
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKER_CREDENTIALS}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        set -e

                        echo "$DOCKER_PASSWORD" | \
                            docker login \
                            -u "$DOCKER_USER" \
                            --password-stdin

                        docker push \
                            ${DOCKER_USER}/taskflow-backend:${IMAGE_TAG}

                        docker push \
                            ${DOCKER_USER}/taskflow-frontend:${IMAGE_TAG}

                        docker logout
                    '''
                }
            }
        }

        stage('Deploy with Helm') {
            steps {
                sh '''
                    helm upgrade ${HELM_RELEASE} ./helm/taskflow \
                        --namespace ${K8S_NAMESPACE} \
                        --set images.backend.tag=${IMAGE_TAG} \
                        --set images.frontend.tag=${IMAGE_TAG} \
                        --wait \
                        --timeout 5m
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    kubectl rollout status \
                        deployment/${HELM_RELEASE}-backend \
                        -n ${K8S_NAMESPACE} \
                        --timeout=5m

                    kubectl rollout status \
                        deployment/${HELM_RELEASE}-frontend \
                        -n ${K8S_NAMESPACE} \
                        --timeout=5m

                    kubectl get pods -n ${K8S_NAMESPACE}
                '''
            }
        }
    }

    post {
        success {
            echo 'TaskFlow CI/CD pipeline completed successfully!'
        }

        failure {
            echo 'TaskFlow CI/CD pipeline failed.'
        }
    }
}
