import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import amazonService from "../logic/amazon-booking-service";

type AddBooksRequest = {
  bookID: string;
  title: string;
  price: number;
  bookQuantity: number;
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

    const payload = JSON.parse(event.body) as Partial<AddBooksRequest>;

    if (
      !payload.bookID ||
      !payload.title ||
      payload.price == null ||
      payload.bookQuantity == null
    ) {
      return json(400, { message: "Missing required fields" });
    }

    const book = amazonService.addBooks(
      payload.bookID,
      payload.title,
      Number(payload.price),
      Number(payload.bookQuantity)
    );

    return json(201, { book });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return json(400, { message });
  }
};