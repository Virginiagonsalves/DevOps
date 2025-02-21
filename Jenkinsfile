pipeline {
    agent any
    environment {
        DOCKER_IMAGE = "virginiagonsalves/myapp-backend:v1"
        KUBECONFIG = credentials('k8s-kubeconfig')  // This pulls your kubeconfig
    }
    stages {
        stage('Checkout Code') {
            steps {
                git 'https://github.com/Virginiagonsalves/DevOps.git'
            }
        }
        stage('Build Docker Image') {
            steps {
                dir('Backend') {
                    bat 'docker build -t %DOCKER_IMAGE% .'
                }
            }
        }
        stage('Run Tests') {
            steps {
                dir('Backend') {
                    bat 'npm install'
                    bat 'npm test'
                }
            }
        }
        stage('Scan with Trivy') {
            steps {
                bat 'docker run --rm aquasec/trivy image --no-progress --scanners vuln %DOCKER_IMAGE%'
                }    
            }
        }
        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    bat 'echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin'
                }
            }
        }
        stage('Push Image to Docker Hub') {
            steps {
                bat 'docker push %DOCKER_IMAGE%'
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                bat 'kubectl apply -f k8s\\deployment.yaml --validate=false'
            }
        }
    }
}
