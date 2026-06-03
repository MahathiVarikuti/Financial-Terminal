import boto3
from datetime import datetime, timedelta

client = boto3.client('logs', region_name='ap-south-1')
log_group = '/aws/lambda/fintech-monte-carlo'

try:
    response = client.filter_log_events(
        logGroupName=log_group,
        startTime=int((datetime.now() - timedelta(minutes=15)).timestamp() * 1000)
    )
    for event in response.get('events', []):
        print(event['message'].strip())
except Exception as e:
    print(f"Failed to fetch logs: {e}")
