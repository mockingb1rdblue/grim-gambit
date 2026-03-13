import * as PIXI from 'pixi.js';
import { TiledMap, TiledLayer } from './parser';

/** Renderer for Tiled Maps using PixiJS optimized containers. */
export class TiledRenderer {
  private textureCache: Map<string, PIXI.Texture> = new Map();
  private container: PIXI.Container;

  constructor() {
    this.container = new PIXI.Container();
  }

  public getRoot(): PIXI.Container {
    return this.container;
  }

  /** Renders a layer into an optimized PIXI.ParticleContainer or standard Container. */
  public renderLayer(map: TiledMap, layer: TiledLayer): PIXI.Container {
    const layerContainer = new PIXI.Container();
    
    if (layer.type !== 'tilelayer' || !layer.data) return layerContainer;

    const { data, width, height } = layer;
    if (width === undefined || height === undefined) return layerContainer;

    // Use a sprite batching approach
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const gid = data[y * width + x];
        if (gid === 0) continue;

        const texture = this.getTileTexture(map, gid);
        const sprite = new PIXI.Sprite(texture);
        
        sprite.x = x * map.tilewidth;
        sprite.y = y * map.tileheight;
        layerContainer.addChild(sprite);
      }
    }

    return layerContainer;
  }

  private getTileTexture(map: TiledMap, gid: number): PIXI.Texture {
    const tileset = map.tilesets.find(t => gid >= t.firstgid) ?? map.tilesets[0];
    const cacheKey = `tileset_${tileset.firstgid}_${gid}`;

    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    // Logic to extract sub-texture from tileset image
    // Note: In a real implementation, we would load the base texture once
    const baseTexture = PIXI.Texture.WHITE; // Placeholder
    const texture = new PIXI.Texture(
      baseTexture.baseTexture,
      new PIXI.Rectangle(0, 0, tileset.tilewidth, tileset.tileheight)
    );

    this.textureCache.set(cacheKey, texture);
    return texture;
  }
}