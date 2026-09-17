# TaskFlow — MERN Application with Kubernetes & DevOps CI/CD

TaskFlow is a production-oriented full-stack task management application built with the MERN stack and deployed on Kubernetes using a complete DevOps workflow.

The project demonstrates the software delivery lifecycle from source control and automated testing through containerization, image publishing, Kubernetes deployment, AWS infrastructure, persistent storage, ingress networking, security hardening, and failure recovery.

## Architecture

```text
                         Developer
                             │
                             │ git push
                             ▼
                    ┌─────────────────┐
                    │     GitHub      │
                    │   task-flow     │
                    └────────┬────────┘
                             │
                          Webhook
                             │
                             ▼
                    ┌─────────────────┐
                    │     Jenkins     │
                    │     CI/CD       │
                    └────────┬────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
              Test                  Docker Build
                 │                       │
                 └───────────┬───────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    Docker Hub   │
                    │                 │
                    │ Backend /       │
                    │ Frontend Images │
                    └────────┬────────┘
                             │
                        Helm Deploy
                             │
                             ▼
                 ┌───────────────────────┐
                 │    AWS EC2 / K8s      │
                 │                       │
                 │    Kubernetes         │
                 └───────────┬───────────┘
                             │
                         NGINX Ingress
                             │
                  ┌──────────┴──────────┐
                  │                     │
                  ▼                     ▼
             Frontend              Backend
             2 replicas            2 replicas
                                        │
                                        │
                                        ▼
                                   MongoDB
                                   1 replica
                                        │
                                        ▼
                                  EBS-backed
                                      PVC
```

### Request Flow

```text
Internet
   │
   ▼
AWS Network Load Balancer
   │
   ▼
NGINX Ingress Controller
   │
   ├── /      → TaskFlow Frontend
   │
   └── /api   → TaskFlow Backend
                       │
                       ▼
                    MongoDB
                       │
                       ▼
                Persistent EBS Storage
```

## Project Features

* Create tasks
* Update tasks
* Delete tasks
* Task status management

  * To Do
  * In Progress
  * Completed
* Priority management

  * Low
  * Medium
  * High
* Due dates
* Task search
* Status filtering
* Priority filtering
* Dashboard statistics
* Responsive React interface
* REST API using Express
* MongoDB persistence

## Technology Stack

### Application

* React
* Vite
* Node.js
* Express.js
* MongoDB
* Mongoose
* Axios

### DevOps

* Git
* GitHub
* Jenkins
* Jenkins Pipeline
* Docker
* Docker Hub
* Kubernetes
* Helm
* NGINX Ingress
* AWS EC2
* AWS Network Load Balancer
* AWS EBS
* EBS CSI Driver
* AWS Cloud Controller Manager

### Security & Configuration

* Kubernetes Secrets
* Kubernetes ConfigMaps
* Kubernetes RBAC/service configuration
* Private ClusterIP services
* Container resource requests and limits
* Kubernetes health probes
* IAM roles
* Network Security Groups

### Testing

* Jest
* Supertest

## Project Structure

```text
task-flow/
│
├── client/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── ...
│
├── server/
│   ├── models/
│   │   └── Task.js
│   ├── routes/
│   │   └── taskRoutes.js
│   ├── tests/
│   │   └── taskRoutes.test.js
│   ├── Dockerfile
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── helm/
│   └── taskflow/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│           ├── backend-configmap.yaml
│           ├── backend-deployment.yaml
│           ├── backend-service.yaml
│           ├── frontend-deployment.yaml
│           ├── frontend-service.yaml
│           ├── mongodb-deployment.yaml
│           ├── mongodb-pvc.yaml
│           ├── mongodb-service.yaml
│           └── ingress.yaml
│
├── Jenkinsfile
├── docker-compose.yml
└── README.md
```

## CI/CD Pipeline

TaskFlow uses Jenkins to automate testing, container image creation, image publishing, and Kubernetes deployment.

```text
Git Push
   │
   ▼
GitHub Webhook
   │
   ▼
Jenkins
   │
   ├── Checkout
   │
   ├── Test Backend
   │
   ├── Generate Image Tag
   │
   ├── Build Backend Image
   │
   ├── Build Frontend Image
   │
   ├── Push Images to Docker Hub
   │
   ├── Deploy with Helm
   │
   └── Verify Deployment
   │
   ▼
Kubernetes
```

### Jenkins Pipeline Stages

#### 1. Checkout

Jenkins checks out the latest commit from the GitHub `main` branch.

#### 2. Test Backend

Backend dependencies are installed inside a Node.js container and Jest/Supertest tests are executed.

#### 3. Set Image Tag

The short Git commit SHA is used as the Docker image tag.

Example:

```text
4f7b1d2
```

This creates traceability between source code and deployed container images.

#### 4. Build Backend Image

```text
jeevanjacob11/taskflow-backend:<commit-sha>
```

#### 5. Build Frontend Image

```text
jeevanjacob11/taskflow-frontend:<commit-sha>
```

#### 6. Push Images

