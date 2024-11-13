import jwt from "jsonwebtoken";

const JWT_SECRET= process.env.JWT_SECRET as string;

export async function authenticateAccessToken(
  accessToken: string,
): Promise<Object> {
  return new Promise<Object>((resolve, reject) => {
    jwt.verify(
      accessToken,
      JWT_SECRET,
      async (err: Error | null, decoded: Object | undefined) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded as Object);
        }
      },
    );
  });
}