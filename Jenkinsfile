pipeline {
    agent any
    environment {
        DOCKER_IMAGE = "virginiagonsalves/myapp-backend:v1"
        KUBECONFIG = credentials('k8s-kubeconfig')  // This pulls your kubeconfig
    }
    stages {
        stage('Checkout Code') {
            steps {
                git 'https://github.com/Virginiagonsalves/Automation.git'
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
                script {
                    def scanResult = bat(returnStatus: true, script: 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --no-progress --scanners vuln --exit-code 1 --severity LOW,MEDIUM,HIGH,CRITICAL %DOCKER_IMAGE%')
                    if (scanResult != 0) {
                        error "Security scan failed: Vulnerabilities were detected in the image %DOCKER_IMAGE%. Please review the Trivy report for details."
                    }
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