Jenkins authenticates to Docker Hub using stored Jenkins credentials and pushes the versioned images.

#### 7. Deploy with Helm

Jenkins runs a Helm upgrade and passes the generated image tag to the chart.

```text
helm upgrade taskflow ./helm/taskflow
```

#### 8. Verify Deployment

Jenkins verifies the backend and frontend rollout status and checks the Kubernetes pods.

## Docker

Both application components are containerized.

### Backend

The backend image uses Node.js Alpine and runs as a non-root `node` user.

```text
node:24-alpine
```

### Frontend

The frontend uses a multi-stage Docker build.

```text
Node.js build stage
        │
        ▼
React production build
        │
        ▼
NGINX Alpine image
```

### Docker Hub Images

```text
jeevanjacob11/taskflow-backend
jeevanjacob11/taskflow-frontend
```

Images are tagged using Git commit SHA values rather than relying only on `latest`.

Example:

```text
taskflow-backend:4f7b1d2
taskflow-frontend:4f7b1d2
```

This makes deployments traceable and allows previous application versions to remain identifiable.

## Kubernetes Deployment

TaskFlow runs on Kubernetes with the following workloads:

```text
Frontend Deployment
    └── 2 replicas

Backend Deployment
    └── 2 replicas

MongoDB Deployment
    └── 1 replica
```

### Services

```text
taskflow-frontend   → ClusterIP :80
taskflow-backend    → ClusterIP :5000
taskflow-mongodb    → ClusterIP :27017
```

The application services are not directly exposed through public NodePorts.

External traffic enters through the NGINX Ingress Controller.

## Helm

The Kubernetes resources are packaged as a Helm chart.

```text
helm/taskflow/
├── Chart.yaml
├── values.yaml
└── templates/
```

Helm manages:

* Deployments
* Services
* ConfigMap
* PersistentVolumeClaim
* Ingress
* Application configuration

The application image tags are injected during CI/CD:

```text
images.backend.tag=<git-sha>
images.frontend.tag=<git-sha>
```

## Configuration Management

Non-sensitive configuration is stored in a Kubernetes ConfigMap.

Example:

```text
PORT=5000
MONGO_DATABASE=taskflow
```

Sensitive MongoDB credentials are stored in a Kubernetes Secret.

The credentials are intentionally **not stored in the current Helm values file**.

The running application references:

```text
taskflow-mongodb-secret
```

for:

```text
MONGO_USERNAME
MONGO_PASSWORD
```

MongoDB authentication is enabled with:

```text
--auth
```

The backend connects to MongoDB using authenticated credentials supplied through Kubernetes Secret references.

## Persistent Storage

MongoDB uses a Kubernetes PersistentVolumeClaim.

```text
PVC
taskflow-mongodb-pvc
        │
        ▼
StorageClass
gp3
        │
        ▼
AWS EBS
```

Current storage configuration:

```text
Storage:     5Gi
Access Mode: ReadWriteOnce
StorageClass: gp3
```

The MongoDB workload uses a `Recreate` deployment strategy because only one MongoDB replica is deployed with ReadWriteOnce storage.

## Health Checks

Kubernetes health probes are configured for the application.

### Backend

```text
Startup Probe
GET /health

Liveness Probe
GET /health

Readiness Probe
GET /health
```

### Frontend

The frontend uses HTTP probes against the NGINX-served application.

### MongoDB

MongoDB uses TCP-based readiness and liveness probes on port `27017`.

These probes allow Kubernetes to determine whether containers have started correctly and whether they are ready to receive traffic.

## Resource Management

Resource requests and limits are defined for the workloads.

Example backend configuration:

```text
Requests:
CPU:    100m
Memory: 128Mi

Limits:
CPU:    500m
Memory: 256Mi
```

Similar resource controls are configured for the frontend and MongoDB workloads.

This prevents unrestricted resource consumption and provides Kubernetes with scheduling information.

## AWS Infrastructure

TaskFlow is deployed on an AWS EC2 instance running Kubernetes.

The infrastructure includes:

```text
AWS EC2
   │
   ├── Kubernetes
   ├── containerd
   ├── Jenkins
   └── NGINX Ingress Controller
           │
           ▼
     AWS Network Load Balancer
```

### AWS Network Load Balancer

The NGINX Ingress Controller is exposed through an AWS Network Load Balancer.

External HTTP traffic follows:

```text
Client
  │
  ▼
AWS NLB
  │
  ▼
NGINX Ingress Controller
  │
  ├── /
  │
  └── /api
```

### AWS Cloud Controller Manager

The AWS Cloud Controller Manager is configured so Kubernetes can integrate with AWS load-balancing resources.

The Kubernetes node is associated with its AWS EC2 instance through the provider ID.

## Security Hardening

Several security controls were implemented during the project.

### Kubernetes Secret

MongoDB credentials were removed from the Helm chart values.

The live Secret is independently preserved:

```text
taskflow-mongodb-secret
```

The Secret was annotated with:

```text
helm.sh/resource-policy: keep
```

