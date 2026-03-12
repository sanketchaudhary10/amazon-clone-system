import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import amazonService from "../logic/amazon-booking-service";

type AddToCartRequest = {
  bookID: string;
  userID: string;
  quantity: number;
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

    const payload = JSON.parse(event.body) as Partial<AddToCartRequest>;

    if (
      !payload.bookID ||
      !payload.userID ||
      payload.quantity == null ||
      !payload.bookingID
    ) {
      return json(400, { message: "Missing required fields" });
    }

    const booking = amazonService.addToCart(
      payload.bookID,
      payload.userID,
      Number(payload.quantity),
      payload.bookingID
    );

    return json(201, { booking });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return json(400, { message });
  }
};