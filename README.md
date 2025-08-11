
````markdown
# Pipeline CI/CD com Jenkins, Docker, Docker Compose e GitHub

Este projeto demonstra a criação de um pipeline CI/CD completo, integrando Jenkins, Docker, Docker Compose, GitHub e testes automáticos com Jest para uma aplicação Node.js simples com MongoDB.

---

## Estrutura do projeto

- Código Node.js da aplicação
- `Dockerfile` para build da imagem Docker da aplicação
- `docker-compose.yml` para orquestrar app Node.js + MongoDB
- `Jenkinsfile` definindo o pipeline CI/CD com estágios de build, teste, push e deploy
- Testes automáticos com Jest e Supertest na pasta `tests/`

---

## Passo a passo para rodar o projeto

### 1. Configurar Git local e GitHub

```bash
# Inicializar repositório Git local
git init

# Configurar usuário e email para commits
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"

# Adicionar arquivos e fazer o primeiro commit
git add .
git commit -m "Primeiro commit - app Node.js"

# Adicionar repositório remoto GitHub (substitua pela sua URL)
git remote add origin https://github.com/seuusuario/seurepositorio.git

# Enviar código para GitHub
git push -u origin main
````

---

### 2. Instalar Jenkins e plugins necessários

* Instale o Jenkins (ex: em Ubuntu ou via WSL)
* No painel do Jenkins, instale os plugins:

  * Git Plugin
  * Pipeline Plugin
* Adicione credenciais do GitHub e Docker Hub em **Gerenciar Jenkins > Credenciais**

---

### 3. Criar e configurar o Jenkinsfile

* Crie o arquivo `Jenkinsfile` na raiz do projeto com as etapas:

```groovy
pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/seuusuario/seurepositorio.git'
      }
    }
    stage('Build Docker') {
      steps {
        sh 'docker build -t seuusuario/meu-app:latest .'
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
        withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          sh 'echo $DH_PASS | docker login -u $DH_USER --password-stdin'
          sh 'docker push seuusuario/meu-app:latest'
          sh 'docker logout'
        }
      }
    }
    stage('Deploy') {
      steps {
        sh 'docker-compose down'
        sh 'docker-compose up -d'
      }
    }
  }
  post {
    success {
      echo 'Pipeline concluído com sucesso!'
    }
    failure {
      echo 'Pipeline falhou. Verifique os logs.'
    }
  }
}
```

---

### 4. Criar o Dockerfile para a aplicação Node.js

```Dockerfile
FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

---

### 5. Criar o docker-compose.yml para app + MongoDB

```yaml
version: '3'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
  db:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

---

### 6. Adicionar testes automáticos com Jest e Supertest

* Instale dependências:

```bash
npm install --save-dev jest supertest
```

* Configure script `test` no `package.json`:

```json
"scripts": {
  "test": "jest"
}
```

* Crie testes simples na pasta `tests/app.test.js`, exemplo:

```javascript
const request = require('supertest');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Hello DevOps World! 🚀'));

describe('GET /', () => {
  it('responds with Hello DevOps World!', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('Hello DevOps World! 🚀');
  });
});
```

* Rode localmente:

```bash
npm test
```

---

### 7. Configurar webhook no GitHub para Jenkins

* No repositório GitHub, acesse **Settings > Webhooks**
* Adicione webhook apontando para URL do Jenkins (ex: [http://seu-servidor-jenkins/github-webhook/](http://seu-servidor-jenkins/github-webhook/))
* Configure para enviar evento **push**
* Use ngrok ou servidor público para Jenkins receber webhook, se necessário

---

### 8. Executar pipeline e validar

* Faça um commit e push de qualquer alteração

* Jenkins irá disparar pipeline automaticamente:

  * Clona o repositório
  * Builda imagem Docker
  * Roda testes automatizados
  * Faz push da imagem para Docker Hub
  * Faz deploy local via docker-compose

* Acesse `http://localhost:3000` para ver aplicação rodando

---

## Considerações finais

* Mantenha o Jenkinsfile e testes sempre versionados junto com o código
* Use variáveis de ambiente e credenciais para manter segurança
* Expanda testes para maior cobertura da aplicação
* Para produção, considere integração com Ansible ou Kubernetes para deploy remoto

---

## Comandos úteis

```bash
# Inicializar repositório Git
git init

# Configurar usuário Git
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"

# Fazer commit
git add .
git commit -m "Mensagem do commit"

# Enviar para GitHub
git push -u origin main

# Build Docker local
docker build -t seuusuario/meu-app .

# Rodar Docker Compose
docker-compose up -d

# Testar aplicação
npm test
```

---
