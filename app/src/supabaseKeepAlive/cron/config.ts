import { z } from 'zod';

const configSchema = z.object({
    API_URL: z.string().optional(),
});

export type Config = z.infer<typeof configSchema>;

export const initConfig = (): Config => {
    const config = configSchema.parse(process.env);
    return config;
};
