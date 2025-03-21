import { RollHandler } from "../rollHandler.js";

// Could potentially handle rolls from exampleActionHandler ('../actions/exampleActionHandler.js')
export class RollHandlerBaseSWN extends RollHandler {
  constructor() {
    super();
  }

  /** @override */
  doHandleActionEvent(event, encodedValue) {
    let payload = encodedValue.split("^");

    if (payload.length != 3) {
      super.throwInvalidValueErr();
    }

    let macroType = payload[0];
    let tokenId = payload[1];
    let actionId = payload[2];

    let actor = super.getActor(tokenId);

    switch (macroType) {
      case "item":
        this.rollItemMacro(event, actor, actionId);
        break;
      default:
        this.rollItemMacro(event, actor, actionId);
        break;
    }
  }

  rollItemMacro(event, actor, actionId) {
    actor.items.get(actionId).roll();
  }

}
