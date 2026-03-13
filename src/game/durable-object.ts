import { MoveSchema, type Move } from "./schema";

export class GameSession {
  state: DurableObjectState;
  sql: SqlStorage;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.sql = state.storage.sql;

    this.sql.execute(`
      CREATE TABLE IF NOT EXISTS moves (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id TEXT NOT NULL,
        x INTEGER NOT NULL,
        y INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected websocket", { status: 426 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    server.accept();

    server.addEventListener("message", (event: MessageEvent) => {
      const data = JSON.parse(typeof event.data === "string" ? event.data : "{}");
      const result = MoveSchema.safeParse(data);

      if (result.success) {
        this.persistMove(result.data);
        this.broadcast(result.data);
      }
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private persistMove(move: Move): void {
    this.sql.execute(
      "INSERT INTO moves (player_id, x, y) VALUES (?, ?, ?)",
      [move.playerId, move.payload.x, move.payload.y]
    );
  }

  private broadcast(move: Move): void {
    const message = JSON.stringify(move);
    this.state.getWebSockets().forEach((ws) => ws.send(message));
  }
}