This allows the existing Secret to remain available even though the Secret manifest is no longer part of the Helm chart.

### Internal Services

Frontend, backend, and MongoDB services use Kubernetes `ClusterIP` services.

MongoDB is therefore not directly exposed to the internet.

### Container Security

The backend Docker image runs using the non-root Node.js user:

```text
USER node
```

### Network Isolation

External requests are handled through the NGINX Ingress layer rather than directly exposing the backend and MongoDB services.

### IAM

AWS resources are accessed using IAM roles rather than hard-coded AWS access keys on the server.

## Failure Testing & Helm Rollback

A controlled deployment failure was intentionally introduced to test recovery.

The backend image was changed to:

```text
jeevanjacob11/taskflow-backend:does-not-exist
```

Kubernetes attempted to create the new backend pod, but the image could not be pulled.

The resulting pod state was:

```text
ImagePullBackOff
```

Kubernetes reported:

```text
Failed to pull image
...
does-not-exist: not found
```

Helm eventually reported:

```text
UPGRADE FAILED: context deadline exceeded
```

The failed release was then rolled back using Helm.

```text
Revision 12
    │
    ▼
Revision 13
Failed deployment
    │
    ▼
Helm rollback
    │
    ▼
Revision 14
Deployed
```

Final workload recovery:

```text
Backend    2/2 Running
Frontend   2/2 Running
MongoDB    1/1 Running
```

This demonstrated the ability to:

* Detect a failed Kubernetes rollout
* Inspect pod failure events
* Identify an invalid container image
* Use Helm release history
* Roll back to a known-good release
* Verify application recovery

## Automated Testing

The backend API is tested using Jest and Supertest.

Current CRUD tests cover:

```text
GET     /api/tasks
POST    /api/tasks
PUT     /api/tasks/:id
DELETE  /api/tasks/:id
```

Latest verified test result:

```text
Test Suites: 1 passed
Tests:       4 passed
```

The tests run automatically in Jenkins before Docker images are built.

## Troubleshooting Experience

During development, several infrastructure and deployment problems were investigated and resolved.

### Kubernetes Scheduling

Investigated pod scheduling and node availability during Kubernetes deployment.

### Flannel Networking

Resolved Kubernetes networking issues involving Flannel and Linux inotify limits.

### AWS Load Balancer

Configured the AWS Cloud Controller Manager and NGINX Ingress integration to provision an AWS Network Load Balancer.

### Persistent Storage

Configured the EBS CSI driver and `gp3` StorageClass for MongoDB persistent storage.

### Kubernetes Secrets

Migrated MongoDB credentials away from Helm values and preserved the existing live Secret during the Helm chart update.

### Failed Deployment Recovery

Intentionally deployed a nonexistent container image, diagnosed `ImagePullBackOff`, and successfully performed a Helm rollback.

## Useful Kubernetes Commands

Check cluster nodes:

```bash
kubectl get nodes
```

Check TaskFlow pods:

```bash
kubectl get pods -n taskflow
```

Check deployments:

```bash
kubectl get deployments -n taskflow
```

Check services:

```bash
kubectl get services -n taskflow
```

Check ingress:

```bash
kubectl get ingress -n taskflow
```

Check persistent storage:

```bash
kubectl get pvc -n taskflow
```

View pod logs:

```bash
kubectl logs <pod-name> -n taskflow
```

Describe a pod:

```bash
kubectl describe pod <pod-name> -n taskflow
```

Check Helm releases:

```bash
helm history taskflow -n taskflow
```

Rollback a release:

```bash
helm rollback taskflow <revision> -n taskflow
```

Check Helm status:

```bash
helm status taskflow -n taskflow
```

## DevOps Skills Demonstrated

This project demonstrates hands-on experience with:

* Git and GitHub
* GitHub webhooks
* Jenkins CI/CD
* Jenkins Pipeline
* Automated testing
* Docker
* Docker image versioning
* Docker Hub
* Kubernetes
* Helm
* Kubernetes Deployments
* Kubernetes Services
* ConfigMaps
* Secrets
* PersistentVolumeClaims
* AWS EBS
* EBS CSI
* NGINX Ingress
* AWS Network Load Balancer
* AWS Cloud Controller Manager
* Health probes
* Resource requests and limits
* IAM
* Kubernetes troubleshooting
* Failure analysis
* Helm rollback
* Security hardening

## Future Improvements

Planned improvements include:

* Terraform-based infrastructure provisioning
* Prometheus monitoring
* Grafana dashboards
* Centralized application logging
* HTTPS/TLS
* Custom domain
* Automated rollback strategies
* Expanded automated test coverage
* More advanced Kubernetes deployment strategies
* Application-level observability

## Repository

**GitHub**

https://github.com/jeevan11jacob-svg/task-flow

## Author

**Jeevan Jacob**

B.Tech Artificial Intelligence and Data Science

Cloud & DevOps Engineer

GitHub: https://github.com/jeevan11jacob-svg

LinkedIn: https://www.linkedin.com/in/jeevan-jacob1
