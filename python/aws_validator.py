import sys
import json
import boto3
from botocore.exceptions import ClientError



def vaidate_aws_credentials(region, access_key, secret_key, instance_id):
    try :
        ec2 = boto3.client(
            'ec2',
            region_name = region,
            aws_access_key_id = access_key,
            aws_secret_access_key = secret_key
        )


        #try to descript the EC2 Instance 
        response = ec2.describe_instance(InstanceIds=[instance_id])


        return {
            "success" : True,
            "message" : "AWS credentials are validated successfully"
        }
    
    except ClientError as e:
        return {
            "success" : False,
            "message" : f"AWS validation failed : {str(e)}" 
        }
    


