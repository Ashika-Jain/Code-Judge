# AWS Configuration
$AWS_REGION = "ap-south-1"
$ECR_REPOSITORY_NAME = "code-mon-compiler"
$AWS_ACCOUNT_ID = "108782089996"
$EC2_INSTANCE_ID = "i-0baec89de9677acfd"

Write-Host "Starting deployment to AWS..." -ForegroundColor Yellow

# 1. Build Docker image
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -t $ECR_REPOSITORY_NAME .

# 2. Get ECR login token
Write-Host "Logging into ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# 3. Create ECR repository if it doesn't exist
Write-Host "Creating ECR repository..." -ForegroundColor Yellow
aws ecr create-repository --repository-name $ECR_REPOSITORY_NAME --region $AWS_REGION 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Repository already exists" -ForegroundColor Green
}

# 4. Tag and push image to ECR
$ECR_URI = "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME"
Write-Host "Tagging image..." -ForegroundColor Yellow
docker tag $ECR_REPOSITORY_NAME`:latest $ECR_URI`:latest

Write-Host "Pushing to ECR..." -ForegroundColor Yellow
docker push $ECR_URI`:latest

# 5. Deploy to EC2
Write-Host "Deploying to EC2..." -ForegroundColor Yellow
$commands = @(
    "docker pull $ECR_URI`:latest",
    "docker stop compiler-service 2>`$null; true",
    "docker rm compiler-service 2>`$null; true",
    "docker run -d --name compiler-service -p 5001:5001 --restart unless-stopped $ECR_URI`:latest"
)

aws ssm send-command `
    --instance-ids $EC2_INSTANCE_ID `
    --document-name "AWS-RunShellScript" `
    --parameters "commands=[$($commands -join ',')]" `
    --region $AWS_REGION

Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "Compiler service should be available at: http://YOUR_EC2_PUBLIC_IP:5001" -ForegroundColor Green
Write-Host "Don't forget to update the COMPILER_SERVICE_URL in your backend configuration!" -ForegroundColor Yellow 