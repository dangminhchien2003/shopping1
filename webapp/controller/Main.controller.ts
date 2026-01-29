import type { ListBase$SelectionChangeEvent } from "sap/m/ListBase";
import type Router from "sap/ui/core/routing/Router";
import Base from "./Base.controller";
import type { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import type { WorkflowNode } from "../types/pages/main";
import type Tree from "sap/m/Tree";

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
    const items = tree.getItems();

    if (items.length > 0) {
      tree.setSelectedItem(items[0]);
    }
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
