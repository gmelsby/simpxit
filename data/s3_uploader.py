import boto3 #type: ignore
import os
from supabase import create_client, Client
from dotenv import load_dotenv #type: ignore
from pathlib import Path

folder_name = "./images/"
bucket_name = "images"

load_dotenv()

# read credentials
endpoint: str = os.environ.get("S3_ENDPOINT")
region: str = os.environ.get("S3_REGION")
access_key: str = os.environ.get("S3_ACCESS_KEY")
secret_key: str = os.environ.get("S3_SECRET_KEY")

s3 = boto3.resource(
    's3',
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key,
    endpoint_url=endpoint,
    region_name=region,
)

def main():
    bucket = s3.Bucket(bucket_name)
    image_paths = Path(folder_name).glob('*.webp')
    count = 0
    for i, image in enumerate(image_paths):
        bucket.upload_file(str(image), Path(image).name, ExtraArgs={'ContentType': 'image/webp'})
        count = i + 1
        print(f'  {('\\', '|', '/', '|')[i % 4]} uploaded {count} files', end='\r')

    print(f'uploaded {count} files')
    
if __name__ == '__main__':
    main()