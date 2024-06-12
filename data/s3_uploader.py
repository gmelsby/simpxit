import boto3 #type: ignore
from botocore.exceptions import ClientError #type: ignore
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

s3 = boto3.client(
    's3',
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key,
    endpoint_url=endpoint,
    region_name=region,
)

def main():
    image_paths = Path(folder_name).glob('*.webp')
    uploaded_count = 0
    existing_count = 0
    for i, image in enumerate(image_paths):
        try:
            s3.head_object(Bucket=bucket_name, Key=str(image.name))
            existing_count += 1
        except ClientError:
            s3.upload_file(str(image), bucket_name, str(image.name), ExtraArgs={'ContentType': 'image/webp'})
            uploaded_count += 1

        print(f'  {('\\', '|', '/', '|')[i % 4]} {uploaded_count} files uploaded | {existing_count} files already in bucket | {existing_count + uploaded_count} total files processed', end='\r')

    print(f'{uploaded_count + existing_count} files processed')

    
if __name__ == '__main__':
    main()