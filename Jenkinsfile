pipeline {
    agent any

    triggers {
        pollSCM('H/5 * * * *')
    }

    environment {
        AWS_REGION       = 'ap-northeast-2'
        S3_BUCKET        = 'wooriport-frontend-f1032e45'
        CLOUDFRONT_ID    = 'E1P6QMZUPX05TB'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh '''
                    docker run --rm \
                        -v $(pwd):/app \
                        -w /app \
                        node:20-alpine \
                        sh -c "npm ci && npm run build"
                '''
            }
        }

        stage('Deploy to S3') {
            steps {
                sh '''
                    aws s3 sync dist/ s3://${S3_BUCKET}/ \
                        --region ${AWS_REGION} \
                        --delete
                '''
            }
        }

        stage('Invalidate CloudFront') {
            steps {
                sh '''
                    aws cloudfront create-invalidation \
                        --distribution-id ${CLOUDFRONT_ID} \
                        --paths "/*"
                '''
            }
        }
    }

    post {
        success { echo 'Frontend deployed successfully' }
        failure  { echo 'Frontend deployment failed' }
    }
}
