import { RollHandler } from "../rollHandler.js";
import * as settings from "../../settings.js";

export class RollHandlerBaseWfrp4e extends RollHandler {
  constructor() {
    super();
  }

  async doHandleActionEvent(event, encodedValue) {
    let payload = encodedValue.split("^");
    if (payload.length != 3) {
      super.throwInvalidValueErr();
    }

    let macroType = payload[0];
    let tokenId = payload[1];
    let actionId = payload[2];

    let actor = super.getActor(tokenId);
    let bypassData = { bypass: !!event.shiftKey };

    if (macroType === "characteristic")
      return actor
        .setupCharacteristic(actionId, bypassData)
        .then((setupData) => actor.basicTest(setupData));

    if (this.isRenderItem()) return this.doRenderItem(tokenId, actionId);

    let item = actor.items.get(actionId);
    let itemData;

    if (this.rightClick) return item.postItem();

    switch (macroType) {
      case "dodge":
        return this.dodge(actor);
      case "unarmed":
        return this.unarmed(actor);
      case "stomp":
        return this.stomp(actor);
      case "improvise":
        return this.improvise(actor);
      case "weapon": {
        let promise = actor.setupWeapon(item, bypassData);
        if (!(item.loading && !item.loaded.value)) {
          return promise.then((setupData) => actor.weaponTest(setupData));
        } else {
          break; // do nothing, setupweapon will show skill test dialog for reload.
        }
      }
      case "spell":
        return this.castSpell(actor, item, bypassData);
      case "prayer":
        return actor
          .setupPrayer(item, bypassData)
          .then((setupData) => actor.prayerTest(setupData));
      case "trait":
      case "talent":
        if (item.rollable?.value)
          return actor
            .setupTrait(item, bypassData)
            .then((setupData) => actor.traitTest(setupData));
        else return item.postItem();
      case "skill":
        return actor
          .setupSkill(item, bypassData)
          .then((setupData) => actor.basicTest(setupData));
      case "utility":
        if (actionId = "endTurn") {
          if (game.combat?.current?.tokenId === tokenId) await game.combat?.nextTurn();
        }
        break;
    }
  }

  dodge(actor) {
    let skill = actor
      .getItemTypes("skill")
      .find((s) => s.name == game.i18n.localize("NAME.Dodge"));
    if (skill) {
      actor.setupSkill(skill).then((setupData) => {
        actor.basicTest(setupData);
      });
    } else {
      actor.setupCharacteristic("ag", { dodge: true }).then((setupData) => {
        actor.basicTest(setupData);
      });
    }
  }

  unarmed(actor) {
    let unarmed = game.wfrp4e.config.systemItems.unarmed;
    actor.setupWeapon(unarmed).then((setupData) => {
      actor.weaponTest(setupData);
    });
  }

  stomp(actor) {
    let stomp = game.wfrp4e.config.systemItems.stomp;
    actor.setupTrait(stomp).then((setupData) => {
      actor.traitTest(setupData);
    });
  }

  improvise(actor) {
    let improv = game.wfrp4e.config.systemItems.improv;
    actor.setupWeapon(improv).then((setupData) => {
      actor.weaponTest(setupData);
    });
  }

  castSpell(actor, itemData, bypassData) {
    if (actor.spellDialog) return actor.spellDialog(itemData, bypassData);
    else return actor.sheet.spellDialog(itemData, bypassData);
  }
}
