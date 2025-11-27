import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../constants/errorTypes";

interface Config<TBody> {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  url: RequestInfo;
  body?: TBody;
  baseUrl?: string;
  headers?: HeadersInit;
  /* Allows a consumer to override errors in the 400s */
  customClientErrorHandler?: (response: Response) => void;
}

/**
 * @function handleResponse
 * @param {Object} response - The response object.
 * @description
 *   A handler for the fetch response Object
 * @return {Promise<T>} A promise containing the deserialized response body.
 * */
export async function handleResponse<TData>(
  response: Response,
  customClientErrorHandler?: (response: Response) => void
): Promise<TData> {
  if (response.status === 401) {
    const error = new Error("Unauthorized");
    throw error;
  }

  if (customClientErrorHandler) {
    customClientErrorHandler(response);
  }

  let res;
  try {
    const responseText = await response.text();

    if (!responseText) {
      // Handle empty response
      if (response.ok) {
        return {} as TData;
      } else {
        throw new Error(`HTTP ${response.status}: Empty response`);
      }
    }

    try {
      res = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(
        `Invalid JSON response: ${responseText.substring(0, 100)}...`
      );
    }

    if (!response.ok) {
      if (response.status === 400) {
        throw new BadRequestError(res.message || res.error || "Bad Request");
      }

      if (response.status === 403) {
        throw new ForbiddenError(res.message || res.error || "Forbidden");
      }

      if (response.status === 404) {
        throw new NotFoundError(res.message || res.error || "Not Found");
      }

      throw new Error(res.message || res.error || "Something went wrong");
    }
  } catch (err) {
    // if the status is 204, trying to parse the body will throw an error, so we should catch
    // but do nothing
    // In future we need to update error handling as well
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error("Unknown error occurred");
  }

  return res;
}

export async function fetchWrapper<TData, TBody = unknown>({
  method = "GET",
  url,
  body,
  baseUrl = "http://localhost:5000/api",
  customClientErrorHandler,
  ...additionalOptions
}: Config<TBody>): Promise<TData> {
  const isFormData = body instanceof FormData;

  const options = {
    ...additionalOptions,
    method: method,
    headers: {
      ...(additionalOptions.headers || {}),
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined, // body can be undefined, that's ok
  };
  const _url = `${baseUrl}/${url}`;

  const response = await fetch(_url, options);
  const data = await handleResponse<TData>(response, customClientErrorHandler);
  return data;
}
