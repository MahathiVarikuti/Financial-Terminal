import boto3
import json
import os
import mimetypes

bucket_name = "fintech-engine-frontend-vk-2026"
region = "ap-south-1"
s3 = boto3.client('s3', region_name=region)

print(f"Creating bucket {bucket_name}...")
try:
    s3.create_bucket(
        Bucket=bucket_name,
        CreateBucketConfiguration={'LocationConstraint': region}
    )
except s3.exceptions.BucketAlreadyOwnedByYou:
    print("Bucket already exists, proceeding...")
except Exception as e:
    if "BucketAlreadyOwnedByYou" in str(e):
        pass
    else:
        raise

print("Enabling website hosting...")
s3.put_bucket_website(
    Bucket=bucket_name,
    WebsiteConfiguration={
        'ErrorDocument': {'Key': 'index.html'},
        'IndexDocument': {'Suffix': 'index.html'},
    }
)

print("Removing Public Access Block...")
s3.put_public_access_block(
    Bucket=bucket_name,
    PublicAccessBlockConfiguration={
        'BlockPublicAcls': False,
        'IgnorePublicAcls': False,
        'BlockPublicPolicy': False,
        'RestrictPublicBuckets': False
    }
)

print("Applying bucket policy...")
policy = {
    "Version": "2012-10-17",
    "Statement": [{
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": ["s3:GetObject"],
        "Resource": [f"arn:aws:s3:::{bucket_name}/*"]
    }]
}
s3.put_bucket_policy(Bucket=bucket_name, Policy=json.dumps(policy))

print("Uploading files...")
dist_dir = "dist"
for root, dirs, files in os.walk(dist_dir):
    for file in files:
        local_path = os.path.join(root, file)
        s3_key = os.path.relpath(local_path, dist_dir)
        content_type, _ = mimetypes.guess_type(local_path)
        if content_type is None:
            content_type = "application/octet-stream"
        
        s3.upload_file(
            local_path, bucket_name, s3_key,
            ExtraArgs={'ContentType': content_type}
        )

print(f"Deployment complete: https://{bucket_name}.s3.{region}.amazonaws.com/index.html")
