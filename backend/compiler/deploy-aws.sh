#!/bin/bash

# AWS Configuration
AWS_REGION="ap-south-1"  # Updated to your region
ECR_REPOSITORY_NAME="code-mon-compiler"

# ✅ CONFIGURED WITH YOUR AWS DETAILS
AWS_ACCOUNT_ID="108782089996"  # Your AWS Account ID
EC2_INSTANCE_ID="i-0baec89de9677acfd"  # Your EC2 Instance ID

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting deployment to AWS...${NC}"

# 1. Build Docker image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
docker build -t $ECR_REPOSITORY_NAME .

# 2. Get ECR login token
echo -e "${YELLOW}🔐 Logging into ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# 3. Create ECR repository if it doesn't exist
echo -e "${YELLOW}🏗️ Creating ECR repository...${NC}"
aws ecr create-repository --repository-name $ECR_REPOSITORY_NAME --region $AWS_REGION 2>/dev/null || echo "Repository already exists"

# 4. Tag and push image to ECR
ECR_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME
echo -e "${YELLOW}🏷️ Tagging image...${NC}"
docker tag $ECR_REPOSITORY_NAME:latest $ECR_URI:latest

echo -e "${YELLOW}⬆️ Pushing to ECR...${NC}"
docker push $ECR_URI:latest

# 5. Deploy to EC2
echo -e "${YELLOW}🖥️ Deploying to EC2...${NC}"
aws ssm send-command \
    --instance-ids $EC2_INSTANCE_ID \
    --document-name "AWS-RunShellScript" \
    --parameters 'commands=[
        "docker pull '$ECR_URI':latest",
        "docker stop compiler-service || true",
        "docker rm compiler-service || true",
        "docker run -d --name compiler-service -p 5001:5001 --restart unless-stopped '$ECR_URI':latest"
    ]' \
    --region $AWS_REGION

echo -e "${GREEN}✅ Deployment completed!${NC}"
echo -e "${GREEN}🌐 Compiler service should be available at: http://YOUR_EC2_PUBLIC_IP:5001${NC}"
echo -e "${YELLOW}📝 Don't forget to update the COMPILER_SERVICE_URL in your backend configuration!${NC}" 