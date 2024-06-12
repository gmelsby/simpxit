import boto3 #type: ignore
import os
from supabase import create_client, Client
from dotenv import load_dotenv #type: ignore

bucket_name = "images"

load_dotenv()

# read credentials
endpoint: str = os.environ.get("S3_ENDPOINT")
region: str = os.environ.get("S3_REGION")
access_key: str = os.environ.get("S3_ACCESS_KEY")
secret_key: str = os.environ.get("S3_SECRET_KEY")

s3 = boto3.client(
    's3',
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key,
    endpoint_url=endpoint,
    region_name=region,
)

def main():
    paginator = s3.get_paginator('list_objects_v2')
    page_iterator = paginator.paginate(Bucket=bucket_name)
    count = sum(len(page['Contents']) if 'Contents' in page else 0 for page in page_iterator)
    print(f'there are {count} objects in the bucket.')
    
if __name__ == '__main__':
    main()