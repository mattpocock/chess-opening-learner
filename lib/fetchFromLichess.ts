import { z } from "zod";

const token = `lip_HWP98gS7ppnOGi22SY4k`;

const get = async <Result extends {}>(
  url: string,
  resultSchema: z.ZodObject<any, any, any, Result>,
): Promise<Result> => {
  const urlWithQuery = `${url}`;
  const result = await fetch(urlWithQuery, {
    method: "GET",
    // headers: {
    //   Authorization: `Bearer ${token}`,
    // },
  }).then((res) => res.json());

  return resultSchema.parse(result);
};

export const lichess = {
  get,
};
