import * as PIXI from "pixi.js";
import { TiledJSON, TiledLayer } from "./parser";

/**
 * Maps Tiled layers to PixiJS containers and handles isometric depth sorting.
 */
export class TiledMapper {
  private container: PIXI.Container;

  constructor() {
    this.container = new PIXI.Container();
  }

  public getRoot(): PIXI.Container {
    return this.container;
  }

  /**
   * Sorts children based on isometric depth (y-axis).
   * Assumes children have a 'zOrder' or 'y' property.
   */
  public sortIsometricChildren(): void {
    this.container.children.sort((a, b) => {
      const ay = (a as PIXI.DisplayObject).y;
      const by = (b as PIXI.DisplayObject).y;
      return ay - by;
    });
  }

  public mapLayer(layer: TiledLayer, _mapData: TiledJSON): PIXI.Container {
    const layerContainer = new PIXI.Container();
    layerContainer.name = layer.name;
    layerContainer.visible = layer.visible;
    layerContainer.alpha = layer.opacity;

    if (layer.type === "tilelayer" && layer.data) {
      // Logic for tile rendering would go here
    } else if (layer.type === "objectgroup" && layer.objects) {
      for (const obj of layer.objects) {
        const sprite = new PIXI.Graphics();
        sprite.beginFill(0xffffff);
        sprite.drawRect(0, 0, obj.width, obj.height);
        sprite.endFill();
        sprite.x = obj.x;
        sprite.y = obj.y;
        layerContainer.addChild(sprite);
      }
    }

    this.container.addChild(layerContainer);
    return layerContainer;
  }
}