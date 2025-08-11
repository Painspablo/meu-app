# Pipeline CI/CD com Jenkins, Docker e GitHub

Este projeto implementa um pipeline de Integração e Entrega Contínua (CI/CD) para uma aplicação Node.js com MongoDB. A automação é orquestrada pelo **Jenkins**, usando **Docker** para containerização, **Docker Compose** para orquestração local, e o **GitHub** como repositório de código.

## 1\. Estrutura do Projeto

A estrutura de arquivos do projeto deve ser a seguinte, com todos os arquivos de configuração na raiz:

```
.
├── Dockerfile                  # Instruções para criar a imagem Docker da app
├── Jenkinsfile                 # O código do pipeline de CI/CD
├── docker-compose.yml          # Orquestra a app Node.js e o MongoDB
├── package.json
├── package-lock.json
├── index.js                    # O código-fonte da aplicação
└── tests/
    └── app.test.js             # Testes automáticos com Jest
```

-----

## 2\. Configuração do Projeto e Git

A primeira etapa é configurar o repositório local e enviá-lo para o GitHub.

```bash
# Inicialize o repositório Git
git init

# Adicione todos os arquivos
git add .

# Faça o primeiro commit
git commit -m "Primeiro commit - Estrutura do projeto CI/CD"

# Adicione o repositório remoto do GitHub
# Substitua a URL pela sua
git remote add origin https://github.com/[seu-nome-de-usuario]/meu-app.git

# Envie o código para o GitHub
git push -u origin main
```

-----

## 3\. Configuração do Jenkins

1.  **Instale os Plugins**: No painel do Jenkins, vá em `Gerenciar Jenkins > Plugins` e instale o **Git Plugin** e o **Pipeline Plugin**.
2.  **Crie as Credenciais**: Em `Gerenciar Jenkins > Credenciais`, adicione as suas credenciais do Docker Hub (`Username with password`) e atribua a elas o ID exato de **`docker-hub-creds`**.
3.  **Crie a Pipeline**: Crie uma nova Pipeline no Jenkins e configure-a para clonar o seu repositório no GitHub, onde está o **`Jenkinsfile`**. O Jenkins fará o resto.

-----

## 4\. O `Jenkinsfile` - Código do Pipeline

Este arquivo define todas as etapas de CI/CD, desde a construção da imagem até o deploy local.

```groovy
pipeline {
  agent any
  environment {
    IMAGE = "[seu-nome-de-usuario]/meu-app"
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
        }
      }
    }
    stage('Deploy') {
      steps {
        sh 'docker-compose down --remove-orphans'
        sh 'docker-compose up -d'
      }
    }
  }
  post {
    success { echo "Pipeline concluído com sucesso!" }
    failure { echo "Ocorreu um erro — verifique os logs." }
  }
}
```

-----

## 5\. O `Dockerfile` - Construção da Imagem

Este arquivo contém as instruções para criar a imagem Docker da aplicação Node.js.

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
```

-----

## 6\. O `docker-compose.yml` - Orquestração Local

Este arquivo é usado para subir a aplicação e o banco de dados MongoDB juntos no ambiente local.

```yaml
version: '3.8'

services:
  app:
    image: [seu-nome-de-usuario]/meu-app:latest
    container_name: meu-app
    restart: always
    ports:
      - "3000:3000"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/meu-banco
    depends_on:
      - mongodb

  mongodb:
    image: mongo:latest
    container_name: mongodb
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

-----

## 7\. `app.test.js` - Testes Unitários

O Jest foi configurado para rodar os testes na pasta `tests`. O arquivo `app.test.js` deve conter testes válidos, como este exemplo:

```javascript
describe('Testes iniciais', () => {
  test('A soma de 1 e 1 deve ser 2', () => {
    expect(1 + 1).toBe(2);
  });

  test('O resultado de uma string de texto deve ser igual', () => {
    const texto = "Olá mundo";
    expect(texto).toBe("Olá mundo");
  });
});
```

-----

## 8\. Como Funciona o Pipeline

A cada novo `git push` para o branch `main`, o Jenkins é acionado e executa as seguintes etapas:

  * **`Checkout`**: O código mais recente é clonado do GitHub.
  * **`Build Docker`**: Uma nova imagem da aplicação é criada e marcada como **`[seu-nome-de-usuario]/meu-app:latest`**.
  * **`Test`**: Os testes com Jest são executados para validar o código. Se os testes falharem, o pipeline para.
  * **`Push Docker`**: A imagem da aplicação é enviada para o seu repositório no Docker Hub.
  * **`Deploy`**: A aplicação e o MongoDB são implantados na máquina local do Jenkins, usando o `docker-compose`.

Para ver a aplicação a correr localmente, acesse `http://localhost:3000`.
