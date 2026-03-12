import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import amazonService from "../logic/amazon-booking-service";

type PlaceOrderRequest = {
  orderID: string;
  userID: string;
  bookingID: string;
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

    const payload = JSON.parse(event.body) as Partial<PlaceOrderRequest>;

    if (!payload.orderID || !payload.userID || !payload.bookingID) {
      return json(400, { message: "Missing required fields" });
    }

    const order = amazonService.placeOrder(
      payload.orderID,
      payload.userID,
      payload.bookingID
    );

    return json(201, { order });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return json(400, { message });
  }
};