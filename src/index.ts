import { z } from 'zod';

/**
 * Imagen 3 API Response Schemas
 */
export const ImagenResponseSchema = z.object({
  predictions: z.array(
    z.object({
      bytesBase64Encoded: z.string(),
      mimeType: z.string(),
    })
  ),
});

export type ImagenResponse = z.infer<typeof ImagenResponseSchema>;

/**
 * Isometric Prompt Template
 */
export const getIsometricPrompt = (subject: string): string => `
  An isometric 3D render of ${subject}, high detail, 
  clean studio lighting, soft shadows, pastel background, 
  low poly art style, 8k resolution, trending on ArtStation.
`;

/**
 * Cloudflare Worker Handler
 */
export default {
  async fetch(request: Request, env: { GOOGLE_API_KEY: string }): Promise<Response> {
    const url = 'https://us-central1-aiplatform.googleapis.com/v1/projects/my-project/locations/us-central1/publishers/google/models/imagen-3.0:predict';

    try {
      const body = await request.json();
      const { prompt } = z.object({ prompt: z.string() }).parse(body);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GOOGLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{ prompt: getIsometricPrompt(prompt) }],
          parameters: { sampleCount: 1 },
        }),
      });

      if (!response.ok) {
        throw new Error(`Imagen API error: ${response.statusText}`);
      }

      const data = await response.json();
      const validatedData = ImagenResponseSchema.parse(data);

      return new Response(JSON.stringify(validatedData), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return new Response(JSON.stringify({ error: errorMessage }), { status: 400 });
    }
  },
};