import sys
import json
import boto3
from botocore.exceptions import ClientError

def validate_aws_credentials(region, access_key, secret_key, instance_id):
    try:
        # Create an EC2 client with the provided credentials
        ec2 = boto3.client(
            'ec2',
            region_name=region,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key
        )

        # Try to describe the EC2 instance
        response = ec2.describe_instances(InstanceIds=[instance_id])

        # Return a success message with JSON format
        print(json.dumps({
            "success": True,
            "message": "AWS credentials are validated successfully"
        }))

    except Exception as e:
        # Return an error message if validation fails
        print(json.dumps({
            "success": False,
            "message": f"AWS validation failed: {str(e)}"
        }))

if __name__ == "__main__":
    # Example usage: Ensure that the script takes input from command-line arguments
    if len(sys.argv) != 5:
        sys.exit(1)

    region = sys.argv[1]
    access_key = sys.argv[2]
    secret_key = sys.argv[3]
    instance_id = sys.argv[4]

    validate_aws_credentials(region, access_key, secret_key, instance_id)
