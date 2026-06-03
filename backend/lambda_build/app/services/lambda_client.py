"""
Async AWS Lambda client using aiobotocore.
Creates a fresh client per invocation (safe, no connection pooling issues).
"""

import json
import os

import aiobotocore.session
from botocore.config import Config


class LambdaClient:
    def __init__(self):
        self._session = aiobotocore.session.get_session()
        self._region  = os.getenv("AWS_DEFAULT_REGION", "ap-south-1")
        self._ak      = os.getenv("AWS_ACCESS_KEY_ID")
        self._sk      = os.getenv("AWS_SECRET_ACCESS_KEY")

    async def invoke(self, function_name: str, payload: dict) -> dict:
        """
        Invoke a Lambda function and return the parsed JSON response body.
        Raises RuntimeError if Lambda itself returns a function error.
        """
        config = Config(
            read_timeout=35,
            connect_timeout=5,
            retries={"max_attempts": 1},
        )
        async with self._session.create_client(
            "lambda",
            region_name=self._region,
            config=config,
        ) as client:
            response = await client.invoke(
                FunctionName=function_name,
                InvocationType="RequestResponse",
                Payload=json.dumps(payload),
            )

            result_bytes = await response["Payload"].read()
            result = json.loads(result_bytes)

            # Lambda execution error (e.g. unhandled exception in handler)
            if response.get("FunctionError"):
                error_msg = result.get("errorMessage", str(result))
                raise RuntimeError(f"Lambda execution error: {error_msg}")

            return result
