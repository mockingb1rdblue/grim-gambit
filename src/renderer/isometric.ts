import { Container, Sprite, Texture } from 'pixi.js';

export class IsometricRenderer {
  private container: Container;
  private tileSize = 64;

  constructor() {
    this.container = new Container();
  }

  public render(entities: { x: number; y: number }[]): void {
    this.container.removeChildren();
    
    entities.forEach((entity) => {
      const sprite = new Sprite(Texture.WHITE);
      const isoX = (entity.x - entity.y) * (this.tileSize / 2);
      const isoY = (entity.x + entity.y) * (this.tileSize / 4);
      
      sprite.position.set(isoX, isoY);
      this.container.addChild(sprite);
    });
  }

  public getStage(): Container {
    return this.container;
  }
}