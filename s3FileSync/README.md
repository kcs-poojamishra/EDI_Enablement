# EDIEnablement
This is the Inxeption Application Server for Prism that sits between the AS2 server and prism. Mainly it facilitate to exchange the data to EDI format and back to json

## Get started
* Install npm version 6.12.0 (curl -o- -L https://www.npmjs.com | bash -s -- --version 6.12.0)

* Install nvm (node version manager) to install nodejs (curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.1/install.sh | bash)  For Windows, see https://github.com/coreybutler/nvm-windows

* Install nodeJS version v14.x (nvm install v14.x) then (nvm use v14.x)
* Download the EDIEnablement repo (git clone https://github.com/kcsplcompusoft/EDIEnablement.git)
* Update NodeJS libraries dependencies (npm install)
* Copy .env.template to .env and fill in all the fields
    * AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY - The AWS S3 security id and secret
    * AWS_S3_BUCKET_NAME - The AWS S3 bucket that is used to store/transfer EDI Files
    * AWS_REGION_NAME - The AWS S3 about a specific AWS region 


## Running Server

* Start up s3FileSync build docker docker build -t s3fs .\
* Done, run docker  docker run -it --rm --name s3fs s3fs
* If you want stop docker docker stop s3fs
