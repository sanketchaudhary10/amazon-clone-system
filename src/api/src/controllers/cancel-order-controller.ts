import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import amazonService from "../logic/amazon-booking-service";

type CancelOrderRequest = {
  orderID: string;
  userID: string;
};

const json = (
  statusCode: number,
  body: unknown
): APIGatewayProxyStructuredResultV2 => ({
  statusCode,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  try {
    if (!event.body) {
      return json(400, { message: "Request body is required" });
    }

    const payload = JSON.parse(event.body) as Partial<CancelOrderRequest>;

    if (!payload.orderID || !payload.userID) {
      return json(400, { message: "Missing required fields" });
    }

    const order = amazonService.cancelOrder(
      payload.orderID,
      payload.userID
    );

    return json(200, { order });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return json(400, { message });
  }
};