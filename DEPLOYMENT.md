# Deployment Guide

This guide covers deploying the Code-Mon application across multiple services:
- **Compiler Service**: Docker → AWS ECR → EC2
- **Backend API**: Render
- **Frontend**: Vercel

## Architecture Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend   │    │  Compiler   │
│   (Vercel)  │◄──►│   (Render)  │◄──►│   (AWS EC2) │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 1. Compiler Service (AWS ECR + EC2)

### Prerequisites
- AWS CLI configured
- Docker installed
- EC2 instance with Docker installed
- IAM permissions for ECR and EC2

### Steps

1. **Navigate to compiler directory:**
   ```bash
   cd backend/compiler
   ```

2. **Update the deployment script:**
   - Edit `deploy-aws.sh`
   - Replace `your-ec2-instance-id` with your actual EC2 instance ID
   - Update `AWS_REGION` if needed

3. **Deploy:**
   ```bash
   chmod +x deploy-aws.sh
   ./deploy-aws.sh
   ```

4. **Get your EC2 public IP** and note it for the next steps.

## 2. Backend API (Render)

### Steps

1. **Push your code to GitHub**

2. **Connect to Render:**
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository
   - Create a new Web Service

3. **Configure the service:**
   - **Name**: `code-mon-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

4. **Set Environment Variables:**
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret
   - `COMPILER_SERVICE_URL`: `http://your-ec2-public-ip:5001`

5. **Deploy**

## 3. Frontend (Vercel)

### Steps

1. **Push your code to GitHub**

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

3. **Configure the project:**
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Set Environment Variables:**
   - `VITE_API_BASE_URL`: Your Render backend URL (e.g., `https://your-app.onrender.com`)

5. **Deploy**

## 4. Update URLs

After deployment, update these files with your actual URLs:

### Backend (render.yaml)
```yaml
- key: COMPILER_SERVICE_URL
  value: "http://your-ec2-public-ip:5001"
```

### Frontend (axiosConfig.js)
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 
  (import.meta.env.PROD ? 'https://your-render-backend-url.onrender.com' : 'http://localhost:5000');
```

## 5. Testing

1. **Test Compiler Service:**
   ```bash
   curl -X POST http://your-ec2-public-ip:5001/run \
     -H "Content-Type: application/json" \
     -d '{"code":"print(\"Hello World\")","language":"python","input":""}'
   ```

2. **Test Backend API:**
   ```bash
   curl https://your-render-backend-url.onrender.com/
   ```

3. **Test Frontend:**
   - Visit your Vercel URL
   - Try logging in and submitting code

## 6. Security Considerations

### EC2 Security Group
- Open port 5001 for the compiler service
- Restrict access to only your Render backend IP if possible

### Environment Variables
- Never commit sensitive data to Git
- Use environment variables for all secrets
- Rotate JWT secrets regularly

### CORS Configuration
- Update CORS settings in your backend to allow your Vercel domain

## 7. Monitoring

### AWS CloudWatch
- Monitor EC2 instance metrics
- Set up alarms for high CPU/memory usage

### Render
- Monitor application logs
- Set up health checks

### Vercel
- Monitor build and deployment status
- Check analytics

## 8. Troubleshooting

### Common Issues

1. **Compiler service not responding:**
   - Check EC2 security group
   - Verify Docker container is running
   - Check EC2 instance logs

2. **Backend can't connect to compiler:**
   - Verify COMPILER_SERVICE_URL is correct
   - Check network connectivity
   - Verify EC2 instance is running

3. **Frontend can't connect to backend:**
   - Check CORS configuration
   - Verify VITE_API_BASE_URL is correct
   - Check Render service status

### Logs
- **EC2**: `docker logs compiler-service`
- **Render**: Check dashboard logs
- **Vercel**: Check deployment logs 