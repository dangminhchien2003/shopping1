import type { ListBase$SelectionChangeEvent } from "sap/m/ListBase";
import type Router from "sap/ui/core/routing/Router";
import Base from "./Base.controller";
import type { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import type { WorkflowNode } from "../types/pages/main";
import type Tree from "sap/m/Tree";
import type TreeItemBase from "sap/m/TreeItemBase";
import HashChanger from "sap/ui/core/routing/HashChanger";

/**
 * @namespace com.sphinxjsc.shopping1.controller
 */
export default class Main extends Base {
  private router: Router;

  /*eslint-disable @typescript-eslint/no-empty-function*/
  public override onInit(): void {
    this.router = this.getRouter();

    this.router.getRoute("TargetMain")?.attachPatternMatched(this.onRouteMatched, this);
    this.router.getRoute("detail")?.attachPatternMatched(this.onRouteMatched, this);
  }

  public override onAfterRendering() {
    const tree = this.getControlById<Tree>("tree");

    tree.attachEventOnce("updateFinished", () => {
      // lấy step/substep hiện tại từ URL
      const hash = HashChanger.getInstance().getHash();
      const match = hash.match(/detail\/([^/]+)\/([^/]+)/);

      if (!match) return;

      const [, step, substep] = match;

      const items = <TreeItemBase[]>tree.getItems();

      // tìm đúng item theo Step + Substep
      const targetItem = items.find((item) => {
        const ctx = item.getBindingContext("workflow");
        if (!ctx) return false;

        const node = <WorkflowNode>ctx.getObject();
        return node.Step === step && node.Substep === substep;
      });

      if (targetItem) {
        tree.setSelectedItem(targetItem);
      }
    });
  }

  public onSelectionChange(event: ListBase$SelectionChangeEvent): void {
    const ctx = event.getParameter("listItem")?.getBindingContext("workflow");
    if (!ctx) return;

    const node = <WorkflowNode>ctx.getObject();

    if (!node.Substep) return;

    this.getRouter().navTo("detail", {
      step: node.Step,
      substep: node.Substep,
      layout: "TwoColumnsMidExpanded",
    });
  }

  private onRouteMatched = (event: Route$PatternMatchedEvent) => {};

  public getTreeIcon(substep?: string): string {
    return substep ? "sap-icon://folder" : "sap-icon://folder-blank";
  }
}
