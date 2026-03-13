import { Application, Renderer } from 'pixi.js';

/**
 * Interface defining the layers for the rendering pipeline.
 */
export interface PipelineLayers {
  terrain: 'terrain';
  operatives: 'operatives';
  ui: 'ui';
}

/**
 * Configuration for the PixiJS application.
 */
export const RENDERER_CONFIG = {
  width: 1280,
  height: 720,
  antialias: true,
  preference: 'webgpu' as const,
  fallback: 'webgl' as const,
};

/**
 * Initializes the PixiJS application with WebGPU/WebGL2 support.
 */
export async function initializePipeline(): Promise<Application> {
  const app = new Application();

  await app.init({
    ...RENDERER_CONFIG,
    preference: RENDERER_CONFIG.preference,
  });

  // Ensure the renderer is available and configured
  const renderer = app.renderer as Renderer;

  // Setup basic stage layers
  // Note: PixiJS v8 uses Container hierarchy for layers
  const terrainLayer = new (await import('pixi.js')).Container();
  const operativesLayer = new (await import('pixi.js')).Container();
  const uiLayer = new (await import('pixi.js')).Container();

  terrainLayer.label = 'terrain';
  operativesLayer.label = 'operatives';
  uiLayer.label = 'ui';

  app.stage.addChild(terrainLayer, operativesLayer, uiLayer);

  return app;
}