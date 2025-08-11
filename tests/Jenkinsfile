pipeline {
  agent any
  environment {
    IMAGE = "seuusuario/meu-app"
    DOCKER_CREDS = "docker-hub-creds"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Build Docker') {
      steps {
        sh "docker build -t ${IMAGE}:latest ."
      }
    }
    stage('Test') {
      steps {
        sh 'npm install'
        sh 'npm test'
      }
    }
    stage('Push Docker') {
      steps {
        withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS}", usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          sh "echo $DH_PASS | docker login -u $DH_USER --password-stdin"
          sh "docker push ${IMAGE}:latest"
          sh "docker logout"
        }
      }
    }
  }
  post {
    success { echo "Pipeline concluído com sucesso!" }
    failure { echo "Ocorreu um erro — verifique os logs." }
  }
}
